/**
 * Utilitário para redimensionamento de imagens no front-end
 * Configuração padrão: largura máxima de 970px, qualidade 90%
 * Inclui gerenciamento automático de memória para uploads grandes
 */

import imageCompression from 'browser-image-compression';

/**
 * Função utilitária para limpeza de recursos de canvas
 * Usado internamente pela biblioteca de compressão quando necessário
 */
function cleanupCanvas(canvas: HTMLCanvasElement | null): void {
  if (canvas) {
    try {
      canvas.width = 0;
      canvas.height = 0;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (e) {
      // Ignorar erros de limpeza
    }
  }
}

/**
 * Função OTIMIZADA para limpeza agressiva de memória
 * Mais frequente e inteligente para dispositivos limitados
 */
function aggressiveMemoryCleanup(forced: boolean = false): void {
  if (typeof window === 'undefined') return;
  
  try {
    const memInfo = (window.performance as any)?.memory;
    let shouldClean = forced;
    let cleanupLevel = 'normal';
    
    if (memInfo) {
      const usage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
      
      if (usage > 0.55) { // Muito mais conservador
        shouldClean = true;
        cleanupLevel = usage > 0.75 ? 'aggressive' : 'moderate';
      }
    }
    
    if (shouldClean) {
      // Limpeza imediata se crítico
      if (cleanupLevel === 'aggressive' && (window as any).gc) {
        try {
          (window as any).gc();
          console.log(`🧹 Limpeza agressiva executada - memória: ${(memInfo?.usedJSHeapSize / memInfo?.totalJSHeapSize * 100 || 0).toFixed(1)}%`);
        } catch (e) {}
      }
      
      // Limpeza com delay para não bloquear UI
      const delay = cleanupLevel === 'aggressive' ? 50 : 200;
      setTimeout(() => {
        if ((window as any).gc) {
          try {
            (window as any).gc();
          } catch (e) {}
        }
      }, delay);
    }
  } catch (error) {
    console.warn('Erro na limpeza de memória:', error);
  }
}

/**
 * Configurações padrão de compressão/redimensionamento
 * Baseadas no padrão atual do sistema (920px -> ajustado para 900px, qualidade 80%)
 */
const DEFAULT_COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 970, // Largura máxima em pixels
  useWebWorker: typeof Worker !== 'undefined', // Verificar se Web Worker está disponível
  quality: 0.9, // Qualidade 90%
  fileType: undefined as string | undefined, // Manter o tipo original do arquivo
  initialQuality: 0.9, // Qualidade inicial
};

/**
 * Redimensiona e comprime uma imagem usando as configurações padrão do sistema
 * @param file Arquivo de imagem original
 * @param options Opções customizadas (opcional)
 * @returns Promise com o arquivo processado
 */
