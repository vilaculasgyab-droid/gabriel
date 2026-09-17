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

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'CONNECTION_ERROR'
  | 'CONFIG_MISSING'
  | 'UNEXPECTED_ERROR';

export interface LoginResult {
  success: boolean;
  error?: string;
  errorCode?: AuthErrorCode;
  user?: AdminUser;
}

/**
 * Converte um User do Supabase em AdminUser tipado da aplicação
 */
function mapSupabaseUserToAdmin(user: any): AdminUser {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    name: metadata.name || metadata.full_name || user.email?.split('@')[0] || 'Administrador FortiMoz',
    email: user.email || DEFAULT_EMAIL,
    role: (metadata.role as any) || 'superadmin',
    avatar: metadata.avatar_url || '/proseguranca-logo.png',
  };
}

export const authService = {
  getDefaultAdminEmail() {
    return DEFAULT_EMAIL;
  },

  /**
   * Realiza login DIRETO no Supabase Auth usando o cliente oficial com a chave anónima pública:
   * supabase.auth.signInWithPassword({ email, password })
   *
   * Trata detalhadamente os erros para exibir mensagens precisas:
   * - Credenciais inválidas (400 / invalid_credentials)
   * - Utilizador não confirmado (email_not_confirmed)
   * - Falha de conexão / rede
   * - Configuração ausente do Supabase
   */
  async login(emailInput: string, passwordInput: string): Promise<LoginResult> {
    const cleanEmail = (emailInput || '').trim();
    const cleanPassword = (passwordInput || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        success: false,
        error: 'Por favor, introduza o seu e-mail e a palavra-passe.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Configuração do Supabase ausente ou incompleta. Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no ambiente da Vercel.',
        errorCode: 'CONFIG_MISSING',
      };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: 'Não foi possível inicializar o cliente do Supabase. Verifique a configuração do projeto.',
        errorCode: 'CONFIG_MISSING',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        const errorMsg = (error.message || '').toLowerCase();
        const errorCode = (error as any).code || '';

        // 1. E-mail ou palavra-passe incorretos
        if (
          error.status === 400 ||
          errorCode === 'invalid_credentials' ||
          errorMsg.includes('invalid login credentials') ||
          errorMsg.includes('invalid credentials') ||
          errorMsg.includes('invalid password') ||
          errorMsg.includes('user not found')
        ) {
          return {
            success: false,
            error: 'E-mail ou palavra-passe incorretos. Por favor, verifique as suas credenciais.',
            errorCode: 'INVALID_CREDENTIALS',
          };
        }

        // 2. E-mail não confirmado
        if (
          errorCode === 'email_not_confirmed' ||
          errorMsg.includes('email not confirmed') ||
          errorMsg.includes('not verified')
        ) {
          return {
            success: false,
            error: 'Utilizador não confirmado. Por favor, confirme o e-mail no Supabase Auth ou desative a confirmação obrigatória de e-mail no painel.',
            errorCode: 'EMAIL_NOT_CONFIRMED',
          };
        }

        // 3. Erro de rede/conexão com o Supabase
        if (
          errorMsg.includes('fetch') ||
          errorMsg.includes('network') ||
          errorMsg.includes('connection') ||
          errorMsg.includes('failed to fetch')
        ) {
          return {
            success: false,
            error: 'Erro de conexão com o Supabase. Verifique a sua ligação à internet ou o status do projeto Supabase.',
            errorCode: 'CONNECTION_ERROR',
          };
        }

        // 4. Outro erro inesperado retornado pelo Supabase
        return {
          success: false,
          error: error.message || 'Erro inesperado na autenticação.',
          errorCode: 'UNEXPECTED_ERROR',
        };
      }

      if (!data?.user) {
        return {
          success: false,
          error: 'Utilizador não encontrado na resposta do servidor.',
          errorCode: 'UNEXPECTED_ERROR',
        };
      }

      // Sessão bem-sucedida
      const adminUser = mapSupabaseUserToAdmin(data.user);
      const token = data.session?.access_token || 'sb_tok_' + Math.random().toString(36).slice(2);
      const expiresAt = data.session?.expires_at
        ? data.session.expires_at * 1000
        : Date.now() + 8 * 60 * 60 * 1000;

      const session: AdminSession = {
        token,
        user: adminUser,
        expiresAt,
      };

      try {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      } catch (storageErr) {
        console.warn('Não foi possível persistir sessão local:', storageErr);
      }

      return {
        success: true,
        user: adminUser,
      };
    } catch (err: any) {
      console.error('[authService] Exceção durante signInWithPassword:', err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
        return {
          success: false,
          error: 'Erro de conexão com o Supabase. Verifique a sua ligação à internet ou o status do projeto Supabase.',
          errorCode: 'CONNECTION_ERROR',
        };
      }
      return {
        success: false,
        error: err?.message || 'Erro inesperado ao contactar o servidor de autenticação.',
        errorCode: 'UNEXPECTED_ERROR',
      };
    }
  },

  /**
   * Sincroniza e verifica a sessão atual diretamente com supabase.auth.getSession()
   */
  async syncSessionWithSupabase(): Promise<AdminUser | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.getAdminUser();
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        // Se o Supabase explicitamente diz que não há sessão ativa, limpar local
        if (data && !data.session) {
          this.logout();
          return null;
        }
        return this.getAdminUser();
      }

      const user = mapSupabaseUserToAdmin(data.session.user);
      const session: AdminSession = {
        token: data.session.access_token,
        user,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 8 * 60 * 60 * 1000,
      };

      try {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      } catch {}

      return user;
    } catch (err) {
      console.warn('[authService] Erro ao sincronizar sessão com Supabase:', err);
      return this.getAdminUser();
    }
  },

  /**
   * Subscreve alterações no estado de autenticação via supabase.auth.onAuthStateChange
   */
  subscribeAuthState(callback: (user: AdminUser | null) => void): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = mapSupabaseUserToAdmin(session.user);
        const adminSession: AdminSession = {
          token: session.access_token,
          user,
          expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 8 * 60 * 60 * 1000,
        };
        try {
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
        } catch {}
        callback(user);
      } else {
        this.logout();
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  getSession(): AdminSession | null {
    try {
      let raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) {
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

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Erro ao deslogar do Supabase:', err);
      }
    }
  },

  /**
   * Altera a senha diretamente com o Supabase Auth.
   * Valida a senha atual efetuando re-autenticação segura e em seguida chama supabase.auth.updateUser({ password })
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const session = this.getSession();
    const adminEmail = session?.user?.email || DEFAULT_EMAIL;

    if (!currentPassword) {
      return { success: false, error: 'A palavra-passe atual é obrigatória.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Cliente do Supabase não configurado.' };
    }

    try {
      // 1. Validar a senha atual autenticando com ela
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: currentPassword,
      });

      if (verifyErr) {
        return { success: false, error: 'A palavra-passe atual não está correta.' };
      }

      // 2. Atualizar a senha
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        return { success: false, error: `Erro ao atualizar palavra-passe: ${updateErr.message}` };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[authService] Erro ao alterar senha via Supabase:', err);
      return { success: false, error: err?.message || 'Erro ao comunicar com o Supabase ao alterar palavra-passe.' };
    }
  },

  /**
   * Atualiza os metadados do utilizador autenticado (nome) no Supabase Auth
   */
  async updateProfile(name: string, email: string): Promise<{ success: boolean; error?: string }> {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return { success: false, error: 'Nome e e-mail são obrigatórios.' };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: { name: cleanName },
        });
      } catch (err) {
        console.warn('[authService] Aviso ao atualizar user_metadata no Supabase:', err);
      }
    }

    const session = this.getSession();
    if (session) {
      session.user.name = cleanName;
      session.user.email = cleanEmail;
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      } catch {}
    }

    return { success: true };
  },
};
