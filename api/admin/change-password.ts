import {
  handleAdminChangePasswordCore,
  setCorsAndNoCacheHeaders,
} from '../_adminAuthCore';

export default async function handler(req: any, res: any) {
  setCorsAndNoCacheHeaders(req, res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string' && body.trim()) {
      try {
        body = JSON.parse(body);
      } catch {
        // use raw body
      }
    } else if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf-8'));
      } catch {
        // use raw body
      }
    }

    const { currentPassword, newPassword, email } = body || {};
    const result = await handleAdminChangePasswordCore(currentPassword, newPassword, email);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (err: any) {
    console.error('[API /api/admin/change-password] Erro interno:', err);
    return res.status(500).json({ success: false, error: 'Erro interno ao alterar palavra-passe.' });
  }
}
