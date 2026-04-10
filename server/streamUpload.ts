/**
 * Sistema de streaming para uploads eficientes
 *
 * Uploads sem buffer no navegador: arquivo vai direto do disco do usuário
 * para o servidor via XHR FormData → busboy salva em tmp → stream para R2.
 */

import * as fs from 'fs-extra';
import { createWriteStream, createReadStream, ReadStream } from 'fs';
import { stat, unlink, readdir } from 'fs/promises';
import * as path from 'path';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import busboy from 'busboy';
import { Request, Response, NextFunction } from 'express';
import { r2Client, BUCKET_NAME, generateUniqueFileName } from './r2';
import { pipeline } from 'stream/promises';

// Pasta temporária para arquivos durante o streaming
const TMP_DIR = path.join(process.cwd(), 'tmp');

// Garantir que o diretório existe
fs.ensureDirSync(TMP_DIR);

// Limpeza periódica de arquivos ANTIGOS no tmp (>30 min) — nunca apaga o dir todo
// para não derrubar uploads em andamento.
setInterval(async () => {
  try {
    const now = Date.now();
    const files = await readdir(TMP_DIR);
    for (const file of files) {
      const filePath = path.join(TMP_DIR, file);
      try {
        const { mtimeMs } = await stat(filePath);
        if (now - mtimeMs > 30 * 60 * 1000) {
          await unlink(filePath);
        }
      } catch {
        // arquivo já foi removido por outro processo — ok
      }
    }
  } catch (err) {
    console.error('[tmp-cleanup] Erro na limpeza periódica:', err);
  }
}, 15 * 60 * 1000); // a cada 15 min, mas só remove arquivos >30 min

interface UploadedFile {
  fieldname: string;
  originalname: string;
  filename: string;
  mimetype: string;
  path: string;
  size: number;
}

interface StreamUploadOptions {
  maxFileSize?: number;
}

/**
 * Faz streaming direto de um arquivo temporário para o R2.
 * Nunca carrega o arquivo inteiro em memória.
 */
export async function processAndStreamToR2(
  filePath: string,
  fileName: string,
  contentType: string,
  _applyWatermark: boolean = false
): Promise<{ url: string; key: string }> {
  let fileStream: ReadStream | null = null;

  try {
    fileStream = createReadStream(filePath);

    fileStream.on('error', (err) => {
      console.error(`[R2 stream] Erro ao ler ${fileName}:`, err.message);
      if (fileStream && !fileStream.destroyed) fileStream.destroy();
    });

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
        ContentType: contentType,
      })
    );

    const cdnBase = process.env.R2_PUBLIC_URL || 'https://cdn.fottufy.com';
    return { url: `${cdnBase}/${fileName}`, key: fileName };
  } catch (err) {
    console.error(`[R2 stream] Falha no upload de ${fileName}:`, err instanceof Error ? err.message : err);
    throw err;
  } finally {
    if (fileStream && !fileStream.destroyed) {
      fileStream.destroy();
      fileStream = null;
    }
  }
}

/**
 * Middleware de upload multipart via busboy.
 *
 * FIX (race condition): o evento `file` do busboy é síncrono, mas o corpo
 * do handler é async. O evento `finish` dispara quando todos os bytes de
 * rede foram consumidos — mas as promises de escrita em disco podem ainda
 * estar pendentes. Solução: acumular as promises e aguardar todas antes
 * de chamar `next()`.
 */
export function streamUploadMiddleware(options: StreamUploadOptions = {}) {
  const { maxFileSize = 500 * 1024 * 1024 } = options; // 500 MB por arquivo

  return (req: Request & { files?: UploadedFile[] }, res: Response, next: NextFunction) => {
    if (!req.is('multipart/form-data')) {
      return next();
    }

    req.files = [];

    let bbError: Error | null = null;
    // Acumular todas as promises de processamento de arquivo
    const filePromises: Promise<void>[] = [];

    let bb: ReturnType<typeof busboy>;
    try {
      bb = busboy({
        headers: req.headers,
        limits: { fileSize: maxFileSize },
      });
    } catch (err) {
      return next(err);
    }

    // Campos de formulário
    bb.on('field', (fieldname, val) => {
      if (!req.body) req.body = {};
      req.body[fieldname] = val;
    });

    // Cada arquivo recebido: iniciar promise de processamento imediatamente
    bb.on('file', (fieldname, fileStream, fileInfo) => {
      const { filename, mimeType } = fileInfo;

      // Se o arquivo exceder o limite, busboy já trunca — apenas logar
      fileStream.on('limit', () => {
        console.warn(`[busboy] Arquivo ${filename} excedeu o limite de tamanho e foi truncado`);
        fileStream.resume();
      });

      fileStream.on('error', (err) => {
        console.error(`[busboy] Erro no fileStream de ${filename}:`, err.message);
        if (!fileStream.destroyed) fileStream.destroy();
      });

      const uniqueFilename = generateUniqueFileName(filename);
      const tmpFilePath = path.join(TMP_DIR, uniqueFilename);

      // Acumular a promise — NÃO await aqui para não bloquear busboy
      const p = (async () => {
        try {
          const writeStream = createWriteStream(tmpFilePath);

          writeStream.on('error', (err) => {
            console.error(`[busboy] Erro ao gravar ${tmpFilePath}:`, err.message);
          });

          await pipeline(fileStream, writeStream);

          const { size } = await stat(tmpFilePath);

          req.files!.push({
            fieldname,
            originalname: filename.normalize('NFC'),
            filename: uniqueFilename,
            mimetype: mimeType,
            path: tmpFilePath,
            size,
          });
        } catch (err) {
          console.error(`[busboy] Falha ao processar arquivo ${filename}:`, err instanceof Error ? err.message : err);
          // Limpar arquivo incompleto se existir
          try { await unlink(tmpFilePath); } catch { /* já removido */ }
        }
      })();

      filePromises.push(p);
    });

    // finish = todos os bytes de rede consumidos; ainda precisamos esperar
    // as promises de escrita em disco antes de passar para a rota.
    bb.on('finish', () => {
      Promise.allSettled(filePromises)
        .then(() => {
          if (bbError) return next(bbError);
          next();
        })
        .catch((err) => next(err));
    });

    bb.on('error', (err) => {
      bbError = err instanceof Error ? err : new Error(String(err));
      console.error('[busboy] Erro global:', bbError.message);
      // finish ainda pode disparar após error — deixar o flag cuidar disso
    });

    req.pipe(bb);
  };
}

/**
 * Middleware de limpeza: remove arquivos temporários após o response ser enviado.
 * Executa a limpeza em background (não bloqueia a resposta).
 */
export function cleanupTempFiles(
  req: Request & { files?: UploadedFile[] },
  res: Response,
  next: NextFunction
) {
  const originalEnd = res.end.bind(res);

  res.end = function (this: any, ...args: any[]) {
    const filesToClean = [...(req.files ?? [])];
    req.files = []; // liberar referência imediatamente

    // Limpeza em background — não atrasa a resposta
    setImmediate(() => {
      Promise.allSettled(
        filesToClean.map((f) =>
          unlink(f.path).catch((err) => {
            if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
              console.error(`[cleanup] Erro ao remover ${f.path}:`, err.message);
            }
          })
        )
      );
    });

    return originalEnd(...args);
  };

  next();
}
