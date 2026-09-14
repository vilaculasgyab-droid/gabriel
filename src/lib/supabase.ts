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
 * Utiliza EXCLUSIVAMENTE variáveis com prefixo VITE_ injetadas pelo Vite no navegador.
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

export function getClientSupabaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return cleanEnvString(import.meta.env.VITE_SUPABASE_URL);
  }
  if (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) {
    return cleanEnvString(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
  }
  return '';
}

export function getClientSupabaseAnonKey(): string {
  if (typeof import.meta !== 'undefined') {
    const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY;
    if (key) {
      return cleanEnvString(key);
    }
  }
  if (typeof process !== 'undefined') {
    const key = process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY;
    if (key) {
      return cleanEnvString(key);
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
