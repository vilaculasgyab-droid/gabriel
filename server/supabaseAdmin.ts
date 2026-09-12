import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Product, Order } from '../src/types';
import { mapDbRowToProduct, mapProductToDbRow, mapDbRowToOrder, mapOrderToDbRow } from '../src/lib/supabase';

const BUCKET_NAME = 'product-images';

let adminClient: SupabaseClient | null = null;

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim();
}

export function getSupabaseKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();
}

export function isSupabaseServerConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseServerConfigured()) {
    return null;
  }
  if (!adminClient) {
    const url = getSupabaseUrl();
    const key = getSupabaseKey();
    adminClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminClient;
}

/**
 * Garante que o bucket 'product-images' existe no Supabase Storage.
 */
export async function ensureProductStorageBucket(): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      console.warn('[Supabase Storage] Não foi possível listar buckets:', error.message);
      return false;
    }

    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      console.log(`[Supabase Storage] Criando bucket público "${BUCKET_NAME}"...`);
      const { error: createError } = await client.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      });
      if (createError) {
        console.warn('[Supabase Storage] Aviso ao criar bucket:', createError.message);
      }
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Storage] Erro ao assegurar bucket:', err);
    return false;
  }
}

/**
 * Busca todos os produtos do Supabase (public.products).
 */
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        console.warn('[Supabase DB] Permissão pendente na tabela public.products (42501). Execute o script fix-supabase-permissions.sql no SQL Editor do Supabase.');
      } else {
        console.error('[Supabase DB] Erro na consulta de produtos:', error.message);
      }
      return null;
    }

    if (!data) return [];
    return data.map(mapDbRowToProduct);
  } catch (err) {
    console.error('[Supabase DB] Exceção ao buscar produtos:', err);
    return null;
  }
}

/**
 * Insere ou atualiza um produto no Supabase (public.products).
 */
export async function upsertProductInSupabase(product: Product): Promise<Product | null> {
  const result = await upsertProductInSupabaseDetailed(product);
  return result.success && result.data ? result.data : null;
}

export interface SupabaseOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Busca um único produto por ID no Supabase (public.products).
 */
export async function fetchProductByIdFromSupabase(id: string): Promise<Product | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return mapDbRowToProduct(data);
  } catch (err) {
    return null;
  }
}

/**
 * Insere ou atualiza um produto com detalhes completos do erro para diagnóstico.
 */
export async function upsertProductInSupabaseDetailed(product: Product): Promise<SupabaseOperationResult<Product>> {
  const client = getSupabaseAdmin();
  if (!client) {
    return { success: false, error: 'Supabase não está configurado no servidor.' };
  }

  try {
    const row = mapProductToDbRow(product);
    const { data, error } = await client
      .from('products')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB] Erro detalhado ao gravar produto:', error.message, error.hint);
      return {
        success: false,
        error: error.message + (error.hint ? ` (${error.hint})` : ''),
        code: error.code,
      };
    }

    return {
      success: true,
      data: data ? mapDbRowToProduct(data) : product,
    };
  } catch (err: any) {
    console.error('[Supabase DB] Exceção ao gravar produto:', err);
    return {
      success: false,
      error: err?.message || 'Exceção ao persistir no Supabase.',
    };
  }
}

/**
 * Remove um produto do Supabase.
 */
export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    // Buscar produto primeiro para identificar se tem imagem no Supabase Storage
    const { data: prod } = await client.from('products').select('image').eq('id', id).single();
    
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) {
      console.error('[Supabase DB] Erro ao remover produto:', error.message);
      return false;
    }

    // Se tiver imagem no bucket, remove do storage
    if (prod?.image) {
      await deleteImageFromSupabaseStorage(prod.image);
    }

    return true;
  } catch (err) {
    console.error('[Supabase DB] Exceção ao remover produto:', err);
    return false;
  }
}

/**
 * Extrai o caminho relativo dentro do bucket product-images a partir de uma URL pública do Supabase.
 */
export function extractStoragePath(imageUrl: string): string | null {
  if (!imageUrl) return null;
  const cleanUrl = imageUrl.split('?')[0];
  const marker = `/${BUCKET_NAME}/`;
  const idx = cleanUrl.indexOf(marker);
  if (idx !== -1) {
    return cleanUrl.substring(idx + marker.length);
  }
  return null;
}

/**
 * Envia uma imagem para o Supabase Storage no bucket 'product-images'.
 * Gera um nome de arquivo versionado único para garantir cache-busting total em todos os navegadores.
 * Se fornecida uma imagem anterior do Supabase Storage, ela será removida apenas após o sucesso do novo upload.
 */
