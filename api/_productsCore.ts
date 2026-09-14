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
      apps = String(row.applications)
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
  const stock = Number(p.stockCount ?? p.stock_count ?? p.stock ?? 25);
  const inStock = Boolean(p.inStock ?? p.in_stock ?? stock > 0);

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
    in_stock: inStock,
    stock: stock,
    stock_count: stock,
    featured: Boolean(p.featured),
    min_quantity: Number(p.minQuantity || p.min_quantity || 1),
    available_sizes: Array.isArray(p.availableSizes) ? p.availableSizes : (Array.isArray(p.available_sizes) ? p.available_sizes : []),
    available_colors: Array.isArray(p.availableColors) ? p.availableColors : (Array.isArray(p.available_colors) ? p.available_colors : []),
    rating: Number(p.rating || 5.0),
    reviews_count: Number(p.reviewsCount || p.reviews_count || 0),
    updated_at: new Date().toISOString(),
  };
}

function extractProductId(req: any, body: any): string | undefined {
  if (req.query?.id && typeof req.query.id === 'string' && req.query.id.trim()) {
    return req.query.id.trim();
  }
  if (req.params?.id && typeof req.params.id === 'string' && req.params.id.trim()) {
    return req.params.id.trim();
  }
  if (body?.id && typeof body.id === 'string' && body.id.trim()) {
    return body.id.trim();
  }
  if (req.url) {
    const cleanUrl = req.url.split('?')[0];
    const match = cleanUrl.match(/\/api\/products\/([^\/?#]+)/);
    if (match && match[1] && match[1] !== 'index') {
      return decodeURIComponent(match[1]);
    }
  }
  return undefined;
}

export async function handleProducts(req: any, res: any) {
  try {
    // Strict Anti-Cache and CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Parse body safely
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf-8'));
      } catch {}
    } else if (typeof body === 'string' && body.trim()) {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    // Initialize Supabase Client with service_role
    const supabaseUrl = cleanEnv(process.env.SUPABASE_URL);
    const supabaseServiceRole = cleanEnv(process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!supabaseUrl || !supabaseServiceRole) {
      console.error('[API PRODUCTS] SUPABASE_URL ou SUPABASE_SERVICE_ROLE ausente no ambiente');
      return res.status(500).json({
        success: false,
        error: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE não configurado no ambiente da Vercel.',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const targetId = extractProductId(req, body);

    // ----------------------------------------------------
    // GET /api/products?id=... ou /api/products/:id (Produto individual)
    // ----------------------------------------------------
    if (req.method === 'GET' && targetId) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (error) {
        console.error('[API PRODUCTS] Erro ao consultar produto:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          error: `Produto com ID ${targetId} não encontrado.`,
        });
      }

      return res.status(200).json({
        success: true,
        source: 'supabase',
        product: mapDbRowToProduct(data),
      });
    }

    // ----------------------------------------------------
    // GET /api/products (Todos os produtos)
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('[API PRODUCTS] Erro ao consultar tabela public.products:', error.message);
        return res.status(500).json({
          success: false,
          error: error.message || 'Erro ao consultar tabela public.products.',
          code: error.code,
        });
      }

      const products = (data || []).map(mapDbRowToProduct);
      return res.status(200).json({
        success: true,
        source: 'supabase',
        count: products.length,
        products,
      });
    }

    // ----------------------------------------------------
    // POST /api/products (Criar novo produto no Supabase)
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const rawProduct = body;
      if (!rawProduct || !rawProduct.name) {
        return res.status(400).json({ success: false, error: 'Dados do produto inválidos ou ausentes (nome obrigatório).' });
      }

      const newId = rawProduct.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const productToInsert = {
        ...rawProduct,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      const dbRow = mapProductToDbRow(productToInsert);

      const { data, error } = await supabase
        .from('products')
        .insert(dbRow)
        .select()
        .single();

      if (error) {
        console.error('[API PRODUCTS] Erro ao criar produto no Supabase:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      const product = mapDbRowToProduct(data);
      console.log(`[API PRODUCTS] Novo produto criado com sucesso: ${product.id} (${product.name})`);

      return res.status(201).json({
        success: true,
        source: 'supabase',
        product,
        message: 'Produto adicionado com sucesso no Supabase.',
      });
    }

    // ----------------------------------------------------
    // PUT / PATCH /api/products/:id (Atualizar produto no Supabase)
    // ----------------------------------------------------
    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!targetId) {
        return res.status(400).json({ success: false, error: 'ID do produto não informado para atualização.' });
      }

      // Buscar produto existente para garantir merge seguro e íntegro
      const { data: existing, error: findError } = await supabase
        .from('products')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (findError) {
        console.error('[API PRODUCTS] Erro ao verificar produto existente:', findError.message);
      }

      const base = existing ? mapDbRowToProduct(existing) : {};
      const merged = {
        ...base,
        ...(body || {}),
        id: targetId,
        updatedAt: new Date().toISOString(),
      };
      const dbRow = mapProductToDbRow(merged);

      const { data, error } = await supabase
        .from('products')
        .upsert(dbRow, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[API PRODUCTS] Erro ao atualizar produto no Supabase:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      const product = mapDbRowToProduct(data);
      console.log(`[API PRODUCTS] Produto atualizado com sucesso: ${product.id} (Preço: ${product.price}, Img: ${product.image?.slice(0, 40)}...)`);

      return res.status(200).json({
        success: true,
        source: 'supabase',
        product,
        message: 'Produto atualizado e confirmado com sucesso no Supabase.',
      });
    }

    // ----------------------------------------------------
    // DELETE /api/products/:id (Eliminar produto no Supabase)
    // ----------------------------------------------------
    if (req.method === 'DELETE') {
      if (!targetId) {
        return res.status(400).json({ success: false, error: 'ID do produto não informado para exclusão.' });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', targetId);

      if (error) {
        console.error('[API PRODUCTS] Erro ao remover produto do Supabase:', error.code, error.message);
        return res.status(500).json({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      console.log(`[API PRODUCTS] Produto eliminado com sucesso: ${targetId}`);

      return res.status(200).json({
        success: true,
        source: 'supabase',
        deletedId: targetId,
        message: `Produto ${targetId} removido com sucesso do catálogo Supabase.`,
      });
    }

    // Método não suportado
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  } catch (err: any) {
    console.error('[API PRODUCTS] Exceção crítica:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro interno no servidor.',
    });
  }
}
export default handleProducts;
