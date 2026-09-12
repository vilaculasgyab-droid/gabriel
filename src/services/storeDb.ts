import { Product, Order, Customer, DashboardMetrics, OrderStatus, PaymentStatus, PaymentMethod, CartItem } from '../types';
import { PRODUCTS } from '../data/products';
import { imageStorage } from './imageStorage';
import { isSupabaseConfigured, getSupabaseClient, mapDbRowToProduct, mapDbRowToOrder } from '../lib/supabase';

const PRODUCTS_KEY = 'fortimoz_db_products_v2';
const LEGACY_PRODUCTS_KEY = 'proseguranca_db_products_v1';
const ORDERS_KEY = 'fortimoz_db_orders_v2';
const LEGACY_ORDERS_KEY = 'proseguranca_db_orders_v2';

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error notifying db subscriber', e);
    }
  });
}

// In-memory runtime cache for instantaneous synchronous reads
let inMemoryProducts: Product[] | null = null;
let inMemoryOrders: Order[] | null = null;
let isSyncingProducts = false;
let isSyncingOrders = false;
let hasLoadedFromSupabase = false;
let lastProductSyncTimestamp = 0;
let lastOrderSyncTimestamp = 0;
let lastProductSyncSource: 'supabase_direct' | 'server_api' | 'cache' | 'none' = 'none';
let lastSupabaseError: string | null = null;

