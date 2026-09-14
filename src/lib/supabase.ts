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

export function getClientSupabaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return String(import.meta.env.VITE_SUPABASE_URL).trim();
  }
  return '';
}

export function getClientSupabaseAnonKey(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return String(import.meta.env.VITE_SUPABASE_ANON_KEY).trim();
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
      },
    });
  }
  return supabaseInstance;
}
