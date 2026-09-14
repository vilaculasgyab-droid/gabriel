import { Request, Response } from 'express';
import {
  getStoredProducts,
  updateStoredProduct,
  addStoredProduct,
  deleteStoredProduct,
  saveUploadedImage,
  getStoredOrders,
  addStoredOrder,
  updateStoredOrderStatus,
} from './storeData';
import {
  isSupabaseServerConfigured,
  fetchProductsFromSupabaseDetailed,
  fetchProductsFromSupabase,
  fetchProductByIdFromSupabase,
  upsertProductInSupabaseDetailed,
  deleteProductFromSupabase,
  uploadImageToSupabaseStorage,
  fetchOrdersFromSupabase,
  insertOrderInSupabase,
  updateOrderStatusInSupabase,
  checkSupabaseStatus,
} from './supabaseAdmin';
import { Product, Order } from '../src/types';

// Strict anti-caching headers for API responses so clients always get fresh data
export function setApiNoCacheHeaders(res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
}

// GET /api/products
// Supabase é a ÚNICA fonte de verdade dos produtos. Sem fallback silencioso local.
export async function handleGetProducts(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const queryResult = await fetchProductsFromSupabaseDetailed();

    if (queryResult.success) {
      const products = queryResult.data || [];
      return res.status(200).json({
        success: true,
        source: 'supabase',
        count: products.length,
        timestamp: new Date().toISOString(),
        products,
      });
    }

    // Se o Supabase retornou erro ou não está configurado, logar detalhadamente e responder com o erro real
    const supaError = queryResult.error;
    console.error('[API /api/products] Falha ao consultar Supabase:', {
      code: supaError?.code,
      message: supaError?.message,
      details: supaError?.details,
      hint: supaError?.hint,
    });

    const statusCode = supaError?.code === '42501' ? 403 : 500;

    return res.status(statusCode).json({
      success: false,
      source: 'supabase_error',
      products: [],
      error: supaError?.message || 'Falha ao consultar produtos no Supabase.',
      code: supaError?.code,
      details: supaError?.details,
      hint: supaError?.hint,
    });
  } catch (err: any) {
    console.error('[API /api/products] Exceção inesperada no servidor:', err);
    return res.status(500).json({
      success: false,
      source: 'server_exception',
      products: [],
      error: err?.message || 'Erro inesperado no servidor ao processar produtos.',
      details: String(err?.stack || err),
    });
  }
}

// POST /api/products
export async function handleCreateProduct(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const productData: Product = req.body;
    if (!productData || !productData.name || !productData.price) {
      return res.status(400).json({ success: false, error: 'Nome e preço são obrigatórios.' });
    }

    const id = productData.id || 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      inStock: productData.inStock ?? (productData.stockCount !== undefined ? productData.stockCount > 0 : true),
      stockCount: productData.stockCount ?? 25,
      stock: productData.stockCount ?? 25,
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 1,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseServerConfigured()) {
      const supaResult = await upsertProductInSupabaseDetailed(newProduct);
      if (!supaResult.success) {
        return res.status(500).json({
          success: false,
          error: `Erro ao gravar produto no Supabase: ${supaResult.error}`,
          hint: 'Execute fix-supabase-permissions.sql no SQL Editor do Supabase se o erro for permission denied.',
        });
      }

      addStoredProduct(newProduct);
      return res.status(201).json({
        success: true,
        source: 'supabase',
        product: supaResult.data || newProduct,
        message: 'Produto criado com sucesso no Supabase.',
      });
    }

    const localProduct = addStoredProduct(newProduct);
    return res.status(201).json({ success: true, source: 'local_fallback', product: localProduct });
  } catch (err: any) {
    console.error('[API] Erro ao criar produto:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Falha ao criar produto.' });
  }
}

