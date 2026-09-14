import { handleAdminUpdateProfileCore } from '../_adminAuthCore';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const { name, email } = req.body || {};
    const result = await handleAdminUpdateProfileCore(name, email);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (err: any) {
    console.error('[API /api/admin/profile] Erro interno:', err);
    return res.status(500).json({ success: false, error: 'Erro ao atualizar perfil.' });
  }
}
