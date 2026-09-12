import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order } from '../src/types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../src/data/products';

// Paths for persistent data
const DATA_DIR = path.resolve(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'products');
const DIST_UPLOADS_DIR = path.resolve(process.cwd(), 'dist', 'uploads', 'products');

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  // If dist exists, also ensure dist uploads directory
  if (fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    if (!fs.existsSync(DIST_UPLOADS_DIR)) {
      fs.mkdirSync(DIST_UPLOADS_DIR, { recursive: true });
    }
  }
}

// In-memory cache for fast responses
let cachedProducts: Product[] | null = null;
let cachedOrders: Order[] | null = null;

// Initialize or load products
export function getStoredProducts(): Product[] {
  if (cachedProducts) {
    return cachedProducts;
  }

  ensureDirs();

  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedProducts = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('[storeData] Erro ao ler products.json:', err);
  }

  // Seed with initial real products
  cachedProducts = [...INITIAL_PRODUCTS];
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(cachedProducts, null, 2), 'utf-8');
  } catch (err) {
    console.error('[storeData] Erro ao criar ficheiro inicial products.json:', err);
  }

  return cachedProducts;
}

// Save products to persistent file
export function saveStoredProducts(products: Product[]): boolean {
  ensureDirs();
  cachedProducts = products;
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[storeData] Erro ao guardar products.json:', err);
    return false;
  }
}

// Update single product
export function updateStoredProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updatedProduct: Product = {
    ...products[index],
    ...updates,
    updatedAt: now,
  };

  // Sync inStock with stockCount if changed
  if (updates.stockCount !== undefined) {
    updatedProduct.stock = updates.stockCount;
    if (updates.inStock === undefined) {
      updatedProduct.inStock = updates.stockCount > 0;
    }
  } else if (updates.stock !== undefined) {
    updatedProduct.stockCount = updates.stock;
    if (updates.inStock === undefined) {
      updatedProduct.inStock = updates.stock > 0;
    }
  }

  products[index] = updatedProduct;
  saveStoredProducts(products);
  return updatedProduct;
}

// Add product
export function addStoredProduct(productData: Omit<Product, 'id'> & { id?: string }): Product {
  const products = getStoredProducts();
  const now = new Date().toISOString();
  const id = productData.id || 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  const newProduct: Product = {
    ...productData,
    id,
    inStock: productData.inStock ?? (productData.stockCount !== undefined ? productData.stockCount > 0 : true),
    stockCount: productData.stockCount ?? (productData.stock ?? 25),
    stock: productData.stockCount ?? (productData.stock ?? 25),
    rating: productData.rating || 5.0,
    reviewsCount: productData.reviewsCount || 1,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newProduct, ...products];
  saveStoredProducts(updated);
  return newProduct;
}

// Delete product
export function deleteStoredProduct(id: string): boolean {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;

  saveStoredProducts(filtered);
  return true;
}

// Orders persistence
export function getStoredOrders(): Order[] {
  if (cachedOrders) return cachedOrders;
  ensureDirs();

  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedOrders = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('[storeData] Erro ao ler orders.json:', err);
  }

  cachedOrders = [];
  return cachedOrders;
}

export function saveStoredOrders(orders: Order[]): boolean {
  ensureDirs();
  cachedOrders = orders;
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[storeData] Erro ao guardar orders.json:', err);
    return false;
  }
}

export function addStoredOrder(order: Order): Order {
  const orders = getStoredOrders();
  const updated = [order, ...orders];
  saveStoredOrders(updated);
  return order;
}

export function updateStoredOrderStatus(id: string, status: string, isPayment = false): boolean {
  const orders = getStoredOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return false;

  const now = new Date().toISOString();
  if (isPayment) {
    orders[index].paymentStatus = status as any;
    if (status === 'paid' && orders[index].orderStatus === 'awaiting_payment') {
      orders[index].orderStatus = 'paid' as any;
    }
  } else {
    orders[index].orderStatus = status as any;
    if (status === 'paid') {
      orders[index].paymentStatus = 'paid' as any;
    }
  }
  orders[index].updatedAt = now;
  saveStoredOrders(orders);
  return true;
}

/**
 * Salva uma imagem recebida com nome criptograficamente único e timestamp,
 * garantindo que novos visitantes e outros navegadores recebam imediatamente
 * a nova imagem através de um URL com versionamento e sem colisões de cache.
 */
export async function saveUploadedImage(
  productId: string,
  dataUrlOrBuffer: string | Buffer,
  originalFileName?: string
): Promise<{ url: string; fileName: string; sizeBytes: number; hash: string }> {
  ensureDirs();

  let buffer: Buffer;
  let extension = 'webp';

  if (typeof dataUrlOrBuffer === 'string') {
    // Parse data URL: data:image/webp;base64,.....
    const match = dataUrlOrBuffer.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match) {
      const mimeSub = match[1].toLowerCase();
      extension = mimeSub === 'jpeg' ? 'jpg' : mimeSub;
      buffer = Buffer.from(match[2], 'base64');
    } else {
      buffer = Buffer.from(dataUrlOrBuffer, 'utf-8');
    }
  } else {
    buffer = dataUrlOrBuffer;
  }

  // Generate cryptographic content hash for absolute cache busting
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 10);
  const timestamp = Date.now();
  const cleanId = (productId || 'prod').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

  // Unique filename that will NEVER collide with old cache entries
  const fileName = `prod_${cleanId}_${timestamp}_${hash}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  // If dist uploads directory exists, also copy it so production build sees it
  try {
    if (fs.existsSync(DIST_UPLOADS_DIR)) {
      fs.writeFileSync(path.join(DIST_UPLOADS_DIR, fileName), buffer);
    }
  } catch {
    // ignore
  }

  // Versioned URL with timestamp and hash query for multiple-tier cache busting
  const publicUrl = `/uploads/products/${fileName}?v=${timestamp}_${hash}`;

  return {
    url: publicUrl,
    fileName,
    sizeBytes: buffer.length,
    hash,
  };
}
