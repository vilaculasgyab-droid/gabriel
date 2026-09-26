import { createClient } from '@supabase/supabase-js';

// Safe cleaner to strip accidental quotes and whitespace from environment variables
function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

// Standalone mapper: ensures full frontend compatibility with all product fields
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

function mapProductToDbRow(product: any): Record<string, any> {
  const stock = Number(product.stockCount ?? product.stock ?? 25);
  const inStock = product.inStock !== undefined ? Boolean(product.inStock) : stock > 0;

  return {
    id: String(product.id),
    name: String(product.name || ''),
    category_id: String(product.categoryId || product.category_id || 'fardamento-seguranca'),
    category_name: String(product.categoryName || product.category_name || 'Fardamento de Segurança'),
    subcategory: String(product.subcategory || 'Geral'),
    price: Number(product.price || 0),
    original_price: product.originalPrice != null ? Number(product.originalPrice) : (product.original_price != null ? Number(product.original_price) : null),
    image: String(product.image || ''),
    additional_images: Array.isArray(product.additionalImages) ? product.additionalImages : (Array.isArray(product.additional_images) ? product.additional_images : []),
    badge: product.badge ? String(product.badge) : null,
    norm: product.norm ? String(product.norm) : null,
    short_description: String(product.shortDescription || product.short_description || product.name || ''),
    description: String(product.description || product.shortDescription || product.short_description || product.name || ''),
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    applications: Array.isArray(product.applications) ? product.applications : [],
    in_stock: inStock,
    stock_count: stock,
    stock: stock,
    featured: Boolean(product.featured),
    available_sizes: Array.isArray(product.availableSizes) ? product.availableSizes : (Array.isArray(product.available_sizes) ? product.available_sizes : []),
    available_colors: Array.isArray(product.availableColors) ? product.availableColors : (Array.isArray(product.available_colors) ? product.available_colors : []),
    rating: Number(product.rating ?? 5.0),
    reviews_count: Number(product.reviewsCount ?? product.reviews_count ?? 1),
    created_at: product.createdAt || product.created_at || new Date().toISOString(),
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

function sendResponse(res: any, statusCode: number, data: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (typeof res.status === 'function') {
    res.status(statusCode);
    if (typeof res.json === 'function') {
      return res.json(data);
    }
  } else {
    res.statusCode = statusCode;
  }
  return res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  // Strict Anti-Cache and CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  try {
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

    // Resolve Supabase credentials safely on the server side
    const supabaseUrl = cleanEnv(
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    const supabaseServiceRole = cleanEnv(
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY
    );
    const supabaseAnon = cleanEnv(
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const supabaseKey = supabaseServiceRole || (req.method === 'GET' ? supabaseAnon : '');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[API PRODUCTS] SUPABASE_URL ou SUPABASE_SERVICE_ROLE ausente no ambiente');
      return sendResponse(res, 500, {
        success: false,
        error: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE não configurado no ambiente da Vercel.',
        details: {
          hasUrl: Boolean(supabaseUrl),
          hasServiceRole: Boolean(supabaseServiceRole),
          hasAnonKey: Boolean(supabaseAnon),
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
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
        console.error('[API PRODUCTS] Erro ao consultar produto individual:', error.message);
        return sendResponse(res, 500, {
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      if (!data) {
        return sendResponse(res, 404, {
          success: false,
          error: `Produto com ID ${targetId} não encontrado.`,
        });
      }

      return sendResponse(res, 200, {
        success: true,
        source: 'supabase',
        product: mapDbRowToProduct(data),
      });
    }

    // ----------------------------------------------------
    // GET /api/products (Todos os 41 produtos do Supabase)
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('[API PRODUCTS] Erro ao consultar tabela public.products:', error.message);
        return sendResponse(res, 500, {
          success: false,
          error: error.message || 'Erro ao consultar tabela public.products.',
          code: error.code,
        });
      }

      const products = (data || []).map(mapDbRowToProduct);

      return sendResponse(res, 200, {
        success: true,
        source: 'supabase',
        count: products.length,
        products,
      });
    }

    // ----------------------------------------------------
    // POST /api/products (Criação de Produto)
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const productData = body;
      const price = Number(productData?.price);
      if (!productData || !productData.name || isNaN(price) || price <= 0) {
        return sendResponse(res, 400, {
          success: false,
          error: 'Nome e preço válido superior a zero são obrigatórios.',
        });
      }

      const id = productData.id || 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const stock = Number(productData.stockCount ?? productData.stock ?? 25);
      const inStock = productData.inStock !== undefined ? Boolean(productData.inStock) : stock > 0;
      const now = new Date().toISOString();

      const newProduct = {
        ...productData,
        id,
        price,
        inStock,
        stockCount: stock,
        stock,
        rating: Number(productData.rating || 5.0),
        reviewsCount: Number(productData.reviewsCount || 1),
        createdAt: productData.createdAt || now,
        updatedAt: now,
      };

      const row = mapProductToDbRow(newProduct);
      const { data, error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[API PRODUCTS] Erro ao gravar produto no Supabase:', error.message);
        return sendResponse(res, 500, {
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return sendResponse(res, 201, {
        success: true,
        source: 'supabase',
        product: data ? mapDbRowToProduct(data) : newProduct,
        message: 'Produto criado com sucesso no Supabase.',
      });
    }

    // ----------------------------------------------------
    // PUT / PATCH /api/products/:id (Atualização de Produto)
    // ----------------------------------------------------
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const updateId = targetId || body?.id;
      if (!updateId) {
        return sendResponse(res, 400, {
          success: false,
          error: 'ID do produto não informado.',
        });
      }

      const { data: existing } = await supabase
        .from('products')
        .select('*')
        .eq('id', updateId)
        .maybeSingle();

      const base = existing ? mapDbRowToProduct(existing) : {};
      const updatedProduct = {
        ...base,
        ...body,
        id: updateId,
        updatedAt: new Date().toISOString(),
      };

      const row = mapProductToDbRow(updatedProduct);
      const { data, error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[API PRODUCTS] Erro ao atualizar produto no Supabase:', error.message);
        return sendResponse(res, 500, {
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return sendResponse(res, 200, {
        success: true,
        source: 'supabase',
        product: data ? mapDbRowToProduct(data) : updatedProduct,
        message: 'Produto atualizado com sucesso no Supabase.',
      });
    }

    // ----------------------------------------------------
    // DELETE /api/products/:id (Eliminação de Produto)
    // ----------------------------------------------------
    if (req.method === 'DELETE') {
      const deleteId = targetId || body?.id;
      if (!deleteId) {
        return sendResponse(res, 400, {
          success: false,
          error: 'ID do produto não informado.',
        });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteId);

      if (error) {
        console.error('[API PRODUCTS] Erro ao eliminar produto no Supabase:', error.message);
        return sendResponse(res, 500, {
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return sendResponse(res, 200, {
        success: true,
        message: 'Produto eliminado com sucesso do Supabase.',
      });
    }

    // Método não suportado
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
    return sendResponse(res, 405, {
      success: false,
      error: `Método ${req.method} não suportado neste endpoint.`,
    });
  } catch (err: any) {
    console.error('[API PRODUCTS] Exceção crítica na Serverless Function:', err);
    return sendResponse(res, 500, {
      success: false,
      error: err?.message || 'Erro interno na execução da Serverless Function.',
      type: err?.name || 'Error',
    });
  }
}
