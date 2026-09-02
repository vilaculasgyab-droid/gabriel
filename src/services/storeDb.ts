import { Product, Order, Customer, DashboardMetrics, OrderStatus, PaymentStatus, PaymentMethod, CartItem } from '../types';
import { PRODUCTS } from '../data/products';

const PRODUCTS_KEY = 'proseguranca_db_products_v1';
const ORDERS_KEY = 'proseguranca_db_orders_v1';
const CUSTOMERS_KEY = 'proseguranca_db_customers_v1';

// Initial seed orders for Mozambique
const INITIAL_SEED_ORDERS: Order[] = [
  {
    id: 'ord-1082',
    orderNumber: 'PSG-2026-1082',
    customerName: 'Manuel Chissano',
    phone: '+258 84 312 9941',
    email: 'm.chissano@mcel.co.mz',
    companyName: 'Chissano Construções Lda',
    deliveryLocation: 'Av. Vladimir Lenine nº 1420, Polana',
    cityProvince: 'Maputo Cidade',
    totalAmount: 18450,
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    notes: 'Entregar na guarita principal da obra.',
    createdAt: '2026-08-29T09:15:00.000Z',
    updatedAt: '2026-08-30T14:30:00.000Z',
    items: [
      {
        productId: 'prod-001',
        productName: 'Capacete de Segurança com Catraca EN 397',
        productImage: '/products/prod_capacete_amarelo_1788241366367.jpg',
        price: 850,
        quantity: 10,
        selectedColor: 'Amarelo',
        total: 8500,
      },
      {
        productId: 'prod-004',
        productName: 'Bota de Segurança Couro S3 c/ Biqueira de Aço',
        productImage: '/products/prod_botas_s3_preta_1788241571160.jpg',
        price: 2450,
        quantity: 4,
        selectedSize: '42',
        total: 9800,
      },
      {
        productId: 'prod-002',
        productName: 'Colete Refletor de Alta Visibilidade EN 20471',
        productImage: '/products/prod_colete_laranja_1788241390542.jpg',
        price: 150,
        quantity: 1,
        selectedSize: 'L',
        selectedColor: 'Laranja Refletivo',
        total: 150,
      },
    ],
  },
  {
    id: 'ord-1081',
    orderNumber: 'PSG-2026-1081',
    customerName: 'Engª. Amina Patel',
    phone: '+258 82 554 1120',
    email: 'amina.patel@mozind.co.mz',
    companyName: 'Mozambique Industrial Services',
    deliveryLocation: 'Estrada Nacional nº 4, Km 12, Parque Industrial de Beluluane',
    cityProvince: 'Maputo Província (Matola)',
    totalAmount: 32600,
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    orderStatus: 'in_preparation',
    notes: 'Faturação com NUIT 400892314.',
    createdAt: '2026-08-31T11:40:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    items: [
      {
        productId: 'prod-007',
        productName: 'Arnês de Segurança Paraquedista 4 Pontos',
        productImage: '/products/prod_arnes_seguranca_1788241690396.jpg',
        price: 3800,
        quantity: 6,
        total: 22800,
      },
      {
        productId: 'prod-006',
        productName: 'Abafador de Ruído Tipo Concha 27dB',
        productImage: '/products/prod_abafador_concha_1788241666782.jpg',
        price: 1400,
        quantity: 7,
        total: 9800,
      },
    ],
  },
  {
    id: 'ord-1080',
    orderNumber: 'PSG-2026-1080',
    customerName: 'Alberto Cossa',
    phone: '+258 87 900 2314',
    email: 'cossa.alberto@gmail.com',
    companyName: 'Mecânica Rápida do Porto',
    deliveryLocation: 'Zona Portuária de Maputo, Terminal de Carga',
    cityProvince: 'Maputo Cidade',
    totalAmount: 6900,
    paymentMethod: 'emola',
    paymentStatus: 'pending',
    orderStatus: 'awaiting_payment',
    notes: 'Ligar 30 minutos antes da entrega.',
    createdAt: '2026-09-01T15:20:00.000Z',
    updatedAt: '2026-09-01T15:20:00.000Z',
    items: [
      {
        productId: 'prod-003',
        productName: 'Luvas de Proteção Anticorte Nível 5',
        productImage: '/products/prod_luvas_pu_1788241516995.jpg',
        price: 450,
        quantity: 8,
        selectedSize: 'L',
        total: 3600,
      },
      {
        productId: 'prod-005',
        productName: 'Máscara Respiratória N95 com Válvula',
        productImage: '/products/prod_mascara_n95_valvula_1788241626119.jpg',
        price: 110,
        quantity: 30,
        total: 3300,
      },
    ],
  },
  {
    id: 'ord-1079',
    orderNumber: 'PSG-2026-1079',
    customerName: 'Dr. Fernando Machava',
    phone: '+258 84 991 4321',
    email: 'machava.obras@beira-infra.mz',
    companyName: 'Beira Infraestruturas',
    deliveryLocation: 'Bairro do Estoril, Rua da Manga nº 45',
    cityProvince: 'Sofala (Beira)',
    totalAmount: 14750,
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    notes: 'Envio via transportadora expresso para a Beira.',
    createdAt: '2026-08-30T16:00:00.000Z',
    updatedAt: '2026-08-31T17:10:00.000Z',
    items: [
      {
        productId: 'prod-008',
        productName: 'Cone de Sinalização Refletor 75cm',
        productImage: '/products/prod_cone_sinalizacao_1788241721417.jpg',
        price: 950,
        quantity: 10,
        total: 9500,
      },
      {
        productId: 'prod-009',
        productName: 'Óculos de Proteção Panorâmicos Anti-Embaciamento',
        productImage: '/products/prod_oculos_transparente_1788241457094.jpg',
        price: 350,
        quantity: 15,
        total: 5250,
      },
    ],
  },
];

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
  // PRODUCTS
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

    // Initialize with default PRODUCTS
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
  // ORDERS
  // ----------------------------------------------------
  getOrders(): Order[] {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_SEED_ORDERS));
    } catch (e) {
      console.error('Failed to save initial orders', e);
    }
    return INITIAL_SEED_ORDERS;
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
    const orderNumSequence = 1083 + orders.length;
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
      paymentStatus: data.paymentMethod === 'mpesa' || data.paymentMethod === 'emola' ? 'pending' : 'pending',
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
  // CUSTOMERS
  // ----------------------------------------------------
  getCustomers(): Customer[] {
    const orders = this.getOrders();
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const key = order.phone.replace(/\D/g, '') || order.customerName.toLowerCase().trim();
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
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_SEED_ORDERS));
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
