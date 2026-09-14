import { Product, Order, OrderItem, ProductSpecification } from '../types';

/**
 * Pure mappers between Supabase PostgreSQL rows and Application TypeScript types.
 * Independent of runtime environment (no process.env, no import.meta).
 * Safe to import in both Node.js (CommonJS/ESM) and Vite browser environments.
 */

/**
 * Mapeia uma linha da tabela public.products do Supabase para a interface Product.
 * Suporta tanto colunas snake_case (category_id, short_description)
 * quanto camelCase (categoryId, shortDescription).
 */
export function mapDbRowToProduct(row: any): Product {
  let specs: ProductSpecification[] = [];
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
      apps = row.applications
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }

  const sizes: string[] | undefined = Array.isArray(row.available_sizes || row.availableSizes)
    ? row.available_sizes || row.availableSizes
    : undefined;

  const colors: string[] | undefined = Array.isArray(row.available_colors || row.availableColors)
    ? row.available_colors || row.availableColors
    : undefined;

  const additionalImgs: string[] | undefined = Array.isArray(row.additional_images || row.additionalImages)
    ? row.additional_images || row.additionalImages
    : undefined;

  const stockCount = Number(row.stock_count ?? row.stockCount ?? row.stock ?? 25);
  const inStock = Boolean(row.in_stock ?? row.inStock ?? stockCount > 0);

  return {
    id: String(row.id),
    name: String(row.name || ''),
    categoryId: String(row.category_id || row.categoryId || 'geral'),
    categoryName: String(row.category_name || row.categoryName || 'Equipamentos EPI'),
    subcategory: String(row.subcategory || 'Proteção Individual'),
    price: Number(row.price || 0),
    originalPrice: row.original_price ?? row.originalPrice ? Number(row.original_price ?? row.originalPrice) : undefined,
    image: String(row.image || ''),
    additionalImages: additionalImgs,
    badge: row.badge || undefined,
    norm: row.norm || undefined,
    shortDescription: String(row.short_description || row.shortDescription || row.name || ''),
    description: String(row.description || row.short_description || row.name || ''),
    specifications: specs,
    applications: apps,
    inStock,
    stockCount,
    stock: stockCount,
    featured: Boolean(row.featured ?? false),
    availableSizes: sizes,
    availableColors: colors,
    rating: Number(row.rating ?? 5.0),
    reviewsCount: Number(row.reviews_count ?? row.reviewsCount ?? 1),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

/**
 * Converte um objeto Product para o formato padrão de inserção/atualização no Supabase.
 * Fornece formato snake_case padrão com campos completos.
 */
export function mapProductToDbRow(product: Product): Record<string, any> {
  const stock = product.stockCount ?? product.stock ?? 25;
  const inStock = product.inStock !== undefined ? product.inStock : stock > 0;

  return {
    id: product.id,
    name: product.name,
    category_id: product.categoryId,
    category_name: product.categoryName,
    subcategory: product.subcategory,
    price: product.price,
    original_price: product.originalPrice ?? null,
    image: product.image,
    additional_images: product.additionalImages || [],
    badge: product.badge ?? null,
    norm: product.norm ?? null,
    short_description: product.shortDescription,
    description: product.description,
    specifications: product.specifications || [],
    applications: product.applications || [],
    in_stock: inStock,
    stock_count: stock,
    stock: stock,
    featured: Boolean(product.featured),
    available_sizes: product.availableSizes || [],
    available_colors: product.availableColors || [],
    rating: product.rating ?? 5.0,
    reviews_count: product.reviewsCount ?? 1,
    created_at: product.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Mapeia uma linha da tabela public.orders para a interface Order.
 */
export function mapDbRowToOrder(row: any): Order {
  const items: OrderItem[] = Array.isArray(row.items)
    ? row.items
    : typeof row.items === 'string'
    ? JSON.parse(row.items)
    : [];

  return {
    id: String(row.id),
    orderNumber: String(row.order_number || row.orderNumber || `PSG-${row.id}`),
    customerName: String(row.customer_name || row.customerName || ''),
    phone: String(row.phone || ''),
    email: row.email || undefined,
    companyName: row.company_name || row.companyName || undefined,
    deliveryLocation: String(row.delivery_location || row.deliveryLocation || ''),
    cityProvince: String(row.city_province || row.cityProvince || 'Maputo'),
    items,
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    paymentMethod: (row.payment_method || row.paymentMethod || 'mpesa') as any,
    paymentStatus: (row.payment_status || row.paymentStatus || 'pending') as any,
    orderStatus: (row.order_status || row.orderStatus || 'awaiting_payment') as any,
    notes: row.notes || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

/**
 * Converte um objeto Order para inserção no Supabase.
 */
export function mapOrderToDbRow(order: Order): Record<string, any> {
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    phone: order.phone,
    email: order.email || null,
    company_name: order.companyName || null,
    delivery_location: order.deliveryLocation,
    city_province: order.cityProvince,
    items: order.items,
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    notes: order.notes || null,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString(),
  };
}
