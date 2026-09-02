import { Product, Order, Customer, DashboardMetrics, OrderStatus, PaymentStatus, PaymentMethod, CartItem } from '../types';
import { PRODUCTS } from '../data/products';

const PRODUCTS_KEY = 'proseguranca_db_products_v1';
const ORDERS_KEY = 'proseguranca_db_orders_v2';

// Legacy keys to clean up old mock/demo data
const LEGACY_ORDERS_KEY = 'proseguranca_db_orders_v1';

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

export const storeDb = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // ----------------------------------------------------
  // PRODUCTS (Keeps the real catalog of PPEs intact)
  // ----------------------------------------------------
  getProducts(): Product[] {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Initialize with default real PRODUCTS catalog
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
    } catch (e) {
      console.error('Failed to save initial products', e);
    }
    return PRODUCTS;
  },

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find((p) => p.id === id);
  },

  addProduct(productData: Omit<Product, 'id'> & { id?: string }): Product {
    const products = this.getProducts();
    const id = productData.id || 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    
    const newProduct: Product = {
      ...productData,
      id,
      inStock: productData.inStock ?? (productData.stockCount !== undefined ? productData.stockCount > 0 : true),
      stockCount: productData.stockCount ?? (productData.stock ?? 25),
      stock: productData.stockCount ?? (productData.stock ?? 25),
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    notifyListeners();
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = products[index];
    const updatedProduct: Product = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Keep inStock synchronized with stock count if stock changed
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
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    notifyListeners();
    return updatedProduct;
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
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
  // ORDERS (Strictly starts empty with 0 orders, no mock data)
  // ----------------------------------------------------
  getOrders(): Order[] {
    // Purge legacy mock data if present
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
          // Filter out any leftover mock orders with IDs containing mock references
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
          return realOrders;
        }
      }
    } catch {
      // ignore
    }

    // Default to empty array (0 orders)
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

    // Deduct stock for ordered products
    data.items.forEach((item) => {
      const prod = this.getProductById(item.product.id);
      if (prod && typeof prod.stockCount === 'number') {
        const newCount = Math.max(0, prod.stockCount - item.quantity);
        this.updateStock(prod.id, newCount);
      }
    });

    const updated = [newOrder, ...orders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    notifyListeners();
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

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    notifyListeners();
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

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    notifyListeners();
    return true;
  },

  deleteOrder(id: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id !== id);
    if (filtered.length === orders.length) return false;

    localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
    notifyListeners();
    return true;
  },

  // ----------------------------------------------------
  // CUSTOMERS (Derived purely from real client orders)
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
