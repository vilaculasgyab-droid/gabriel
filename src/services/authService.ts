import { AdminUser, AdminSession } from '../types';

export const ADMIN_USER_CACHE_KEY = 'fortimoz_admin_user_v3';
export const ADMIN_TOKEN_CACHE_KEY = 'fortimoz_admin_token_v3';

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'CONNECTION_ERROR'
  | 'SERVER_ERROR'
  | 'UNEXPECTED_ERROR';

export interface LoginResult {
  success: boolean;
  error?: string;
  errorCode?: AuthErrorCode;
  user?: AdminUser;
}

type AuthSubscriber = (user: AdminUser | null) => void;
const subscribers = new Set<AuthSubscriber>();

function notifySubscribers(user: AdminUser | null) {
  subscribers.forEach((sub) => {
    try {
      sub(user);
    } catch (e) {
      console.error('[authService] Error notifying subscriber:', e);
    }
  });
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ADMIN_TOKEN_CACHE_KEY);
  } catch {
    return null;
  }
}

function persistToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_CACHE_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_CACHE_KEY);
    }
  } catch {
    // ignore
  }
}

// Memory-cached user
let currentUser: AdminUser | null = null;

function loadCachedUser(): AdminUser | null {
  if (currentUser) return currentUser;
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_USER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        currentUser = parsed;
        return currentUser;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function persistUser(user: AdminUser | null) {
  currentUser = user;
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(ADMIN_USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ADMIN_USER_CACHE_KEY);
      // Clean up legacy keys
      localStorage.removeItem('fortimoz_admin_session');
      localStorage.removeItem('fortimoz_admin_session_v2');
    }
  } catch {
    // ignore
  }
  notifySubscribers(user);
}

