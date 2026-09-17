import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Helper to strip accidental quotes from env vars
function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function getSupabaseUrl(): string {
  return cleanEnv(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '');
}

export function getSupabaseServiceRoleKey(): string {
  return cleanEnv(
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  );
}

export function getSupabaseAnonKey(): string {
  return cleanEnv(
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  );
}

export const DEFAULT_ADMIN_EMAIL = 'vialnculofelix845@gmail.com';
export const FORTIMOZ_ADMIN_EMAIL = 'admin@fortimoz.co.mz';
export const LEGACY_ADMIN_EMAIL = 'admin@proseguranca.co.mz';
export const INITIAL_DEFAULT_PASSWORD = 'FortiMoz@2026';

let cachedAdminClient: SupabaseClient | null = null;
let cachedAnonClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) return null;
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdminClient;
}

function getAnonClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey() || getSupabaseServiceRoleKey();
  if (!url || !anonKey) return null;
  if (!cachedAnonClient) {
    cachedAnonClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAnonClient;
}

export function normalizeEmail(email: string | undefined | null): string {
  const clean = (email || '').trim().toLowerCase();
  if (!clean || clean === LEGACY_ADMIN_EMAIL) {
    return DEFAULT_ADMIN_EMAIL;
  }
  return clean;
}

/**
 * Fallback local hashed store in case Supabase is completely unavailable.
 * Stored safely in data/admin-credentials-fallback.json with salt and SHA-256.
 */
interface LocalAdminCredentials {
  email: string;
  name: string;
  salt: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
}

function hashPasswordLocal(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function getLocalCredentialsPath(): string {
  return path.resolve(process.cwd(), 'data', 'admin-credentials-fallback.json');
}

function getLocalCredentials(): LocalAdminCredentials {
  const filePath = getLocalCredentialsPath();
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data && data.passwordHash && data.salt) {
        return data;
      }
    }
  } catch {
    // ignore
  }

  // Default initial fallback
  const defaultSalt = 'fortimoz_salt_2026';
  const creds: LocalAdminCredentials = {
    email: DEFAULT_ADMIN_EMAIL,
    name: 'Administrador FortiMoz',
    salt: defaultSalt,
    passwordHash: hashPasswordLocal(INITIAL_DEFAULT_PASSWORD, defaultSalt),
    role: 'superadmin',
  };

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(creds, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[AdminAuthCore] Aviso: Não foi possível gravar credenciais fallback:', err);
  }

  return creds;
}

function saveLocalCredentials(creds: LocalAdminCredentials): void {
  const filePath = getLocalCredentialsPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(creds, null, 2), 'utf-8');
}

/**
 * Ensures the admin user exists in Supabase Auth
 */
export async function ensureSupabaseAdminUser(): Promise<{ id: string; email: string } | null> {
  const adminClient = getAdminClient();
  if (!adminClient) return null;

  try {
    const { data: usersData, error: listErr } = await adminClient.auth.admin.listUsers();
    if (!listErr && usersData?.users) {
      const existing = (usersData.users as any[]).find(
        (u: any) =>
          u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
          u.email?.toLowerCase() === FORTIMOZ_ADMIN_EMAIL.toLowerCase() ||
          u.email?.toLowerCase() === LEGACY_ADMIN_EMAIL.toLowerCase()
      );
      if (existing) {
        return { id: existing.id, email: existing.email || DEFAULT_ADMIN_EMAIL };
      }
    }

    // Not found, create initial admin user in Supabase Auth
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: DEFAULT_ADMIN_EMAIL,
      password: INITIAL_DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Administrador FortiMoz',
        role: 'superadmin',
      },
    });

    if (createErr) {
      console.warn('[AdminAuthCore] Erro ao criar usuário admin inicial no Supabase:', createErr.message);
      return null;
    }

    return { id: newUser.user.id, email: newUser.user.email || DEFAULT_ADMIN_EMAIL };
  } catch (err) {
    console.warn('[AdminAuthCore] Falha ao verificar/criar usuário admin no Supabase:', err);
    return null;
  }
}

export interface AdminAuthResult {
  success: boolean;
  error?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'admin';
    avatar: string;
  };
  token?: string;
}

/**
 * Validates admin login against Supabase Auth (with local fallback)
 */