// GET /api/products/:id
export async function handleGetProductById(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const id = (req.params?.id || (req.query?.id as string)) as string;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do produto não informado.' });
    }

    if (isSupabaseServerConfigured()) {
      const product = await fetchProductByIdFromSupabase(id);
      if (product) {
        return res.json({ success: true, source: 'supabase', product });
      }
      return res.status(404).json({ success: false, error: `Produto com ID ${id} não encontrado no Supabase.` });
    }

    const localProduct = getStoredProducts().find((p) => p.id === id);
    if (localProduct) {
      return res.json({ success: true, source: 'local_fallback', product: localProduct });
    }
    return res.status(404).json({ success: false, error: 'Produto não encontrado.' });
  } catch (err: any) {
    console.error('[API] Erro ao buscar produto por ID:', err);
    return res.status(500).json({ success: false, error: 'Falha ao buscar produto.' });
  }
}

// PUT /api/products/:id
export async function handleUpdateProduct(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const id = (req.params?.id || (req.query?.id as string) || req.body?.id) as string;
    const updates = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do produto não informado.' });
    }

    if (isSupabaseServerConfigured()) {
      // Obter dados base existentes para merge seguro
      const currentSupabase = await fetchProductByIdFromSupabase(id);
      const baseProduct = currentSupabase || getStoredProducts().find((p) => p.id === id);
      if (!baseProduct) {
        return res.status(404).json({ success: false, error: `Produto com ID ${id} não encontrado.` });
      }

      const mergedProduct: Product = {
        ...baseProduct,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      const supaResult = await upsertProductInSupabaseDetailed(mergedProduct);
      if (!supaResult.success) {
        return res.status(500).json({
          success: false,
          error: `Erro ao atualizar no Supabase: ${supaResult.error}`,
          hint: 'Execute fix-supabase-permissions.sql no SQL Editor do Supabase se o erro for permission denied.',
        });
      }

      // Confirmação com re-leitura direta do Supabase
      const confirmed = await fetchProductByIdFromSupabase(id);
      const finalProduct = confirmed || supaResult.data || mergedProduct;

      // Manter sincronizado localmente
      updateStoredProduct(id, updates);

      return res.json({
        success: true,
        source: 'supabase',
        product: finalProduct,
        message: 'Produto atualizado e confirmado com sucesso no Supabase.',
      });
    }

    // Fallback caso Supabase não esteja configurado
    const updatedLocal = updateStoredProduct(id, updates);
    if (!updatedLocal) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado.' });
    }

    return res.json({ success: true, source: 'local_fallback', product: updatedLocal });
  } catch (err: any) {
    console.error('[API] Erro ao atualizar produto:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Falha ao atualizar produto.' });
  }
}

// DELETE /api/products/:id
export async function handleDeleteProduct(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const id = (req.params?.id || (req.query?.id as string) || req.body?.id) as string;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do produto não informado.' });
    }

    if (isSupabaseServerConfigured()) {
      const deletedFromSupabase = await deleteProductFromSupabase(id);
      if (!deletedFromSupabase) {
        return res.status(500).json({
          success: false,
          error: 'Falha ao remover produto do Supabase. Verifique permissões da tabela products.',
        });
      }
    }

    deleteStoredProduct(id);
    return res.json({ success: true, message: 'Produto eliminado com sucesso do catálogo.' });
  } catch (err: any) {
    console.error('[API] Erro ao eliminar produto:', err);
    return res.status(500).json({ success: false, error: 'Falha ao eliminar produto.' });
  }
}