export async function compressImage(
  file: File, 
  options: Partial<typeof DEFAULT_COMPRESSION_OPTIONS> = {}
): Promise<File> {
  try {
    // 🛡️ VERIFICAÇÃO CRÍTICA DE MEMÓRIA ANTES DE PROCESSAR
    const memInfo = (window.performance as any)?.memory;
    if (memInfo && memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.85) {
      console.warn(`🚨 Memory pressure detected before processing ${file.name} - ${((memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100).toFixed(1)}% used`);
      // Força limpeza antes de continuar
      if ((window as any).gc) {
        try {
          (window as any).gc();
          // Espera um pouco para limpeza completar
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {}
      }
    }
    
    // Mesclar opções padrão com opções customizadas
    const compressionOptions = {
      ...DEFAULT_COMPRESSION_OPTIONS,
      ...options,
    };

    // Log do processamento (para debugging)
    console.log(`[Frontend] Processando imagem: ${file.name}`, {
      tamanhoOriginal: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      configuracoes: compressionOptions,
      memoryStatus: memInfo ? `${((memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100).toFixed(1)}%` : 'unknown'
    });

    // 🛡️ YIELD THREAD: Micro pausa antes de operação pesada
    await new Promise(resolve => setTimeout(resolve, 5));

    // Comprimir/redimensionar a imagem
    const compressedBlob = await imageCompression(file, compressionOptions);

    // Criar um novo File object preservando o nome original e tipo
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });

    // Log do resultado
    console.log(`[Frontend] Imagem processada: ${file.name}`, {
      tamanhoOriginal: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      tamanhoFinal: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      reducao: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
      nomePreservado: compressedFile.name,
    });

    // 🧹 LIMPEZA: Nullificar referência ao arquivo original para GC
    file = null as any;
    
    return compressedFile;
  } catch (error) {
    console.error(`[Frontend] Erro ao processar imagem ${file.name}:`, error);
    
    // Verificar se é erro de memória ou tamanho
    const errorMsg = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMsg.includes('memory') || errorMsg.includes('heap') || errorMsg.includes('worker')) {
      console.warn(`[Frontend] Erro de memória detectado para ${file.name} - tentando sem Web Worker`);
      
      // Tentar novamente sem Web Worker se o erro foi relacionado à memória
      try {
        const fallbackOptions = {
          ...DEFAULT_COMPRESSION_OPTIONS,
          useWebWorker: false,
          quality: 0.8, // Reduzir qualidade para economizar memória
        };
        
        const fallbackBlob = await imageCompression(file, fallbackOptions);
        const fallbackFile = new File([fallbackBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        
        console.log(`[Frontend] Fallback bem-sucedido para ${file.name}`);
        return fallbackFile;
      } catch (fallbackError) {
        console.error(`[Frontend] Fallback também falhou para ${file.name}:`, fallbackError);
      }
    }
    
    // Em último caso, retornar o arquivo original
    console.log(`[Frontend] Retornando arquivo original devido ao erro: ${file.name}`);
    return file;
  }
}

/**
 * OTIMIZADO: Calcula tamanho de lote dinâmico baseado no tamanho real dos arquivos
 * Evita sobrecarga de memória em dispositivos limitados
 */
function calculateDynamicBatchSize(files: File[], startIndex: number, maxBatchSizeMB: number = 25): number {
  let currentBatchSize = 0;
  let currentBatchSizeMB = 0;
  
  for (let i = startIndex; i < files.length; i++) {
    const fileSizeMB = files[i].size / 1024 / 1024;
    
    // Se adicionar este arquivo excederia o limite, parar aqui
    if (currentBatchSizeMB + fileSizeMB > maxBatchSizeMB && currentBatchSize > 0) {
      break;
    }
    
    currentBatchSize++;
    currentBatchSizeMB += fileSizeMB;
    
    // Limite absoluto de segurança (mesmo para arquivos pequenos)
    if (currentBatchSize >= 50) {
      break;
    }
  }
  
  // Garantir pelo menos 1 arquivo por lote
  return Math.max(currentBatchSize, 1);
}

/**
 * Processa múltiplas imagens em lotes DINÂMICOS para evitar travamento do navegador
 * @param files Array de arquivos de imagem
 * @param options Opções de compressão (opcional)
 * @param onProgress Callback de progresso (opcional)
 * @returns Promise com array de arquivos processados
 */
