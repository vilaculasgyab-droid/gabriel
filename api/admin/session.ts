import {
  verifyAdminSessionFromRequest,
  setCorsAndNoCacheHeaders,
} from '../_adminAuthCore';

export default async function handler(req: any, res: any) {
  setCorsAndNoCacheHeaders(req, res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const sessionResult = verifyAdminSessionFromRequest(req);

    if (sessionResult.authenticated && sessionResult.user) {
      return res.status(200).json({
        authenticated: true,
        user: {
          id: sessionResult.user.id,
          name: sessionResult.user.name,
          email: sessionResult.user.email,
          role: sessionResult.user.role,
          avatar: '/proseguranca-logo.png',
        },
      });
    }

    return res.status(200).json({
      authenticated: false,
      user: null,
    });
  } catch (err: any) {
    console.error('[API /api/admin/session] Erro interno:', err);
    return res.status(500).json({ authenticated: false, user: null, error: 'Erro ao verificar sessão.' });
  }
}
