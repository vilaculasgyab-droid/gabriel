export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL && 
    (process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  return res.status(200).json({
    status: 'ok',
    store: 'Z FORÇA E PROTEÇÃO Moçambique',
    supabaseConfigured,
    timestamp: new Date().toISOString(),
  });
}
