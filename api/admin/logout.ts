import {
  buildClearCookieHeader,
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
    const clearCookie = buildClearCookieHeader(req);
    res.setHeader('Set-Cookie', clearCookie);

    return res.status(200).json({
      success: true,
      message: 'Sessão administrativa terminada com sucesso.',
    });
  } catch (err: any) {
    console.error('[API /api/admin/logout] Erro interno:', err);
    return res.status(500).json({ success: false, error: 'Erro ao terminar sessão.' });
  }
}
