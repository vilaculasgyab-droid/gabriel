import { DEFAULT_EPI_PLACEHOLDER } from '../services/imageStorage';

/**
 * Resolve o URL de uma imagem com estratégia ativa de cache busting.
 * 
 * Garante que:
 * 1. Imagens base64 (data: / blob:) sejam retornadas imediatamente sem alteração.
 * 2. Se a imagem já tiver um token de versão (?v=...), ele seja mantido.
 * 3. Se não tiver token de versão, seja anexado ?v=[timestamp] derivado de updatedAt
 *    ou data de modificação. Desta forma, quando o administrador altera a foto ou
 *    salva o produto, a query string é atualizada, FORÇANDO o navegador, o Service Worker
 *    e a CDN a ignorarem a imagem antiga em cache e descarregarem a versão nova.
 */
export function resolveProductImageUrl(
  rawUrl?: string | null,
  versionToken?: string | number | null
): string {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return DEFAULT_EPI_PLACEHOLDER;
  }

  const url = rawUrl.trim();

  // Imagens incorporadas em base64 ou blob em memória não passam por HTTP cache
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Se já possui uma versão explícita nos parâmetros de consulta, use-a
  if (url.includes('?v=') || url.includes('&v=')) {
    return url;
  }

  // Determina o token numérico de versão
  let token = '1';
  if (versionToken) {
    if (typeof versionToken === 'number') {
      token = String(versionToken);
    } else if (typeof versionToken === 'string') {
      const parsed = Date.parse(versionToken);
      token = !isNaN(parsed) ? String(parsed) : versionToken.replace(/[^a-zA-Z0-9_-]/g, '_');
    }
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${token}`;
}

/**
 * Normaliza e limpa um URL de imagem para persistência no banco de dados.
 */
export function normalizeImageUrlForStorage(url: string, newVersion?: string | number): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // Extrair URL base sem parâmetros antigos
  const [baseUrl] = url.split('?');
  const v = newVersion || Date.now();
  return `${baseUrl}?v=${v}`;
}
