import { createClient } from '@supabase/supabase-js';

// Safe cleaner to strip accidental outer quotes from environment variables
function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

// Standalone mapper: guarantees complete schema compatibility without importing server modules
function mapDbRowToProduct(row: any) {
  let specs: any[] = [];
  if (Array.isArray(row.specifications)) {
    specs = row.specifications;
  } else if (typeof row.specifications === 'string') {
    try {
      const parsed = JSON.parse(row.specifications);
      if (Array.isArray(parsed)) specs = parsed;
    } catch {
      specs = [];
    }
  }

  let apps: string[] = [];
  if (Array.isArray(row.applications)) {
    apps = row.applications;
  } else if (typeof row.applications === 'string') {
    try {
      const parsed = JSON.parse(row.applications);
      if (Array.isArray(parsed)) {
        apps = parsed;
      } else {
        apps = [String(parsed)];
      }
    } catch {
      apps = row.applications
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }

  const stockCount = Number(row.stock_count ?? row.stockCount ?? row.stock ?? 25);
  const inStock = Boolean(row.in_stock ?? row.inStock ?? stockCount > 0);

  return {
    id: String(row.id),
    name: String(row.name || ''),
    categoryId: String(row.category_id || row.categoryId || 'geral'),
    category_id: String(row.category_id || row.categoryId || 'geral'),
    categoryName: String(row.category_name || row.categoryName || 'Equipamentos de Proteção Individual'),
    category_name: String(row.category_name || row.categoryName || 'Equipamentos de Proteção Individual'),
    subcategory: String(row.subcategory || 'Geral'),
    price: Number(row.price || 0),
    originalPrice: row.original_price != null ? Number(row.original_price) : (row.originalPrice != null ? Number(row.originalPrice) : undefined),
    original_price: row.original_price != null ? Number(row.original_price) : (row.originalPrice != null ? Number(row.originalPrice) : undefined),
    image: String(row.image || ''),
    additionalImages: Array.isArray(row.additional_images) ? row.additional_images : (Array.isArray(row.additionalImages) ? row.additionalImages : undefined),
    additional_images: Array.isArray(row.additional_images) ? row.additional_images : (Array.isArray(row.additionalImages) ? row.additionalImages : undefined),
    badge: row.badge ? String(row.badge) : undefined,
    norm: row.norm ? String(row.norm) : undefined,
    shortDescription: String(row.short_description || row.shortDescription || row.name || ''),
    short_description: String(row.short_description || row.shortDescription || row.name || ''),
    description: String(row.description || row.short_description || row.shortDescription || row.name || ''),
    specifications: specs,
    applications: apps,
    inStock: inStock,
    in_stock: inStock,
    stock: stockCount,
    stockCount: stockCount,
    stock_count: stockCount,
    featured: Boolean(row.featured),
    minQuantity: Number(row.min_quantity || row.minQuantity || 1),
    min_quantity: Number(row.min_quantity || row.minQuantity || 1),
    availableSizes: Array.isArray(row.available_sizes) ? row.available_sizes : (Array.isArray(row.availableSizes) ? row.availableSizes : undefined),
    available_sizes: Array.isArray(row.available_sizes) ? row.available_sizes : (Array.isArray(row.availableSizes) ? row.availableSizes : undefined),
    availableColors: Array.isArray(row.available_colors) ? row.available_colors : (Array.isArray(row.availableColors) ? row.availableColors : undefined),
    available_colors: Array.isArray(row.available_colors) ? row.available_colors : (Array.isArray(row.availableColors) ? row.availableColors : undefined),
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || row.reviewsCount || 0),
    reviews_count: Number(row.reviews_count || row.reviewsCount || 0),
    createdAt: row.created_at || row.createdAt,
    created_at: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    updated_at: row.updated_at || row.updatedAt,
  };
}

function mapProductToDbRow(p: any) {
  return {
    id: String(p.id),
    name: String(p.name || ''),
    category_id: String(p.categoryId || p.category_id || 'geral'),
    category_name: String(p.categoryName || p.category_name || 'Equipamentos de Proteção Individual'),
    subcategory: String(p.subcategory || 'Geral'),
    price: Number(p.price || 0),
    original_price: p.originalPrice != null ? Number(p.originalPrice) : (p.original_price != null ? Number(p.original_price) : null),
    image: String(p.image || ''),
    additional_images: Array.isArray(p.additionalImages) ? p.additionalImages : (Array.isArray(p.additional_images) ? p.additional_images : []),
    badge: p.badge || null,
    norm: p.norm || null,
    short_description: String(p.shortDescription || p.short_description || p.name || ''),
    description: String(p.description || p.shortDescription || p.short_description || p.name || ''),
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    applications: Array.isArray(p.applications) ? p.applications : [],
    in_stock: Boolean(p.inStock ?? p.in_stock ?? true),
    stock: Number(p.stock ?? p.stockCount ?? p.stock_count ?? 25),
    stock_count: Number(p.stockCount ?? p.stock_count ?? p.stock ?? 25),
    featured: Boolean(p.featured),
    min_quantity: Number(p.minQuantity || p.min_quantity || 1),
    available_sizes: Array.isArray(p.availableSizes) ? p.availableSizes : (Array.isArray(p.available_sizes) ? p.available_sizes : []),
    available_colors: Array.isArray(p.availableColors) ? p.availableColors : (Array.isArray(p.available_colors) ? p.available_colors : []),
    rating: Number(p.rating || 5.0),
    reviews_count: Number(p.reviewsCount || p.reviews_count || 0),
    updated_at: new Date().toISOString(),
  };
}