// POST /api/upload-image
// Recebe imagem, envia para Supabase Storage (bucket 'product-images') e remove a anterior apenas em caso de sucesso
export async function handleUploadImage(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const { productId, dataUrl, fileName: originalFileName, previousImageUrl } = req.body;

    if (!dataUrl) {
      return res.status(400).json({ success: false, error: 'Nenhum dado de imagem (dataUrl) recebido.' });
    }

    // Extrair mimeType e Buffer a partir do DataURL
    const match = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Formato de DataURL inválido.' });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Se o Supabase estiver configurado, envia diretamente para o Supabase Storage (bucket product-images)
    if (isSupabaseServerConfigured()) {
      console.log(`[Upload] Enviando imagem de "${productId}" para o Supabase Storage (bucket: product-images)...`);
      const storageResult = await uploadImageToSupabaseStorage(
        productId || 'prod',
        fileBuffer,
        originalFileName || 'image.webp',
        mimeType,
        previousImageUrl
      );

      if (storageResult && storageResult.url) {
        return res.json({
          success: true,
          storage: 'supabase',
          url: storageResult.url,
          fileName: storageResult.fileName,
          sizeBytes: fileBuffer.length,
          message: 'Imagem guardada no Supabase Storage com sucesso.',
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Falha ao enviar imagem para o Supabase Storage (bucket product-images).',
        });
      }
    }

    // Fallback: Armazenamento local com hash versionado se Supabase não estiver configurado
    const localResult = await saveUploadedImage(productId || 'prod', dataUrl, originalFileName);
    return res.json({
      success: true,
      storage: 'local',
      url: localResult.url,
      fileName: localResult.fileName,
      sizeBytes: localResult.sizeBytes,
      hash: localResult.hash,
      message: 'Imagem guardada localmente com versionamento de cache.',
    });
  } catch (err: any) {
    console.error('[API] Erro ao gravar imagem:', err);
    return res.status(500).json({ success: false, error: err.message || 'Falha ao processar e salvar imagem.' });
  }
}

// GET /api/orders
export async function handleGetOrders(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    if (isSupabaseServerConfigured()) {
      const supabaseOrders = await fetchOrdersFromSupabase();
      if (supabaseOrders !== null) {
        return res.json({ success: true, source: 'supabase', count: supabaseOrders.length, orders: supabaseOrders });
      }
    }

    const orders = getStoredOrders();
    return res.json({ success: true, source: 'local_fallback', count: orders.length, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Falha ao obter encomendas.' });
  }
}

// POST /api/orders
export async function handleCreateOrder(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const orderData = req.body;
    if (!orderData || !orderData.customerName || !orderData.phone || !orderData.items) {
      return res.status(400).json({ success: false, error: 'Dados da encomenda incompletos.' });
    }

    const localOrder = addStoredOrder(orderData);

    if (isSupabaseServerConfigured()) {
      await insertOrderInSupabase(localOrder);
    }

    return res.status(201).json({ success: true, order: localOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Falha ao registar encomenda.' });
  }
}

// PUT /api/orders/:id/status
export async function handleUpdateOrderStatus(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (orderStatus) {
      updateStoredOrderStatus(id, orderStatus, false);
      if (isSupabaseServerConfigured()) {
        await updateOrderStatusInSupabase(id, orderStatus, false);
      }
    }
    if (paymentStatus) {
      updateStoredOrderStatus(id, paymentStatus, true);
      if (isSupabaseServerConfigured()) {
        await updateOrderStatusInSupabase(id, paymentStatus, true);
      }
    }

    return res.json({ success: true, message: 'Estado da encomenda atualizado.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Falha ao atualizar estado da encomenda.' });
  }
}

// GET /api/supabase/status
export async function handleSupabaseStatus(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const status = await checkSupabaseStatus();
    return res.json({ success: true, ...status });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao checar Supabase' });
  }
}

// POST /api/supabase/migrate
export async function handleTriggerMigration(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    if (!isSupabaseServerConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Supabase não está configurado no ambiente. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE.',
      });
    }

    console.log('[API] Executando migração para Supabase solicitada via API...');
    const { runMigration } = await import('../scripts/migrate-to-supabase');
    const result = await runMigration();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Erro durante migração' });
  }
}

// GET /api/health
export function handleHealthCheck(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  return res.json({
    status: 'ok',
    store: 'FortiMoz EPIs Moçambique',
    supabaseConfigured: isSupabaseServerConfigured(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
