import { AdminUser, AdminSession } from '../types';

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
   * Realiza login através da API segura (/api/admin/login) conectada ao Supabase Auth
   */
  async login(emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanEmail = (emailInput || '').trim();
    const cleanPassword = (passwordInput || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Por favor, introduza o e-mail e a palavra-passe.' };
    }

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

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        return {
          success: false,
          error: data.error || 'Credenciais de administrador inválidas. Verifique os dados.',
        };
      }

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
    } catch (err: any) {
      console.error('[authService] Erro de rede ao autenticar:', err);
      return {
        success: false,
        error: 'Erro de comunicação com o servidor de autenticação.',
      };
    }
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

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'A senha atual não está correta.',
        };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[authService] Erro ao comunicar alteração de senha:', err);
      return {
        success: false,
        error: 'Erro de comunicação com o servidor ao alterar senha.',
      };
    }
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

      const data = await res.json();

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

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Falha ao atualizar perfil.' };
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

