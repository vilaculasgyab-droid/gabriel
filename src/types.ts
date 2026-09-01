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
  companyName?: string;
  deliveryLocation: string;
  cityProvince: string;
  paymentMethod: 'mpesa' | 'emola' | 'transfer' | 'cash_delivery';
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

