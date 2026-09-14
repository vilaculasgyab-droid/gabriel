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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse body safely
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
  }

  const url = cleanEnv(process.env.SUPABASE_URL);
  const serviceRole = cleanEnv(process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRole) {
    return res.status(500).json({
      success: false,
      error: 'Variáveis do Supabase não configuradas no servidor.',
    });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[API Orders] Erro ao consultar encomendas:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        source: 'supabase',
        count: data?.length || 0,
        orders: data || [],
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Falha ao buscar encomendas.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const orderData = req.body;
      if (!orderData || !orderData.customerName || !orderData.phone || !orderData.items) {
        return res.status(400).json({ success: false, error: 'Dados da encomenda incompletos.' });
      }

      const orderToInsert = {
        id: orderData.id || `ord_${Date.now()}`,
        customer_name: orderData.customerName,
        customer_email: orderData.email || '',
        customer_phone: orderData.phone,
        company_name: orderData.companyName || '',
        delivery_address: orderData.address || '',
        city: orderData.city || 'Maputo',
        payment_method: orderData.paymentMethod || 'mpesa',
        notes: orderData.notes || '',
        items: orderData.items,
        total_amount: Number(orderData.total || 0),
        status: orderData.status || 'pending',
        payment_status: orderData.paymentStatus || 'pending',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderToInsert)
        .select()
        .single();

      if (error) {
        console.error('[API Orders] Erro ao criar encomenda no Supabase:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(201).json({ success: true, order: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Falha ao registar encomenda.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Método ${req.method} não permitido.` });
}
