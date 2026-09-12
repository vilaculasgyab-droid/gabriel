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
  fetchProductsFromSupabase,
  upsertProductInSupabase,
  deleteProductFromSupabase,
  uploadImageToSupabaseStorage,
  fetchOrdersFromSupabase,
  insertOrderInSupabase,
  updateOrderStatusInSupabase,
  checkSupabaseStatus,
} from './supabaseAdmin';
import { runMigration } from '../scripts/migrate-to-supabase';
import { Product, Order } from '../src/types';

// Strict anti-caching headers for API responses so clients always get fresh data
export function setApiNoCacheHeaders(res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
}

// GET /api/products
export async function handleGetProducts(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    if (isSupabaseServerConfigured()) {
      const supabaseProducts = await fetchProductsFromSupabase();
      if (supabaseProducts && supabaseProducts.length > 0) {
        return res.json({
          success: true,
          source: 'supabase',
          count: supabaseProducts.length,
          timestamp: new Date().toISOString(),
          products: supabaseProducts,
        });
      }
    }

    // Fallback gracioso para dados locais quando o Supabase ainda não estiver configurado
    const products = getStoredProducts();
    return res.json({
      success: true,
      source: 'local_fallback',
      count: products.length,
      timestamp: new Date().toISOString(),
      products,
    });
  } catch (err: any) {
    console.error('[API] Erro ao obter produtos:', err);
    return res.status(500).json({ success: false, error: 'Falha ao obter catálogo de produtos.' });
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

    // Grava localmente como backup/fallback
    const localProduct = addStoredProduct(productData);

    // Se o Supabase estiver configurado, grava no Supabase (public.products)
    let finalProduct = localProduct;
    if (isSupabaseServerConfigured()) {
      const supabaseProduct = await upsertProductInSupabase(localProduct);
      if (supabaseProduct) {
        finalProduct = supabaseProduct;
      }
    }

    return res.status(201).json({ success: true, product: finalProduct });
  } catch (err: any) {
    console.error('[API] Erro ao criar produto:', err);
    return res.status(500).json({ success: false, error: 'Falha ao criar produto.' });
  }
}

// PUT /api/products/:id
export async function handleUpdateProduct(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do produto não informado.' });
    }

    // Atualiza localmente
    const updatedLocal = updateStoredProduct(id, updates);
    if (!updatedLocal) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado.' });
    }

    // Se o Supabase estiver configurado, grava a atualização no Supabase
    let finalProduct = updatedLocal;
    if (isSupabaseServerConfigured()) {
      const supabaseProduct = await upsertProductInSupabase(updatedLocal);
      if (supabaseProduct) {
        finalProduct = supabaseProduct;
      }
    }

    return res.json({ success: true, product: finalProduct });
  } catch (err: any) {
    console.error('[API] Erro ao atualizar produto:', err);
    return res.status(500).json({ success: false, error: 'Falha ao atualizar produto.' });
  }
}

// DELETE /api/products/:id
export async function handleDeleteProduct(req: Request, res: Response) {
  setApiNoCacheHeaders(res);
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do produto não informado.' });
    }

    if (isSupabaseServerConfigured()) {
      await deleteProductFromSupabase(id);
    }

    const deleted = deleteStoredProduct(id);
    return res.json({ success: true, message: 'Produto eliminado com sucesso.' });
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
        console.warn('[Upload] Falha no Supabase Storage, revertendo para armazenamento local...');
      }
    }

    // Fallback: Armazenamento local com hash versionado
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
        error: 'Supabase não está configurado no ambiente. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
      });
    }

    console.log('[API] Executando migração para Supabase solicitada via API...');
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