export async function uploadImageToSupabaseStorage(
  productId: string,
  fileBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  previousImageUrl?: string
): Promise<{ url: string; fileName: string; path: string } | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;

  await ensureProductStorageBucket();

  // Determinar extensão
  let ext = path.extname(originalFileName).toLowerCase();
  if (!ext || ext === '.') {
    if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('png')) ext = '.png';
    else ext = '.jpg';
  }

  const cleanProdId = (productId || 'prod')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 30);
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const storageFileName = `${cleanProdId}_${timestamp}_${randomSuffix}${ext}`;

  try {
    const { error: uploadError } = await client.storage
      .from(BUCKET_NAME)
      .upload(storageFileName, fileBuffer, {
        contentType: mimeType || 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Supabase Storage] Erro no upload:', uploadError.message);
      return null;
    }

    // Obter URL pública
    const { data: publicUrlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storageFileName);

    const publicUrl = `${publicUrlData.publicUrl}?v=${timestamp}`;

    // Remover imagem anterior do Storage se pertencer ao bucket e for diferente
    if (previousImageUrl) {
      const oldPath = extractStoragePath(previousImageUrl);
      if (oldPath && oldPath !== storageFileName) {
        try {
          await client.storage.from(BUCKET_NAME).remove([oldPath]);
          console.log(`[Supabase Storage] Imagem antiga removida com sucesso: ${oldPath}`);
        } catch (delErr) {
          console.warn('[Supabase Storage] Aviso ao remover imagem antiga:', delErr);
        }
      }
    }

    return {
      url: publicUrl,
      fileName: storageFileName,
      path: storageFileName,
    };
  } catch (err) {
    console.error('[Supabase Storage] Exceção durante upload:', err);
    return null;
  }
}

/**
 * Remove uma imagem do bucket product-images no Supabase Storage.
 */
export async function deleteImageFromSupabaseStorage(imagePathOrUrl: string): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;

  const storagePath = extractStoragePath(imagePathOrUrl) || imagePathOrUrl;
  if (!storagePath) return false;

  try {
    const { error } = await client.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) {
      console.warn('[Supabase Storage] Erro ao remover imagem:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Storage] Exceção ao remover imagem:', err);
    return false;
  }
}

/**
 * Busca pedidos no Supabase (public.orders).
 */
export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase DB] Erro ao buscar pedidos:', error.message);
      return null;
    }

    if (!data) return [];
    return data.map(mapDbRowToOrder);
  } catch (err) {
    console.error('[Supabase DB] Exceção ao buscar pedidos:', err);
    return null;
  }
}

/**
 * Grava um pedido no Supabase.
 */
export async function insertOrderInSupabase(order: Order): Promise<Order | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const row = mapOrderToDbRow(order);
    const { data, error } = await client
      .from('orders')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB] Erro ao gravar pedido:', error.message);
      return null;
    }

    return data ? mapDbRowToOrder(data) : order;
  } catch (err) {
    console.error('[Supabase DB] Exceção ao gravar pedido:', err);
    return null;
  }
}

/**
 * Atualiza status de um pedido no Supabase.
 */
export async function updateOrderStatusInSupabase(
  id: string,
  status: string,
  isPayment: boolean
): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (isPayment) {
      updateData.payment_status = status;
    } else {
      updateData.order_status = status;
    }

    const { error } = await client.from('orders').update(updateData).eq('id', id);
    if (error) {
      console.error('[Supabase DB] Erro ao atualizar status do pedido:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exceção ao atualizar status do pedido:', err);
    return false;
  }
}

/**
 * Diagnóstico da conexão com Supabase.
 */
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  configured: boolean;
  productsCount: number;
  ordersCount: number;
  storageReady: boolean;
  error?: string;
}> {
  if (!isSupabaseServerConfigured()) {
    return {
      connected: false,
      configured: false,
      productsCount: 0,
      ordersCount: 0,
      storageReady: false,
      error: 'Variáveis SUPABASE_URL e chaves não configuradas.',
    };
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return {
      connected: false,
      configured: true,
      productsCount: 0,
      ordersCount: 0,
      storageReady: false,
      error: 'Cliente Supabase não inicializado.',
    };
  }

  try {
    const { count: prodCount, error: prodErr } = await client
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (prodErr) {
      return {
        connected: false,
        configured: true,
        productsCount: 0,
        ordersCount: 0,
        storageReady: false,
        error: `Erro ao consultar tabela products: ${prodErr.message}`,
      };
    }

    const { count: orderCount } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const storageReady = await ensureProductStorageBucket();

    return {
      connected: true,
      configured: true,
      productsCount: prodCount ?? 0,
      ordersCount: orderCount ?? 0,
      storageReady,
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      productsCount: 0,
      ordersCount: 0,
      storageReady: false,
      error: err?.message || String(err),
    };
  }
}
