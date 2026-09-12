-- =============================================================================
-- FORTIMOZ - SCRIPT DEFINITIVO DE PERMISSÕES E RLS (TABELAS PRODUCTS E ORDERS)
-- =============================================================================
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ixubqdyqjxqpmnbwfhhi/sql/new
--
-- REQUISITOS ATENDIDOS:
-- 1. A loja pública (anon) tem permissão EXCLUSIVAMENTE para SELECT dos produtos.
-- 2. Não concede INSERT, UPDATE ou DELETE público (anon) na tabela products.
-- 3. RLS ATIVO em public.products e public.orders (RLS NUNCA desativado).
-- 4. O papel protegido service_role (backend seguro) tem acesso completo para gestão admin.
-- 5. Clientes da loja pública podem INSERIR pedidos (INSERT em orders) ao finalizar compra.
-- =============================================================================

-- 1. GRANT USAGE no schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. PRIVILÉGIOS DE TABELA NO POSTGRESQL:
-- anon (loja pública / visitantes não autenticados):
-- APENAS SELECT em products (leitura do catálogo) e INSERT em orders (envio de pedido)
GRANT SELECT ON TABLE public.products TO anon;
GRANT INSERT ON TABLE public.orders TO anon;

-- authenticated (usuários autenticados, se houver):
GRANT SELECT ON TABLE public.products TO authenticated;
GRANT INSERT, SELECT ON TABLE public.orders TO authenticated;

-- service_role (backend administrativo seguro):
-- Controle total para operações administrativas pelo servidor
GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.orders TO service_role;

-- Sequências (para IDs seriais caso utilizados):
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Privilégios padrão para futuras tabelas/sequências:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) - PUBLIC.PRODUCTS
-- -----------------------------------------------------------------------------
-- Garantir que RLS está HABILITADO
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar duplicidade ou conflito
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
DROP POLICY IF EXISTS "Allow public read-only access on products" ON public.products;
DROP POLICY IF EXISTS "Service role full access on products" ON public.products;
DROP POLICY IF EXISTS "Service role can modify products" ON public.products;

-- Política 1: Leitura pública do catálogo de produtos (SELECT livre para todos)
CREATE POLICY "Public read access for products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Política 2: Operações administrativas completas restritas estritamente ao service_role
CREATE POLICY "Service role full access on products"
  ON public.products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) - PUBLIC.ORDERS
-- -----------------------------------------------------------------------------
-- Garantir que RLS está HABILITADO
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas de pedidos
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert access for orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can view and manage orders" ON public.orders;

-- Política 1: Clientes públicos podem submeter encomendas na finalização de compra
CREATE POLICY "Public insert access for orders"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política 2: Apenas o backend / service_role pode consultar e gerir encomendas
CREATE POLICY "Service role full access on orders"
  ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- VERIFICAÇÃO RÁPIDA:
-- Para testar após executar, execute:
-- SELECT count(*) FROM public.products;
-- =============================================================================
