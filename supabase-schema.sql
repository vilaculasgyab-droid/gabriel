-- =============================================================================
-- FORTIMOZ - ESQUEMA OFICIAL SUPABASE (DATABASE & STORAGE)
-- =============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase se ainda não tiver
-- criado as tabelas e políticas de segurança (RLS).
-- =============================================================================

-- 1. TABELA DE PRODUTOS (public.products)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT NOT NULL,
  additional_images JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  norm TEXT,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  applications JSONB NOT NULL DEFAULT '[]'::jsonb,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_count INTEGER NOT NULL DEFAULT 25,
  stock INTEGER NOT NULL DEFAULT 25,
  featured BOOLEAN NOT NULL DEFAULT false,
  available_sizes JSONB DEFAULT '[]'::jsonb,
  available_colors JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);

-- 2. TABELA DE PEDIDOS (public.orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company_name TEXT,
  delivery_location TEXT NOT NULL,
  city_province TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'awaiting_payment',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

-- =============================================================================
-- 3. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PRODUTOS:
-- Visitantes públicos podem LER o catálogo de produtos livremente:
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  USING (true);

-- Apenas o backend protegido com service_role ou administradores autenticados podem alterar/inserir/excluir:
DROP POLICY IF EXISTS "Service role can modify products" ON public.products;
CREATE POLICY "Service role can modify products"
  ON public.products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- POLÍTICAS PARA PEDIDOS:
-- Clientes da loja podem INSERIR pedidos ao finalizar compra:
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
CREATE POLICY "Public can submit orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Apenas o backend / admin pode visualizar e atualizar os pedidos:
DROP POLICY IF EXISTS "Service role can view and manage orders" ON public.orders;
CREATE POLICY "Service role can view and manage orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- 4. BUCKET DE STORAGE (product-images)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Permitir que qualquer pessoa visualize as imagens dos produtos (Público):
DROP POLICY IF EXISTS "Public images access" ON storage.objects;
CREATE POLICY "Public images access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Permitir que o backend com service_role envie e remova imagens:
DROP POLICY IF EXISTS "Service role manages images" ON storage.objects;
CREATE POLICY "Service role manages images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');
