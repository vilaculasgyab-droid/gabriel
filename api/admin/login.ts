export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  return res.status(410).json({
    success: false,
    error: 'Endpoint descontinuado. A autenticação é realizada exclusivamente via Supabase Auth (supabase.auth.signInWithPassword).',
  });
}
