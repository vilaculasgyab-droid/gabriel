export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  image: string;
  productCount: number;
  featuredItems: string[];
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  price: number; // in Mozambican Meticais (MZN)
  originalPrice?: number; // Preço promocional opcional (de/por)
  image: string;
  additionalImages?: string[];
  badge?: string;
  norm?: string; // e.g. "EN 397", "EN 388 (4543C)", "EN ISO 20345 S3"
  shortDescription: string;
  description: string;
  specifications: ProductSpecification[]; // Características
  applications: string[];
  inStock: boolean; // Estado: Disponível / Esgotado
  stock?: number; // Estoque numérico
  stockCount?: number;
  featured?: boolean;
  minQuantity?: number;
  availableSizes?: string[]; // Tamanhos quando aplicável
  availableColors?: string[];
  rating: number;
  reviewsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CheckoutFormData {
  customerName: string;
  phone: string;
  email?: string;
  companyName?: string;
  deliveryLocation: string;
  cityProvince: string;
  paymentMethod: 'mpesa' | 'emola' | 'transfer' | 'cash_delivery' | 'visa';
  notes?: string;
}

export interface QuoteFormData {
  companyName: string; // Nome da empresa
  contactName: string; // Nome do responsável
  phone: string; // Telefone
  email: string; // Email
  workType: string; // Tipo de obra
  workLocation: string; // Local da obra
  itemsNeeded: string; // Produtos necessários
  quantity: string; // Quantidade
  message: string; // Mensagem
}

export type OrderStatus = 
  | 'awaiting_payment' // Aguardando pagamento
  | 'paid'             // Pago
  | 'in_preparation'   // Em preparação
  | 'shipped'          // Enviado
  | 'delivered'        // Entregue
  | 'cancelled';       // Cancelado

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'mpesa' | 'emola' | 'transfer' | 'cash_delivery' | 'visa';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PSG-2026-1082"
  customerName: string;
  phone: string;
  email?: string;
  companyName?: string;
  deliveryLocation: string;
  cityProvince: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  companyName?: string;
  cityProvince: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  recentOrders?: string[]; // Order IDs
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'manager';
  avatar?: string;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
}

export interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalCustomers: number;
  recentOrders: Order[];
}


