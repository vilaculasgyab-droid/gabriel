import { handleAdminLoginCore } from '../_adminAuthCore';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const { email, password } = req.body || {};
    const result = await handleAdminLoginCore(email, password);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (err: any) {
    console.error('[API /api/admin/login] Erro interno:', err);
    return res.status(500).json({ success: false, error: 'Erro interno ao autenticar.' });
  }
}