export default async function handler(req: any, res: any) {
  try {
    console.log('[API PRODUCTS] Function started');

    // CORS & Strict Anti-Cache headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Parse body safely if string
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
      } catch {}
    }

    // 1. Ler e validar variáveis de ambiente com segurança
    const supabaseUrl = cleanEnv(process.env.SUPABASE_URL);
    const supabaseServiceRole = cleanEnv(process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!supabaseUrl || !supabaseServiceRole) {
      console.error('[API PRODUCTS] SUPABASE_URL ou SUPABASE_SERVICE_ROLE ausente no ambiente');
      return res.status(500).json({
        success: false,
        error: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE não configurado no ambiente da Vercel.',
      });
    }

    console.log('[API PRODUCTS] Environment validated');

    // 2. Criar cliente Supabase com credenciais seguras do servidor
    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('[API PRODUCTS] Supabase client created');

    const queryId = req.query?.id as string | undefined;

    // ----------------------------------------------------
    // GET /api/products?id=... (Produto individual)
    // ----------------------------------------------------
    if (req.method === 'GET' && queryId) {
      console.log(`[API PRODUCTS] Consultando produto individual ID: ${queryId}`);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', queryId)
        .maybeSingle();

      if (error) {
        console.error('[API PRODUCTS] Erro ao consultar produto:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          error: `Produto com ID ${queryId} não encontrado.`,
        });
      }

      const product = mapDbRowToProduct(data);
      console.log('[API PRODUCTS] Returning response');
      return res.status(200).json({
        success: true,
        source: 'supabase',
        product,
      });
    }

    // ----------------------------------------------------
    // GET /api/products (Todos os produtos)
    // ----------------------------------------------------
    if (req.method === 'GET') {
      console.log('[API PRODUCTS] Query started');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      console.log('[API PRODUCTS] Query completed');

      if (error) {
        console.error('[API PRODUCTS] Erro ao consultar tabela public.products:');
        console.error('Código:', error.code || 'sem código');
        console.error('Mensagem:', error.message);
        return res.status(500).json({
          success: false,
          error: error.message || 'Erro ao consultar tabela public.products.',
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      const products = (data || []).map(mapDbRowToProduct);
      console.log(`[API PRODUCTS] Produtos mapeados: ${products.length}`);
      console.log('[API PRODUCTS] Returning response');

      return res.status(200).json({
        success: true,
        source: 'supabase',
        count: products.length,
        products,
      });
    }

    // ----------------------------------------------------
    // POST /api/products (Criar produto)
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const rawProduct = req.body;
      if (!rawProduct || !rawProduct.name) {
        return res.status(400).json({ success: false, error: 'Dados do produto inválidos ou ausentes.' });
      }

      const newId = rawProduct.id || `prod_${Date.now()}`;
      const productToInsert = { ...rawProduct, id: newId };
      const dbRow = mapProductToDbRow(productToInsert);

      const { data, error } = await supabase
        .from('products')
        .insert(dbRow)
        .select()
        .single();

      if (error) {
        console.error('[API PRODUCTS] Erro ao criar produto:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      const product = mapDbRowToProduct(data);
      return res.status(201).json({
        success: true,
        source: 'supabase',
        product,
      });
    }

    // ----------------------------------------------------
    // PUT /api/products (Atualizar produto)
    // ----------------------------------------------------
    if (req.method === 'PUT') {
      const id = queryId || req.body?.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID do produto não informado.' });
      }

      const { data: existing } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const base = existing ? mapDbRowToProduct(existing) : {};
      const merged = { ...base, ...req.body, id, updatedAt: new Date().toISOString() };
      const dbRow = mapProductToDbRow(merged);

      const { data, error } = await supabase
        .from('products')
        .upsert(dbRow, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[API PRODUCTS] Erro ao atualizar produto:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      const product = mapDbRowToProduct(data);
      return res.status(200).json({
        success: true,
        source: 'supabase',
        product,
      });
    }

    // ----------------------------------------------------
    // DELETE /api/products (Remover produto)
    // ----------------------------------------------------
    if (req.method === 'DELETE') {
      const id = queryId || req.body?.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID do produto não informado.' });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[API PRODUCTS] Erro ao remover produto:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return res.status(200).json({
        success: true,
        source: 'supabase',
        message: `Produto ${id} removido com sucesso.`,
      });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  } catch (err: any) {
    console.error('[API PRODUCTS] Crash inesperado capturado na função:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro interno na Serverless Function.',
    });
  }
}