export const authService = {
  /**
   * Realiza login autenticando diretamente com a API segura da FortiMoz na Vercel:
   * POST /api/admin/login
   * A sessão é persistida num cookie HttpOnly, Secure e SameSite emitido pelo servidor.
   */
  async login(emailInput: string, passwordInput: string): Promise<LoginResult> {
    const email = (emailInput || '').trim();
    const password = String(passwordInput || '');

    if (!email || !password) {
      return {
        success: false,
        error: 'Por favor, preencha o e-mail e a palavra-passe.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Envia e recebe cookies HttpOnly de sessão
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // non-json response
      }

      if (res.status === 429) {
        return {
          success: false,
          error: data.error || 'Demasiadas tentativas falhadas. Por motivos de segurança, tente novamente dentro de 15 minutos.',
          errorCode: 'RATE_LIMITED',
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: data.error || 'Credenciais inválidas.',
          errorCode: 'INVALID_CREDENTIALS',
        };
      }

      if (res.status >= 500) {
        console.error(`[authService] Erro no endpoint /api/admin/login (HTTP ${res.status}):`, data);
        return {
          success: false,
          error: data.error || 'Erro no servidor de autenticação. O administrador deve verificar a configuração do servidor.',
          errorCode: 'SERVER_ERROR',
        };
      }

      if (!res.ok || !data.success) {
        console.error(`[authService] Resposta inesperada no endpoint /api/admin/login (HTTP ${res.status}):`, data);
        return {
          success: false,
          error: data.error || 'Erro inesperado durante a autenticação.',
          errorCode: 'UNEXPECTED_ERROR',
        };
      }

      const adminUser: AdminUser = {
        id: data.user?.id || 'fortimoz-admin-01',
        name: data.user?.name || 'Administrador FortiMoz',
        email: data.user?.email || email.toLowerCase(),
        role: data.user?.role || 'superadmin',
        avatar: data.user?.avatar || '/proseguranca-logo.png',
      };

      if (data.token) {
        persistToken(data.token);
      }
      persistUser(adminUser);

      return {
        success: true,
        user: adminUser,
      };
    } catch (err: any) {
      console.error('[authService] Falha de rede ao autenticar:', err);
      return {
        success: false,
        error: 'Não foi possível contactar o servidor. Verifique a sua ligação de rede.',
        errorCode: 'CONNECTION_ERROR',
      };
    }
  },

  /**
   * Verifica no backend se existe uma sessão administrativa válida:
   * GET /api/admin/session
   */
  async checkSession(): Promise<AdminUser | null> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      const token = getStoredToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/session', {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (res.status === 401) {
        // Expirado ou revogado explicitamente pelo servidor
        persistUser(null);
        persistToken(null);
        return null;
      }

      if (!res.ok) {
        // Se houver erro de servidor 5xx ou rede transitória, preserva o utilizador em cache para evitar tela branca
        return loadCachedUser();
      }

      const data = await res.json();
      if (data.authenticated && data.user) {
        const user: AdminUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar || '/proseguranca-logo.png',
        };
        persistUser(user);
        return user;
      } else {
        persistUser(null);
        persistToken(null);
        return null;
      }
    } catch (err) {
      console.warn('[authService] Aviso ao verificar sessão com o servidor:', err);
      // Em falha de rede/offline, mantém utilizador em cache para não deslogar abruptamente
      return loadCachedUser();
    }
  },

  /**
   * Alias de conveniência para sincronizar a sessão no carregamento da página
   */
  async syncSession(): Promise<AdminUser | null> {
    return this.checkSession();
  },

  /**
   * Mantém compatibilidade com código existente
   */
  async syncSessionWithSupabase(): Promise<AdminUser | null> {
    return this.checkSession();
  },

  /**
   * Permite componentes subscreverem alterações no estado da sessão
   */
  subscribeAuthState(callback: (user: AdminUser | null) => void): () => void {
    subscribers.add(callback);
    // Dispara imediatamente com o estado atual
    callback(loadCachedUser());

    // Também escuta eventos de storage entre abas
    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_USER_CACHE_KEY) {
        currentUser = null;
        callback(loadCachedUser());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }

    return () => {
      subscribers.delete(callback);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  },

  /**
   * Retorna se o utilizador está atualmente autenticado
   */
  isAuthenticated(): boolean {
    return !!loadCachedUser();
  },

  /**
   * Retorna os dados do utilizador administrador atual
   */
  getAdminUser(): AdminUser | null {
    return loadCachedUser();
  },

  /**
   * Obtém a sessão atual
   */
  getSession(): AdminSession | null {
    const user = loadCachedUser();
    if (!user) return null;
    return {
      token: 'cookie-managed-session',
      user,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    };
  },

  /**
   * Termina a sessão do administrador:
   * POST /api/admin/logout
   */
  async logout(): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      const token = getStoredToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (err) {
      console.warn('[authService] Aviso ao terminar sessão no servidor:', err);
    } finally {
      persistUser(null);
      persistToken(null);
    }
  },

  /**
   * Altera a palavra-passe do administrador através da API backend:
   * POST /api/admin/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!currentPassword) {
      return { success: false, error: 'A palavra-passe atual é obrigatória.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    try {
      const user = loadCachedUser();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      const token = getStoredToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
          email: user?.email,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Erro ao alterar a palavra-passe.',
        };
      }

      return {
        success: true,
        message: data.message || 'Palavra-passe alterada com sucesso!',
      };
    } catch (err: any) {
      console.error('[authService] Erro ao comunicar com o servidor para alterar palavra-passe:', err);
      return {
        success: false,
        error: 'Erro de comunicação ao atualizar a palavra-passe.',
      };
    }
  },

  /**
   * Atualiza o perfil do administrador:
   * POST /api/admin/profile
   */
  async updateProfile(name: string, email: string): Promise<{ success: boolean; error?: string }> {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return { success: false, error: 'Nome e e-mail são obrigatórios.' };
    }

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name: cleanName, email: cleanEmail }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Erro ao atualizar perfil.',
        };
      }

      const updatedUser: AdminUser = {
        id: data.user?.id || 'fortimoz-admin-01',
        name: cleanName,
        email: cleanEmail,
        role: data.user?.role || 'superadmin',
        avatar: '/proseguranca-logo.png',
      };
      persistUser(updatedUser);

      return { success: true };
    } catch (err: any) {
      console.error('[authService] Erro ao atualizar perfil:', err);
      return {
        success: false,
        error: 'Erro ao comunicar com o servidor ao atualizar perfil.',
      };
    }
  },
};
