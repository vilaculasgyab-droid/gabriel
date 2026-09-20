import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { AdminUser, AdminSession } from '../types';

export const ADMIN_EMAIL = 'vialnculofelix845@gmail.com';

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'CONFIG_ERROR'
  | 'CONNECTION_ERROR'
  | 'SERVER_ERROR'
  | 'UNEXPECTED_ERROR';

export interface LoginResult {
  success: boolean;
  error?: string;
  errorCode?: AuthErrorCode;
  user?: AdminUser;
}

// Memory-cached user to prevent render flickers while onAuthStateChange resolves
let cachedAdminUser: AdminUser | null = null;

function mapSupabaseUserToAdmin(user: any): AdminUser {
  return {
    id: user.id || 'fortimoz-admin-01',
    name: user.user_metadata?.name || user.user_metadata?.full_name || 'Administrador FortiMoz',
    email: user.email || ADMIN_EMAIL,
    role: 'superadmin',
    avatar: '/proseguranca-logo.png',
  };
}

export const authService = {
  /**
   * Realiza login autenticando EXCLUSIVAMENTE via Supabase Auth (supabase.auth.signInWithPassword).
   * Não chama nenhuma API própria de login e não armazena palavra-passe em código nem localStorage.
   */
  async login(emailInput: string, passwordInput: string): Promise<LoginResult> {
    const email = (emailInput || '').trim().toLowerCase();
    const password = String(passwordInput || '');

    // 1. Validar configuração do Supabase
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Configuração de autenticação incompleta.',
        errorCode: 'CONFIG_ERROR',
      };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: 'Configuração de autenticação incompleta.',
        errorCode: 'CONFIG_ERROR',
      };
    }

    // 2. Validar preenchimento
    if (!email || !password) {
      return {
        success: false,
        error: 'Credenciais inválidas.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }

    // 3. Garantir que apenas o e-mail administrativo configurado pode autenticar
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: 'Credenciais inválidas.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }

    try {
      // 4. Autenticação direta com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Tratar erro de credenciais incorretas (status 400 ou invalid_credentials)
        if (
          error.status === 400 ||
          (error as any).code === 'invalid_credentials' ||
          error.message?.toLowerCase().includes('invalid') ||
          error.message?.toLowerCase().includes('credentials')
        ) {
          return {
            success: false,
            error: 'Credenciais inválidas.',
            errorCode: 'INVALID_CREDENTIALS',
          };
        }

        // Falhas de rede ou conexão
        if (
          error.message?.toLowerCase().includes('network') ||
          error.message?.toLowerCase().includes('fetch') ||
          error.status === 0
        ) {
          return {
            success: false,
            error: 'Não foi possível contactar o serviço de autenticação.',
            errorCode: 'CONNECTION_ERROR',
          };
        }

        return {
          success: false,
          error: 'Credenciais inválidas.',
          errorCode: 'INVALID_CREDENTIALS',
        };
      }

      // 5. Verificar a sessão ativa no Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (sessionError || !session || !session.user) {
        return {
          success: false,
          error: 'Não foi possível estabelecer a sessão.',
          errorCode: 'UNEXPECTED_ERROR',
        };
      }

      const adminUser = mapSupabaseUserToAdmin(session.user);
      cachedAdminUser = adminUser;

      return {
        success: true,
        user: adminUser,
      };
    } catch (err: any) {
      console.error('[authService] Erro ao autenticar no Supabase Auth:', err);
      return {
        success: false,
        error: 'Credenciais inválidas.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }
  },

  /**
   * Verifica se existe uma sessão válida no Supabase Auth:
   * const { data: { session } } = await supabase.auth.getSession();
   */
  async checkSession(): Promise<AdminUser | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      cachedAdminUser = null;
      return null;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session || !session.user) {
        cachedAdminUser = null;
        return null;
      }

      // Validar se o e-mail da sessão pertence ao administrador
      if (session.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await supabase.auth.signOut();
        cachedAdminUser = null;
        return null;
      }

      const adminUser = mapSupabaseUserToAdmin(session.user);
      cachedAdminUser = adminUser;
      return adminUser;
    } catch (err) {
      console.warn('[authService] Erro ao verificar sessão no Supabase:', err);
      return cachedAdminUser;
    }
  },

  /**
   * Retorna os dados do utilizador administrador em cache
   */
  getAdminUser(): AdminUser | null {
    return cachedAdminUser;
  },

  /**
   * Retorna se existe um utilizador autenticado
   */
  isAuthenticated(): boolean {
    return !!cachedAdminUser;
  },

  /**
   * Obtém a sessão do administrador
   */
  getSession(): AdminSession | null {
    if (!cachedAdminUser) return null;
    return {
      token: 'supabase-session',
      user: cachedAdminUser,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    };
  },

  /**
   * Subscreve às alterações de estado da autenticação com onAuthStateChange
   */
  subscribeAuthState(callback: (user: AdminUser | null) => void): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) {
      callback(null);
      return () => {};
    }

    // Dispara imediatamente verificação inicial
    this.checkSession().then((user) => {
      callback(user);
    }).catch(() => {
      callback(null);
    });

    // Acompanha a sessão através do listener oficial do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user && session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        const user = mapSupabaseUserToAdmin(session.user);
        cachedAdminUser = user;
        callback(user);
      } else {
        cachedAdminUser = null;
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Termina a sessão do administrador através de supabase.auth.signOut()
   */
  async logout(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[authService] Erro ao fazer logout no Supabase Auth:', err);
      }
    }
    cachedAdminUser = null;
  },

  /**
   * Altera a palavra-passe do utilizador autenticado via Supabase Auth
   */
  async changePassword(_currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Configuração de autenticação incompleta.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message || 'Erro ao atualizar palavra-passe no Supabase Auth.' };
      }

      return {
        success: true,
        message: 'Palavra-passe alterada com sucesso no Supabase Auth!',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Erro ao atualizar palavra-passe.',
      };
    }
  },

  /**
   * Atualiza o perfil do administrador no Supabase Auth
   */
  async updateProfile(name: string, email: string): Promise<{ success: boolean; error?: string }> {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return { success: false, error: 'Nome e e-mail são obrigatórios.' };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Configuração de autenticação incompleta.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name: cleanName },
        email: cleanEmail,
      });

      if (error) {
        return { success: false, error: error.message || 'Erro ao atualizar perfil no Supabase Auth.' };
      }

      if (cachedAdminUser && data.user) {
        cachedAdminUser = mapSupabaseUserToAdmin(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Erro ao atualizar perfil.',
      };
    }
  },
};
