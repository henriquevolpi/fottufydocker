/**
 * Fila de geração de thumbnails com Sharp
 * Concorrência 1 para manter uso de memória baixo (512MB RAM)
 */

import sharp from 'sharp';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from './r2';
import { db } from './db';
import { photos, newProjects } from '@shared/schema';
import { eq, or, inArray, sql } from 'drizzle-orm';

interface ThumbnailJob {
  photoId: string;
  filename: string;
}

const queue: ThumbnailJob[] = [];
let isProcessing = false;

async function processNext(): Promise<void> {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const job = queue.shift()!;

  try {
    console.log(`[Thumb] Iniciando para ${job.filename} (${queue.length} restantes na fila)`);

    await db.update(photos)
      .set({ processingStatus: 'processing' })
      .where(eq(photos.id, job.photoId));

    const getRes = await r2Client.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: job.filename,
    }));

    if (!getRes.Body) throw new Error('R2: body vazio na resposta');

    const chunks: Buffer[] = [];
    for await (const chunk of getRes.Body as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const thumbBuffer = await sharp(buffer, {
      sequentialRead: true,
      limitInputPixels: 100_000_000,
    })
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const baseName = job.filename.replace(/\.[^.]+$/, '');
    const thumbFilename = `thumb_${baseName}.jpg`;

    await r2Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: thumbFilename,
      Body: thumbBuffer,
      ContentType: 'image/jpeg',
    }));

    const cdnBase = process.env.R2_PUBLIC_URL || 'https://cdn.fottufy.com';
    const thumbnailUrl = `${cdnBase}/${thumbFilename}`;

    await db.update(photos)
      .set({ thumbnailUrl, processingStatus: 'ready' })
      .where(eq(photos.id, job.photoId));

    console.log(`[Thumb] ✅ Gerado: ${thumbFilename}`);
  } catch (err) {
    console.error(`[Thumb] ❌ Erro ao processar ${job.filename}:`, err);
    try {
      await db.update(photos)
        .set({ processingStatus: 'error' })
        .where(eq(photos.id, job.photoId));
    } catch (_) {}
  } finally {
    isProcessing = false;
    setImmediate(processNext);
  }
}

export function enqueueThumbnail(job: ThumbnailJob): void {
  queue.push(job);
  if (!isProcessing) processNext();
}

export function getQueueLength(): number {
  return queue.length + (isProcessing ? 1 : 0);
}

/**
 * Inicializa a fila buscando APENAS fotos V2 (associadas a newProjects UUID)
 * com processamento incompleto. Chamado uma vez na inicialização do servidor.
 */
export async function initThumbnailQueue(): Promise<void> {
  try {
    // Busca apenas fotos com pending/processing que pertencem a projetos V2 (UUID)
    const pending = await db.execute(sql`
      SELECT p.id, p.filename 
      FROM photos p
      INNER JOIN new_projects np ON np.id::text = p.project_id
      WHERE p.processing_status IN ('pending', 'processing')
        AND p.filename IS NOT NULL
        AND p.filename != ''
    `);

    const rows = pending.rows as Array<{ id: string; filename: string }>;

    if (rows.length === 0) {
      console.log('[Thumb] Nenhuma foto V2 pendente encontrada na inicialização.');
      return;
    }

    console.log(`[Thumb] Reenfileirando ${rows.length} foto(s) V2 pendente(s)...`);
    for (const p of rows) {
      enqueueThumbnail({ photoId: p.id, filename: p.filename });
    }
  } catch (err) {
    console.error('[Thumb] Erro ao buscar fotos V2 pendentes:', err);
  }
}
