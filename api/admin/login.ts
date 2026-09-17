import {
  handleAdminLoginCore,
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

    const { email, password } = body || {};
    const result = await handleAdminLoginCore(email, password, req);

    if (result.success && result.cookieHeader) {
      res.setHeader('Set-Cookie', result.cookieHeader);
      return res.status(200).json({
        success: true,
        user: result.user,
      });
    } else {
      const isRateLimited = result.error?.includes('Demasiadas') || result.error?.includes('bloqueado');
      const statusCode = isRateLimited ? 429 : 401;
      return res.status(statusCode).json({
        success: false,
        error: result.error || 'Credenciais inválidas.',
      });
    }
  } catch (err: any) {
    console.error('[API /api/admin/login] Erro interno:', err);
    return res.status(500).json({ success: false, error: 'Erro interno ao autenticar.' });
  }
}
