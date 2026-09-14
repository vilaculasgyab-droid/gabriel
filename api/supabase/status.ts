import { createClient } from '@supabase/supabase-js';

function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }

  const url = cleanEnv(process.env.SUPABASE_URL);
  const serviceRole = cleanEnv(process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY);

  const configured = Boolean(url && serviceRole);
  if (!configured) {
    return res.status(200).json({
      configured: false,
      connected: false,
      productCount: 0,
      orderCount: 0,
      error: 'Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE não configuradas.',
    });
  }

  try {
    const supabase = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { count: productCount, error: prodErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (prodErr) {
      return res.status(200).json({
        configured: true,
        connected: false,
        productCount: 0,
        orderCount: 0,
        error: prodErr.message,
      });
    }

    return res.status(200).json({
      configured: true,
      connected: true,
      productCount: productCount || 0,
      orderCount: orderCount || 0,
    });
  } catch (err: any) {
    return res.status(200).json({
      configured: true,
      connected: false,
      productCount: 0,
      orderCount: 0,
      error: err?.message || 'Falha ao conectar com o Supabase.',
    });
  }
}