export async function compressMultipleImages(
  files: File[],
  options: Partial<typeof DEFAULT_COMPRESSION_OPTIONS> = {},
  onProgress?: (processed: number, total: number) => void
): Promise<File[]> {
  const results: File[] = [];
  
  // 📊 CALCULAR TAMANHO MÁXIMO DE LOTE BASEADO NO DISPOSITIVO
  const totalSizeMB = files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024;
  let maxBatchSizeMB = 25; // Padrão conservador
  
  // Detectar limitações do dispositivo
  try {
    const { getRecommendedUploadSettings } = await import('./deviceDetection');
    const settings = getRecommendedUploadSettings();
    maxBatchSizeMB = settings.maxBatchSizeMB;
  } catch (e) {
    console.warn('Não foi possível detectar configurações do dispositivo, usando padrão conservador');
  }
  
  console.log(`[Frontend] 📊 Processamento DINÂMICO: ${files.length} imagens (${totalSizeMB.toFixed(1)}MB total), max ${maxBatchSizeMB}MB por lote`);
  
  // Processar em lotes dinâmicos baseados em tamanho
  let batchStart = 0;
  let batchNumber = 1;
  
  while (batchStart < files.length) {
    const dynamicBatchSize = calculateDynamicBatchSize(files, batchStart, maxBatchSizeMB);
    const batchEnd = Math.min(batchStart + dynamicBatchSize, files.length);
    const batch = files.slice(batchStart, batchEnd);
    
    const batchSizeMB = batch.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024;
    const totalBatches = Math.ceil(files.length / (dynamicBatchSize || 1));
    
    console.log(`[Frontend] 🔄 Lote ${batchNumber}/${Math.ceil(files.length/dynamicBatchSize)} - ${batch.length} imagens (${batchSizeMB.toFixed(1)}MB)`);
    
    // Processar este lote dinâmico
    for (let i = 0; i < batch.length; i++) {
      const file = batch[i];
      const globalIndex = batchStart + i;
      
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        console.log(`[Frontend] Pulando arquivo não-imagem: ${file.name}`);
        results.push(file);
        
        // Callback de progresso
        if (onProgress) {
          onProgress(globalIndex + 1, files.length);
        }
        continue;
      }
      
      try {
        // 🧠 COMPRESSÃO INTELIGENTE: Pular arquivos já pequenos
        const fileSizeMB = file.size / 1024 / 1024;
        let processedFile: File;
        
        if (fileSizeMB < 0.8) {
          // Arquivo já pequeno (< 800KB), pular compressão
          console.log(`[Frontend] 🌐 Pulando compressão: ${file.name} já é pequeno (${fileSizeMB.toFixed(2)}MB)`);
          processedFile = file;
        } else {
          // Comprimir apenas se valer a pena
          const compressedFile = await compressImage(file, options);
          
          // Verificar se a compressão realmente reduziu significativamente
          const reduction = (file.size - compressedFile.size) / file.size;
          if (reduction > 0.15) {
            // Redução > 15%, usar comprimido
            processedFile = compressedFile;
            console.log(`[Frontend] ✅ Compressão efetiva: ${file.name} (${(reduction * 100).toFixed(1)}% menor)`);
          } else {
            // Redução insignificante, usar original
            processedFile = file;
            console.log(`[Frontend] ⏭️ Compressão ineficaz: ${file.name} (apenas ${(reduction * 100).toFixed(1)}% menor)`);
          }
        }
        
        results.push(processedFile);
        
        // Callback de progresso
        if (onProgress) {
          onProgress(globalIndex + 1, files.length);
        }
      } catch (error) {
        console.error(`[Frontend] Erro ao processar ${file.name}:`, error);
        // Em caso de erro, usar arquivo original
        results.push(file);
        
        // Callback de progresso mesmo com erro
        if (onProgress) {
          onProgress(globalIndex + 1, files.length);
        }
      }
    }
    
    // 🧹 LIMPEZA AGRESSIVA entre lotes - CRÍTICO para dispositivos limitados
    if (batchEnd < files.length) {
      const remainingBatches = Math.ceil((files.length - batchEnd) / dynamicBatchSize);
      console.log(`[Frontend] Pausando para limpeza entre lotes... (${remainingBatches} lotes restantes)`);
      
      // Limpeza imediata e forçada
      aggressiveMemoryCleanup(true);
      
      // Pausa adaptativa baseada na memória
      const memInfo = (window.performance as any)?.memory;
      let pauseTime = 300; // Pausa base reduzida
      
      if (memInfo) {
        const usage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
        if (usage > 0.70) {
          pauseTime = 800; // Pausa longa para recuperação crítica
        } else if (usage > 0.55) {
          pauseTime = 500; // Pausa média
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, pauseTime));
      
      // Segunda limpeza após pausa
      aggressiveMemoryCleanup(false);
      console.log(`[Frontend] Limpeza completa - pausando ${pauseTime}ms`);
    }
    
    // Próximo lote
    batchStart = batchEnd;
    batchNumber++;
  }
  
  console.log(`[Frontend] ✅ Processamento DINÂMICO concluído: ${results.length} arquivos em ${batchNumber-1} lotes variáveis`);
  
  // Limpeza final agressiva
  aggressiveMemoryCleanup(true);
  return results;
}

/**
 * Verifica se um arquivo é uma imagem válida
 * @param file Arquivo a ser verificado
 * @returns boolean indicando se é uma imagem
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Formata o tamanho do arquivo em uma string legível
 * @param bytes Tamanho em bytes
 * @returns String formatada (ex: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}