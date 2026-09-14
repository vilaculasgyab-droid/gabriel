import { AdminUser, AdminSession } from '../types';
import { isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';

const ADMIN_SESSION_KEY = 'fortimoz_admin_session_v2';
const LEGACY_SESSION_KEY = 'proseguranca_admin_session_v1';
const LEGACY_CREDENTIALS_KEY = 'proseguranca_admin_credentials_v1';

const DEFAULT_EMAIL = 'admin@fortimoz.co.mz';

// Purge any legacy plaintext/hash keys from localStorage on startup
try {
  localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
  localStorage.removeItem('fortimoz_admin_credentials_v1');
} catch {
  // ignore
}

export const authService = {
  getDefaultCredentialsHint() {
    return {
      email: DEFAULT_EMAIL,
      passwordHint: 'FortiMoz@2026',
    };
  },

  /**
   * Realiza login através da API segura (/api/admin/login) conectada ao Supabase Auth,
   * com fallback transparente para o cliente Supabase oficial caso o endpoint da API
   * esteja inacessível no ambiente (ex: Vercel sem serverless ou proxy restrito).
   */
  async login(emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanEmail = (emailInput || '').trim();
    const cleanPassword = (passwordInput || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Por favor, introduza o e-mail e a palavra-passe.' };
    }

    let apiConnectionFailed = false;

    // 1. Tentar primeiro o endpoint seguro de API (/api/admin/login)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      // Leitura resiliente: evita quebrar se a resposta não for JSON
      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      // Se a API respondeu com sucesso
      if (res.ok && data?.success && data?.user) {
        const user: AdminUser = {
          id: data.user.id,
          name: data.user.name || 'Administrador FortiMoz',
          email: data.user.email || cleanEmail,
          role: data.user.role || 'superadmin',
          avatar: data.user.avatar || '/proseguranca-logo.png',
        };

        const session: AdminSession = {
          token: data.token || 'adm_tok_' + Math.random().toString(36).slice(2),
          user,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
        };

        try {
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        } catch (e) {
          console.error('Failed to persist admin session', e);
        }

        return { success: true, user };
      }

      // Se a API respondeu explicitamente que as credenciais são inválidas (HTTP 401 ou erro estruturado)
      if (data && data.error && res.status !== 404 && res.status < 500) {
        return {
          success: false,
          error: data.error,
        };
      }

      // Se a rota não foi encontrada (404) ou retornou 500/HTML na Vercel/proxy
      apiConnectionFailed = true;
    } catch (netErr) {
      console.warn('[authService] Falha de rede ao contactar /api/admin/login:', netErr);
      apiConnectionFailed = true;
    }

    // 2. Se a chamada à API falhou (por exemplo se a rota não existe no ambiente estático ou falha de rede/CORS),
    // recorrer diretamente ao Supabase Auth através do cliente oficial do frontend (utilizando apenas a chave anónima pública)
    if (apiConnectionFailed && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const authEmail = cleanEmail.toLowerCase() === 'admin@proseguranca.co.mz' ? DEFAULT_EMAIL : cleanEmail;
          const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: cleanPassword,
          });

          if (!error && data?.user) {
            const user: AdminUser = {
              id: data.user.id,
              name: (data.user.user_metadata as any)?.name || 'Administrador FortiMoz',
              email: data.user.email || cleanEmail,
              role: ((data.user.user_metadata as any)?.role as any) || 'superadmin',
              avatar: '/proseguranca-logo.png',
            };

            const session: AdminSession = {
              token: data.session?.access_token || 'adm_tok_' + Math.random().toString(36).slice(2),
              user,
              expiresAt: Date.now() + 8 * 60 * 60 * 1000,
            };

            try {
              localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
            } catch (e) {
              console.error('Failed to persist admin session', e);
            }

            return { success: true, user };
          } else if (error) {
            return {
              success: false,
              error: 'Credenciais de administrador inválidas. Verifique o e-mail e a palavra-passe.',
            };
          }
        }
      } catch (clientErr) {
        console.error('[authService] Erro ao autenticar via cliente Supabase:', clientErr);
      }
    }

    return {
      success: false,
      error: 'Erro de comunicação com o servidor de autenticação. Verifique a sua ligação ou credenciais.',
    };
  },

  getSession(): AdminSession | null {
    try {
      let raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) {
        // Check legacy session
        raw = localStorage.getItem(LEGACY_SESSION_KEY);
      }
      if (!raw) return null;
      const session: AdminSession = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  getAdminUser(): AdminUser | null {
    const session = this.getSession();
    return session ? session.user : null;
  },

  logout(): void {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
  },

  /**
   * Altera a senha através da API segura (/api/admin/change-password) conectada ao Supabase Auth.
   * Valida estritamente a senha atual com o Supabase antes de aplicar a nova senha.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const session = this.getSession();
    const adminEmail = session?.user?.email || DEFAULT_EMAIL;

    if (!currentPassword) {
      return { success: false, error: 'A senha atual não está correta.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    let apiConnectionFailed = false;

    // 1. Tentar via API segura
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          email: adminEmail,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (res.ok && data?.success) {
        return { success: true };
      }

      if (data && data.error && res.status !== 404 && res.status < 500) {
        return {
          success: false,
          error: data.error,
        };
      }

      apiConnectionFailed = true;
    } catch (err: any) {
      console.warn('[authService] Falha ao contactar /api/admin/change-password:', err);
      apiConnectionFailed = true;
    }

    // 2. Fallback via cliente Supabase se a API estiver inacessível
    if (apiConnectionFailed && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          // Validação estrita da senha atual
          const authEmail = adminEmail.toLowerCase() === 'admin@proseguranca.co.mz' ? DEFAULT_EMAIL : adminEmail;
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: currentPassword,
          });

          if (signInErr) {
            return { success: false, error: 'A senha atual não está correta.' };
          }

          const { error: updateErr } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (updateErr) {
            return { success: false, error: `Erro ao alterar senha: ${updateErr.message}` };
          }

          return { success: true };
        }
      } catch (supaErr) {
        console.error('[authService] Erro ao alterar senha via Supabase:', supaErr);
      }
    }

    return {
      success: false,
      error: 'Erro de comunicação com o servidor ao alterar senha.',
    };
  },

  /**
   * Atualiza o perfil administrativo via API e na sessão local
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
          'Cache-Control': 'no-cache, no-store',
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
        }),
      });

      const session = this.getSession();
      if (session) {
        session.user.name = cleanName;
        session.user.email = cleanEmail;
        try {
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        } catch {
          // ignore
        }
      }

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Falha ao atualizar perfil.' };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[authService] Erro ao atualizar perfil:', err);
      // Even if offline, update local session
      const session = this.getSession();
      if (session) {
        session.user.name = cleanName;
        session.user.email = cleanEmail;
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      }
      return { success: true };
    }
  },
};

