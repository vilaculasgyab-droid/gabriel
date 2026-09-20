import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Re-export pure types and mappers for frontend usage
export {
  mapDbRowToProduct,
  mapProductToDbRow,
  mapDbRowToOrder,
  mapOrderToDbRow,
} from './supabaseMappers';

/**
 * CLIENT-SIDE SUPABASE CONFIGURATION
 *
 * Utiliza as variáveis públicas injetadas pelo bundler (Vite) no navegador.
 * NUNCA utiliza ou expõe SUPABASE_SERVICE_ROLE no frontend.
 */

function cleanEnvString(val: unknown): string {
  if (!val) return '';
  let s = String(val).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Obtém a URL pública do Supabase no frontend.
 * 
 * Vite substitui estaticamente `import.meta.env.VITE_SUPABASE_URL` em tempo de compilação.
 * Para garantir máxima compatibilidade com a substituição estática do Vite,
 * acessamos a propriedade de forma direta, sem encadeamento condicional complexo.
 */
export function getClientSupabaseUrl(): string {
  // Acesso direto estático para que o analisador AST do Vite faça o inline correto
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl) {
    return cleanEnvString(envUrl);
  }

  // Suporte a window.__ENV__ se injetado em runtime
  if (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_SUPABASE_URL) {
    return cleanEnvString((window as any).__ENV__.VITE_SUPABASE_URL);
  }

  return '';
}

/**
 * Obtém a chave pública anónima (anon key) do Supabase no frontend.
 * 
 * Acessa diretamente `import.meta.env.VITE_SUPABASE_ANON_KEY` para inline estático do Vite.
 */
export function getClientSupabaseAnonKey(): string {
  // Acesso direto estático para substituição estática do Vite
  const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envAnonKey) {
    return cleanEnvString(envAnonKey);
  }

  // Alternativa comum caso o utilizador tenha nomeado VITE_SUPABASE_KEY
  const envKey = import.meta.env.VITE_SUPABASE_KEY;
  if (envKey) {
    return cleanEnvString(envKey);
  }

  // Suporte a window.__ENV__ se injetado em runtime
  if (typeof window !== 'undefined') {
    const winKey = (window as any).__ENV__?.VITE_SUPABASE_ANON_KEY || (window as any).__ENV__?.VITE_SUPABASE_KEY;
    if (winKey) {
      return cleanEnvString(winKey);
    }
  }

  return '';
}

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = getClientSupabaseUrl();
  const key = getClientSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    key.length > 20
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const url = getClientSupabaseUrl();
    const key = getClientSupabaseAnonKey();
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

/**
 * Cliente Supabase singleton inicializado com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
 * NUNCA utiliza SUPABASE_SERVICE_ROLE_KEY no frontend.
 */
export const supabase = getSupabaseClient();

export function getSupabase(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Configuração de autenticação incompleta.');
  }
  return client;
}
