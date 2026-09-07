/**
 * FortiMoz - Serviço de Validação, Otimização e Armazenamento de Imagens de EPIs
 * 
 * Funcionalidades:
 * - Validação rigorosa de MIME types, extensões e magic bytes (assinaturas binárias).
 * - Descodificação de teste no navegador para impedir ficheiros corrompidos ou maliciosos.
 * - Redimensionamento e re-codificação segura através de HTML5 Canvas (elimina scripts maliciosos e EXIF).
 * - Otimização de formato (WebP/JPEG) para alto desempenho e baixo consumo de memória.
 * - Armazenamento persistente compatível com IndexedDB e LocalStorage.
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  format?: string;
  sizeBytes?: number;
}

export interface OptimizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
  fileName: string;
}

// Formatos permitidos
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Limite máximo: 8 Megabytes (8 * 1024 * 1024)
export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

// Placeholder padrão profissional para EPIs sem imagem
export const DEFAULT_EPI_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
  <rect width="600" height="600" rx="32" fill="#0f172a"/>
  <rect x="20" y="20" width="560" height="560" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <circle cx="300" cy="270" r="90" fill="#334155" opacity="0.5"/>
  <path d="M300 200C255 200 220 235 220 270H380C380 235 345 200 300 200Z" fill="#fbbf24"/>
  <rect x="200" y="270" width="200" height="20" rx="6" fill="#f59e0b"/>
  <path d="M290 200V185C290 182 295 180 300 180C305 180 310 182 310 185V200" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <path d="M300 320L340 345V390C340 415 320 435 300 445C280 435 260 415 260 390V345L300 320Z" fill="#0284c7" stroke="#38bdf8" stroke-width="4"/>
  <path d="M285 380L295 390L318 365" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="300" y="495" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="800" letter-spacing="1">FORTIMOZ EPI</text>
  <text x="300" y="525" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Sem imagem definida para este produto</text>
</svg>
`);

/**
 * Verifica as assinaturas de magic bytes dos ficheiros de imagem
 * para impedir uploads de scripts, executáveis ou ficheiros renomeados.
 */
async function checkMagicBytes(file: File): Promise<{ valid: boolean; detectedFormat?: string }> {
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { valid: true, detectedFormat: 'image/jpeg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return { valid: true, detectedFormat: 'image/png' };
    }

    // WEBP: "RIFF" .... "WEBP"
    // Bytes 0-3: 52 49 46 46 (RIFF)
    // Bytes 8-11: 57 45 42 50 (WEBP)
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return { valid: true, detectedFormat: 'image/webp' };
    }

    return { valid: false };
  } catch (err) {
    console.error('Erro ao inspecionar magic bytes da imagem', err);
    return { valid: false };
  }
}

/**
 * Valida o ficheiro de imagem de forma exaustiva:
 * 1. Existência e tamanho
 * 2. Extensão do nome do ficheiro
 * 3. MIME type fornecido pelo navegador
 * 4. Magic bytes binários reais
 * 5. Descodificação em memória no motor do browser
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!file) {
    return { valid: false, error: 'Nenhum ficheiro selecionado.' };
  }

  // 1. Limite de tamanho
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `O ficheiro tem ${sizeMb} MB. O tamanho máximo permitido é de 8 MB.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'O ficheiro selecionado está vazio (0 bytes).' };
  }

  // 2. Extensão
  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'Formato não suportado. Por favor utilize apenas ficheiros JPG, JPEG, PNG ou WEBP.',
    };
  }

  // 3. MIME Type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Tipo de ficheiro inválido. Selecione apenas imagens (JPG, JPEG, PNG ou WEBP).',
    };
  }

  // 4. Magic Bytes
  const magicCheck = await checkMagicBytes(file);
  if (!magicCheck.valid) {
    return {
      valid: false,
      error: 'Assinatura de imagem inválida ou ficheiro corrompido. Certifique-se de que o ficheiro é uma imagem genuína.',
    };
  }

  // 5. Descodificação de teste no elemento de imagem
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      cleanup();

      if (width <= 0 || height <= 0) {
        resolve({
          valid: false,
          error: 'Dimensões inválidas da imagem. O ficheiro não pôde ser renderizado.',
        });
        return;
      }

      resolve({
        valid: true,
        width,
        height,
        format: magicCheck.detectedFormat || file.type,
        sizeBytes: file.size,
      });
    };

    img.onerror = () => {
      cleanup();
      resolve({
        valid: false,
        error: 'Erro ao descodificar a imagem. O ficheiro pode estar danificado ou não é uma imagem válida.',
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Sanitiza o nome do ficheiro para armazenamento seguro
 */
export function sanitizeFileName(originalName: string, prefix = 'prod'): string {
  const cleanBase = originalName
    .toLowerCase()
    .replace(/\.[^/.]+$/, '') // remove extensão
    .replace(/[^a-z0-9]/g, '_') // caracteres seguros
    .replace(/_+/g, '_')
    .slice(0, 40);

  const timestamp = Date.now();
  return `${prefix}_${cleanBase || 'imagem'}_${timestamp}.webp`;
}

/**
 * Redimensiona e recodifica a imagem com segurança através do Canvas.
 * - Limpa dados residuais e scripts maliciosos em EXIF.
 * - Mantém proporção perfeita de aspeto.
 * - Otimiza o peso para ~40KB - 90KB.
 */
export async function optimizeAndEncodeImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85
): Promise<OptimizedImageResult> {
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      // Calcular proporção
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Criar canvas de renderização limpo
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Não foi possível inicializar o contexto gráfico Canvas.'));
        return;
      }

      // Alta qualidade de interpolação
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Desenhar a imagem descodificada
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Tentar exportar em WebP, com fallback para JPEG
      let format = 'image/webp';
      let dataUrl = canvas.toDataURL('image/webp', quality);

      if (!dataUrl.startsWith('data:image/webp')) {
        format = 'image/jpeg';
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      // Calcular tamanho em bytes do base64 gerado
      const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
      const sizeBytes = Math.round((base64Length * 3) / 4);

      const safeName = sanitizeFileName(file.name);

      resolve({
        dataUrl,
        width: targetWidth,
        height: targetHeight,
        format,
        sizeBytes,
        fileName: safeName,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Falha ao renderizar a imagem no canvas.'));
    };

    img.src = objectUrl;
  });
}

// ----------------------------------------------------------------------
// Suporte a Armazenamento no IndexedDB (proseguranca_images_db)
// Permite guardar cópias de segurança de imagens em alta resolução
// ----------------------------------------------------------------------

const IDB_NAME = 'proseguranca_images_db_v1';
const IDB_STORE = 'product_images';

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }

    const request = indexedDB.open(IDB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const imageStorage = {
  async saveImage(productId: string, dataUrl: string, metadata?: Record<string, unknown>): Promise<boolean> {
    try {
      const db = await openIndexedDb();
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        store.put({
          id: productId,
          dataUrl,
          metadata: metadata || {},
          updatedAt: new Date().toISOString(),
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn('Armazenamento auxiliar IndexedDB não disponível, continuando com armazenamento primário:', e);
      return false;
    }
  },

  async getImage(productId: string): Promise<string | null> {
    try {
      const db = await openIndexedDb();
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(productId);

        req.onsuccess = () => {
          if (req.result && req.result.dataUrl) {
            resolve(req.result.dataUrl);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async deleteImage(productId: string): Promise<boolean> {
    try {
      const db = await openIndexedDb();
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        store.delete(productId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },
};