export async function handleAdminLoginCore(
  emailInput: string,
  passwordInput: string
): Promise<AdminAuthResult> {
  const cleanEmail = normalizeEmail(emailInput);
  const password = String(passwordInput || '');

  if (!password) {
    return { success: false, error: 'A palavra-passe é obrigatória.' };
  }

  const adminClient = getAdminClient();
  const anonClient = getAnonClient();

  if (anonClient) {
    // 1. Validate password via Supabase Auth signInWithPassword directly
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.user) {
      const user = {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'Administrador FortiMoz',
        email: data.user.email || cleanEmail,
        role: (data.user.user_metadata?.role as any) || 'superadmin',
        avatar: '/proseguranca-logo.png',
      };

      const token = data.session?.access_token || ('adm_tok_' + crypto.randomBytes(16).toString('hex'));

      return {
        success: true,
        user,
        token,
      };
    }

    // 2. If first attempt fails and adminClient is available, verify if user needs initialization
    if (adminClient) {
      try {
        const ensured = await ensureSupabaseAdminUser();
        if (ensured) {
          const retry = await anonClient.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (!retry.error && retry.data?.user) {
            const user = {
              id: retry.data.user.id,
              name: retry.data.user.user_metadata?.name || 'Administrador FortiMoz',
              email: retry.data.user.email || cleanEmail,
              role: (retry.data.user.user_metadata?.role as any) || 'superadmin',
              avatar: '/proseguranca-logo.png',
            };
            const token = retry.data.session?.access_token || ('adm_tok_' + crypto.randomBytes(16).toString('hex'));
            return {
              success: true,
              user,
              token,
            };
          }
        }
      } catch (ensureErr) {
        console.warn('[AdminAuthCore] Erro ao assegurar usuário admin no Supabase:', ensureErr);
      }
    }

    return {
      success: false,
      error: 'Credenciais de administrador inválidas. Verifique o e-mail e a palavra-passe.',
    };
  }

  // Fallback if Supabase is not configured
  const localCreds = getLocalCredentials();
  const inputHash = hashPasswordLocal(password, localCreds.salt);
  if (inputHash !== localCreds.passwordHash) {
    return {
      success: false,
      error: 'Credenciais de administrador inválidas.',
    };
  }

  return {
    success: true,
    user: {
      id: 'local-adm-001',
      name: localCreds.name,
      email: localCreds.email,
      role: localCreds.role,
      avatar: '/proseguranca-logo.png',
    },
    token: 'local_adm_tok_' + crypto.randomBytes(16).toString('hex'),
  };
}

/**
 * Changes admin password with strict verification of current password
 */
export async function handleAdminChangePasswordCore(
  currentPassword: string,
  newPassword: string,
  emailInput?: string
): Promise<AdminAuthResult> {
  const cleanEmail = normalizeEmail(emailInput);
  const curPass = String(currentPassword || '');
  const newPass = String(newPassword || '');

  if (!curPass) {
    return { success: false, error: 'A senha atual não está correta.' };
  }

  if (newPass.length < 6) {
    return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
  }

  const adminClient = getAdminClient();
  const anonClient = getAnonClient();

  if (anonClient) {
    // 1. STRICT VERIFICATION: Verify current password against Supabase Auth
    const { data: verifyData, error: verifyErr } = await anonClient.auth.signInWithPassword({
      email: cleanEmail,
      password: curPass,
    });

    if (verifyErr || !verifyData?.user) {
      return {
        success: false,
        error: 'A senha atual não está correta.',
      };
    }

    // 2. Update password in Supabase Auth
    if (adminClient) {
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(
        verifyData.user.id,
        { password: newPass }
      );

      if (updateErr) {
        console.error('[AdminAuthCore] Erro ao atualizar senha no Supabase:', updateErr.message);
        return {
          success: false,
          error: `Falha ao gravar nova senha no Supabase: ${updateErr.message}`,
        };
      }
    } else if (verifyData.session?.access_token) {
      // Direct user password update if admin service role is unavailable
      const userClient = createClient(getSupabaseUrl(), getSupabaseAnonKey() || '', {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${verifyData.session.access_token}` } },
      });
      const { error: updateErr } = await userClient.auth.updateUser({ password: newPass });
      if (updateErr) {
        return {
          success: false,
          error: `Falha ao gravar nova senha no Supabase: ${updateErr.message}`,
        };
      }
    }

    // 3. Also keep local fallback synchronized
    try {
      const localCreds = getLocalCredentials();
      const newSalt = 'fortimoz_salt_' + Date.now().toString(36);
      localCreds.salt = newSalt;
      localCreds.passwordHash = hashPasswordLocal(newPass, newSalt);
      saveLocalCredentials(localCreds);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Palavra-passe alterada e persistida com sucesso no Supabase.',
    };
  }

  // Fallback when Supabase is not configured
  const localCreds = getLocalCredentials();
  const currentHash = hashPasswordLocal(curPass, localCreds.salt);
  if (currentHash !== localCreds.passwordHash) {
    return {
      success: false,
      error: 'A senha atual não está correta.',
    };
  }

  const newSalt = 'fortimoz_salt_' + Date.now().toString(36);
  localCreds.salt = newSalt;
  localCreds.passwordHash = hashPasswordLocal(newPass, newSalt);
  saveLocalCredentials(localCreds);

  return {
    success: true,
    message: 'Palavra-passe alterada com sucesso.',
  };
}

/**
 * Updates admin profile (name, display)
 */
export async function handleAdminUpdateProfileCore(
  name: string,
  emailInput?: string
): Promise<AdminAuthResult> {
  const cleanName = (name || '').trim();
  const cleanEmail = normalizeEmail(emailInput);

  if (!cleanName) {
    return { success: false, error: 'O nome é obrigatório.' };
  }

  const adminClient = getAdminClient();
  if (adminClient) {
    const adminUser = await ensureSupabaseAdminUser();
    if (adminUser) {
      await adminClient.auth.admin.updateUserById(adminUser.id, {
        user_metadata: { name: cleanName },
      });
    }
  }

  try {
    const localCreds = getLocalCredentials();
    localCreds.name = cleanName;
    saveLocalCredentials(localCreds);
  } catch {
    // ignore
  }

  return {
    success: true,
    user: {
      id: 'adm-001',
      name: cleanName,
      email: cleanEmail,
      role: 'superadmin',
      avatar: '/proseguranca-logo.png',
    },
  };
}