export const storeDb = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  hasLoadedFromSupabase(): boolean {
    return hasLoadedFromSupabase;
  },

  isSyncing(): boolean {
    return isSyncingProducts;
  },

  getLastError(): string | null {
    return lastSupabaseError;
  },

  invalidateCache(): void {
    lastProductSyncTimestamp = 0;
    try {
      localStorage.removeItem(PRODUCTS_KEY);
    } catch {}
  },

  /**
   * Sincroniza o catálogo de produtos exclusivamente com o Supabase.
   * O Supabase é a ÚNICA fonte de verdade dos produtos.
   * 1. Supabase Client direto (quando configurado no frontend via VITE_SUPABASE_URL)
   * 2. Endpoint seguro /api/products (que consulta public.products via service_role)
   */
  async syncWithServer(force = false): Promise<boolean> {
    const now = Date.now();
    if (isSyncingProducts || (!force && now - lastProductSyncTimestamp < 1500)) {
      return false;
    }

    isSyncingProducts = true;
    try {
      // 1. Consulta direta ao Supabase Client se configurado no frontend
      if (isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data, error } = await client
              .from('products')
              .select('*')
              .order('id', { ascending: true });

            if (error) {
              lastSupabaseError = error.message;
              console.warn('[storeDb] Supabase DB retornou erro na consulta direta:', error.message);
            } else if (Array.isArray(data) && data.length > 0) {
              const mapped = data.map(mapDbRowToProduct);
              inMemoryProducts = mapped;
              hasLoadedFromSupabase = true;
              lastProductSyncSource = 'supabase_direct';
              lastSupabaseError = null;
              try {
                localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mapped));
              } catch {}
              notifyListeners();
              lastProductSyncTimestamp = Date.now();
              return true;
            }
          } catch (supaErr: any) {
            lastSupabaseError = supaErr?.message || String(supaErr);
            console.warn('[storeDb] Consulta direta falhou, tentando API do servidor:', supaErr);
          }
        }
      }

      // 2. Consulta via API do servidor (/api/products com cabeçalhos no-cache estritos)
      const res = await fetch(`/api/products?_t=${now}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          const remoteProducts: Product[] = data.products;
          inMemoryProducts = remoteProducts;
          hasLoadedFromSupabase = true;
          lastProductSyncSource = data.source === 'supabase' ? 'server_api' : 'cache';
          lastSupabaseError = null;
          try {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(remoteProducts));
          } catch (e) {
            console.warn('Falha ao guardar cache temporário:', e);
          }
          notifyListeners();
          lastProductSyncTimestamp = Date.now();
          return true;
        } else {
          lastSupabaseError = data?.error || 'Nenhum produto retornado do Supabase.';
        }
      } else {
        try {
          const errData = await res.json();
          lastSupabaseError = errData?.error || `Erro HTTP ${res.status} ao consultar Supabase.`;
        } catch {
          lastSupabaseError = `Erro HTTP ${res.status} ao consultar Supabase.`;
        }
      }
    } catch (err: any) {
      lastSupabaseError = err?.message || 'Servidor remoto não alcançado.';
      console.warn('[storeDb] Erro ao sincronizar com Supabase:', err);
    } finally {
      isSyncingProducts = false;
    }
    return false;
  },

  /**
   * Sincroniza a lista de encomendas com o Supabase/Servidor.
   */
  async syncOrdersWithServer(force = false): Promise<boolean> {
    const now = Date.now();
    if (isSyncingOrders || (!force && now - lastOrderSyncTimestamp < 2000)) {
      return false;
    }

    isSyncingOrders = true;
    try {
      // 1. Tentar Supabase direto se configurado
      if (isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data, error } = await client
              .from('orders')
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && Array.isArray(data)) {
              const mapped = data.map(mapDbRowToOrder);
              inMemoryOrders = mapped;
              try {
                localStorage.setItem(ORDERS_KEY, JSON.stringify(mapped));
              } catch {
                // ignore
              }
              notifyListeners();
              lastOrderSyncTimestamp = Date.now();
              return true;
            }
          } catch (e) {
            // fallback
          }
        }
      }

      // 2. Tentar API do servidor
      const res = await fetch(`/api/orders?_t=${now}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.orders)) {
          inMemoryOrders = data.orders;
          try {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
          } catch (e) {
            // ignore
          }
          notifyListeners();
          lastOrderSyncTimestamp = Date.now();
          return true;
        }
      }
    } catch (err) {
      console.warn('[storeDb] Falha ao sincronizar pedidos com o servidor.');
    } finally {
      isSyncingOrders = false;
    }
    return false;
  },

  // ----------------------------------------------------
  // PRODUCTS (Supabase is the sole source of truth)
  // ----------------------------------------------------
  getProducts(): Product[] {
    if (inMemoryProducts && inMemoryProducts.length > 0) {
      return inMemoryProducts;
    }

    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryProducts = parsed;
          // Dispara revalidação em segundo plano para garantir frescor
          if (!isSyncingProducts && Date.now() - lastProductSyncTimestamp > 3000) {
            setTimeout(() => this.syncWithServer(false), 50);
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Se ainda não carregou do Supabase e não há cache, dispara sync imediato
    if (!isSyncingProducts) {
      setTimeout(() => this.syncWithServer(true), 10);
    }
    return [];
  },

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find((p) => p.id === id);
  },

  getSyncDiagnostics(): { source: string; lastError: string | null; lastSync: number } {
    return {
      source: lastProductSyncSource,
      lastError: lastSupabaseError,
      lastSync: lastProductSyncTimestamp,
    };
  },

  addProduct(productData: Omit<Product, 'id'> & { id?: string }): Product {
    const products = this.getProducts();
    const id = productData.id || 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const now = new Date().toISOString();

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
    inMemoryProducts = updated;
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Aviso: erro ao persistir no localStorage:', e);
    }

    if (newProduct.image && newProduct.image.startsWith('data:')) {
      imageStorage.saveImage(id, newProduct.image);
    }

    notifyListeners();

    // Sincronizar criação com Supabase via servidor protegido
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch((err) => {
      console.warn('[storeDb] Erro ao sincronizar novo produto:', err);
    });

    return newProduct;
  },

  /**
   * Cria produto de forma assíncrona enviando diretamente para o Supabase (/api/products).
   * Lança erro explícito se a gravação for rejeitada.
   */
  async addProductAsync(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.product) {
      const errMsg = data.error || 'Falha ao gravar produto no Supabase.';
      throw new Error(errMsg);
    }

    const finalProduct: Product = data.product;
    const products = this.getProducts();
    const updated = [finalProduct, ...products.filter((p) => p.id !== finalProduct.id)];
    inMemoryProducts = updated;
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    notifyListeners();
    return finalProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = products[index];
    const now = new Date().toISOString();
    const updatedProduct: Product = {
      ...current,
      ...updates,
      updatedAt: now,
    };

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
    inMemoryProducts = [...products];

    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(inMemoryProducts));
    } catch (e) {
      console.warn('Aviso: erro ao persistir no localStorage:', e);
    }

    if (updates.image && updates.image.startsWith('data:')) {
      imageStorage.saveImage(id, updates.image);
    }

    notifyListeners();

    // Sincronizar atualização com Supabase via servidor protegido
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    }).catch((err) => {
      console.warn('[storeDb] Erro ao sincronizar atualização:', err);
    });

    return updatedProduct;
  },

  /**
   * Atualiza produto de forma assíncrona com validação estrita no Supabase (/api/products/:id).
   * Lança erro explícito se o Supabase recusar a atualização.
   */
  async updateProductAsync(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.product) {
      const errMsg = data.error || 'Falha ao atualizar produto no Supabase.';
      throw new Error(errMsg);
    }

    const finalProduct: Product = data.product;
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = finalProduct;
      inMemoryProducts = [...products];
    } else {
      inMemoryProducts = [finalProduct, ...products];
    }

    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(inMemoryProducts));
    } catch {
      // ignore
    }

    notifyListeners();
    return finalProduct;
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    inMemoryProducts = filtered;
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    notifyListeners();

    // Sincronizar exclusão com Supabase via servidor protegido
    fetch(`/api/products/${id}`, {
      method: 'DELETE',
    }).catch((err) => {
      console.warn('[storeDb] Erro ao sincronizar eliminação:', err);
    });

    return true;
  },

  /**
   * Remove produto no Supabase de forma assíncrona.
   */
  async deleteProductAsync(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const errMsg = data.error || 'Falha ao excluir produto no Supabase.';
      throw new Error(errMsg);
    }

    const products = this.getProducts().filter((p) => p.id !== id);
    inMemoryProducts = products;
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }

    notifyListeners();
    return true;
  },

  toggleProductStatus(id: string): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    this.updateProduct(id, { inStock: !product.inStock });
    return true;
  },

  toggleProductFeatured(id: string): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    this.updateProduct(id, { featured: !product.featured });
    return true;
  },

  updateStock(id: string, newStock: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    const count = Math.max(0, newStock);
    this.updateProduct(id, {
      stock: count,
      stockCount: count,
      inStock: count > 0,
    });
    return true;
  },

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------
  getOrders(): Order[] {
    if (inMemoryOrders) {
      return inMemoryOrders;
    }

    try {
      if (localStorage.getItem(LEGACY_ORDERS_KEY)) {
        localStorage.removeItem(LEGACY_ORDERS_KEY);
      }
    } catch {
      // ignore
    }

    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const realOrders = parsed.filter(
            (o) =>
              o &&
              o.id !== 'ord-1082' &&
              o.id !== 'ord-1081' &&
              o.id !== 'ord-1080' &&
              o.id !== 'ord-1079' &&
              o.customerName !== 'Manuel Chissano' &&
              o.customerName !== 'Engª. Amina Patel' &&
              o.customerName !== 'Alberto Cossa' &&
              o.customerName !== 'Dr. Fernando Machava'
          );
          inMemoryOrders = realOrders;
          return realOrders;
        }
      }
    } catch {
      // ignore
    }

    inMemoryOrders = [];
    return [];
  },

  getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.orderNumber === id);
  },

  createOrder(data: {
    customerName: string;
    phone: string;
    email?: string;
    companyName?: string;
    deliveryLocation: string;
    cityProvince: string;
    items: CartItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Order {
    const orders = this.getOrders();
    const orderNumSequence = 1001 + orders.length;
    const orderNumber = `PSG-2026-${orderNumSequence}`;
    const id = `ord-${Date.now()}`;

    const orderItems = data.items.map((it) => ({
      productId: it.product.id,
      productName: it.product.name,
      productImage: it.product.image,
      price: it.product.price,
      quantity: it.quantity,
      selectedSize: it.selectedSize,
      selectedColor: it.selectedColor,
      total: it.product.price * it.quantity,
    }));

    const newOrder: Order = {
      id,
      orderNumber,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || '',
      companyName: data.companyName || '',
      deliveryLocation: data.deliveryLocation,
      cityProvince: data.cityProvince,
      items: orderItems,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'awaiting_payment',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Atualiza estoque local
    data.items.forEach((item) => {
      const prod = this.getProductById(item.product.id);
      if (prod && typeof prod.stockCount === 'number') {
        const newCount = Math.max(0, prod.stockCount - item.quantity);
        this.updateStock(prod.id, newCount);
      }
    });

    const updated = [newOrder, ...orders];
    inMemoryOrders = updated;
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    notifyListeners();

    // Sincronizar com Supabase via servidor
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((err) => {
      console.warn('[storeDb] Erro ao sincronizar encomenda com o servidor:', err);
    });

    return newOrder;
  },

  updateOrderStatus(id: string, status: OrderStatus): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return false;

    orders[index].orderStatus = status;
    if (status === 'paid') {
      orders[index].paymentStatus = 'paid';
    }
    orders[index].updatedAt = new Date().toISOString();

    inMemoryOrders = [...orders];
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
    notifyListeners();

    // Sincronizar atualização de status com o servidor / Supabase
    fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: status }),
    }).catch((err) => {
      console.warn('[storeDb] Erro ao atualizar status do pedido no servidor:', err);
    });

    return true;
  },

  updatePaymentStatus(id: string, status: PaymentStatus): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return false;

    orders[index].paymentStatus = status;
    if (status === 'paid' && orders[index].orderStatus === 'awaiting_payment') {
      orders[index].orderStatus = 'paid';
    }
    orders[index].updatedAt = new Date().toISOString();

    inMemoryOrders = [...orders];
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
    notifyListeners();

    // Sincronizar atualização de pagamento com o servidor / Supabase
    fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: status }),
    }).catch((err) => {
      console.warn('[storeDb] Erro ao atualizar status de pagamento no servidor:', err);
    });

    return true;
  },

  deleteOrder(id: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id !== id);
    if (filtered.length === orders.length) return false;

    inMemoryOrders = filtered;
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    notifyListeners();
    return true;
  },

  // ----------------------------------------------------
  // CUSTOMERS (Derivado das encomendas reais)
  // ----------------------------------------------------
  getCustomers(): Customer[] {
    const orders = this.getOrders();
    if (orders.length === 0) {
      return [];
    }

    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const key = order.phone.replace(/\D/g, '') || order.customerName.toLowerCase().trim();
      if (!key) return;

      const existing = customerMap.get(key);

      if (existing) {
        existing.totalOrders += 1;
        if (order.paymentStatus === 'paid' || order.orderStatus === 'delivered') {
          existing.totalSpent += order.totalAmount;
        }
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
          existing.cityProvince = order.cityProvince || existing.cityProvince;
          if (order.companyName) existing.companyName = order.companyName;
          if (order.email) existing.email = order.email;
        }
        if (new Date(order.createdAt) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = order.createdAt;
        }
        if (existing.recentOrders && !existing.recentOrders.includes(order.orderNumber)) {
          existing.recentOrders.push(order.orderNumber);
        }
      } else {
        customerMap.set(key, {
          id: `cust-${key}`,
          name: order.customerName,
          phone: order.phone,
          whatsapp: order.phone,
          email: order.email || undefined,
          companyName: order.companyName || undefined,
          cityProvince: order.cityProvince,
          totalOrders: 1,
          totalSpent: order.paymentStatus === 'paid' || order.orderStatus === 'delivered' ? order.totalAmount : 0,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
          recentOrders: [order.orderNumber],
        });
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  },

  // ----------------------------------------------------
  // METRICS & DASHBOARD
  // ----------------------------------------------------
  getDashboardMetrics(): DashboardMetrics {
    const orders = this.getOrders();
    const products = this.getProducts();
    const customers = this.getCustomers();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === 'awaiting_payment').length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'paid' || o.orderStatus === 'delivered').length;
    
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'delivered' || o.orderStatus === 'in_preparation' || o.orderStatus === 'shipped')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalProducts = products.length;
    const outOfStockCount = products.filter((p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)).length;
    const lowStockCount = products.filter((p) => p.inStock && p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 5).length;

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenue,
      totalProducts,
      outOfStockCount,
      lowStockCount,
      totalCustomers: customers.length,
      recentOrders: orders.slice(0, 6),
    };
  },

  // ----------------------------------------------------
  // RESET / BACKUP
  // ----------------------------------------------------
  resetToDefaults(): void {
    inMemoryProducts = [...PRODUCTS];
    inMemoryOrders = [];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    try {
      localStorage.removeItem(LEGACY_ORDERS_KEY);
    } catch {
      // ignore
    }
    notifyListeners();
  },

  exportDatabaseJson(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      orders: this.getOrders(),
      customers: this.getCustomers(),
      metrics: this.getDashboardMetrics(),
    };
    return JSON.stringify(data, null, 2);
  },
};
