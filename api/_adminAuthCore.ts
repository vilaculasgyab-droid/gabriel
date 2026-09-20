import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Helper to strip accidental quotes from env vars
function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export const DEFAULT_ADMIN_EMAIL = 'vialnculofelix845@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'FortiMoz@2026!Admin';

export function getAdminEmail(): string {
  const envEmail = cleanEnv(process.env.ADMIN_EMAIL);
  return envEmail ? envEmail.toLowerCase() : DEFAULT_ADMIN_EMAIL.toLowerCase();
}

export function getAdminPassword(): string {
  // First priority: ADMIN_PASSWORD environment variable
  const envPass = cleanEnv(process.env.ADMIN_PASSWORD);
  if (envPass) return envPass;

  // Second priority: locally saved password if updated via Settings in server environment
  try {
    const localStorePath = path.resolve(process.cwd(), 'data', 'admin-session-config.json');
    if (fs.existsSync(localStorePath)) {
      const raw = JSON.parse(fs.readFileSync(localStorePath, 'utf-8'));
      if (raw.customPassword) return raw.customPassword;
    }
  } catch {
    // ignore
  }

  // Fallback default
  return DEFAULT_ADMIN_PASSWORD;
}

export function getAdminProfileData(): { name: string; email: string; role: 'superadmin' } {
  let name = 'Administrador FortiMoz';
  let email = getAdminEmail();

  try {
    const localStorePath = path.resolve(process.cwd(), 'data', 'admin-session-config.json');
    if (fs.existsSync(localStorePath)) {
      const raw = JSON.parse(fs.readFileSync(localStorePath, 'utf-8'));
      if (raw.name) name = raw.name;
      if (raw.email) email = raw.email;
    }
  } catch {
    // ignore
  }

  return { name, email, role: 'superadmin' };
}

// Secret key for HMAC token signing
function getSessionSecret(): string {
  return cleanEnv(process.env.SESSION_SECRET) ||
    cleanEnv(process.env.ADMIN_PASSWORD) ||
    'fortimoz_secure_session_secret_hmac_2026_mz';
}

// ---------------------------------------------------------------------------
// Rate Limiting / Brute-force protection against login dictionary attacks
// ---------------------------------------------------------------------------
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    return { allowed: true };
  }

  // If currently blocked
  if (record.blockedUntil > now) {
    const minutesLeft = Math.ceil((record.blockedUntil - now) / (60 * 1000));
    return { allowed: false, retryAfterMinutes: minutesLeft };
  }

  // If window expired, reset
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(identifier: string): { blocked: boolean; attemptsLeft: number } {
  const now = Date.now();
  let record = loginAttempts.get(identifier);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    record = { count: 1, firstAttempt: now, blockedUntil: 0 };
    loginAttempts.set(identifier, record);
    return { blocked: false, attemptsLeft: MAX_ATTEMPTS - 1 };
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    return { blocked: true, attemptsLeft: 0 };
  }

  return { blocked: false, attemptsLeft: MAX_ATTEMPTS - record.count };
}

export function clearFailedAttempts(identifier: string) {
  loginAttempts.delete(identifier);
}

// ---------------------------------------------------------------------------
// Session Token (HMAC-SHA256 Signed JSON)
// ---------------------------------------------------------------------------
export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  iat: number;
  exp: number;
}

export function createSignedSessionToken(user: { id: string; email: string; name: string; role: 'superadmin' | 'admin' }): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 7 * 24 * 3600; // 7 days session

  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat,
    exp,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

export function verifySignedSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadStr)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const json = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (!json.exp || json.exp < now) {
      return null; // Expired
    }

    return json as SessionPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie Serialization & Parsing Helpers
// ---------------------------------------------------------------------------
export const SESSION_COOKIE_NAME = 'fortimoz_admin_session';

export function parseCookies(header: string | undefined | null): Record<string, string> {
  const list: Record<string, string> = {};
  if (!header) return list;
  header.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

export function buildSetCookieHeader(
  token: string,
  maxAgeSeconds: number = 7 * 24 * 3600,
  req?: any
): string {
  const isSecure =
    req?.secure ||
    req?.headers?.['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isSecure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function buildClearCookieHeader(req?: any): string {
  const isSecure =
    req?.secure ||
    req?.headers?.['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];

  if (isSecure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

// Sets CORS headers correctly when credentials (cookies) are involved
export function setCorsAndNoCacheHeaders(req: any, res: any) {
  const origin = req.headers?.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Pragma, Cache-Control, X-Requested-With'
  );
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

// ---------------------------------------------------------------------------
// Core Business Logic
// ---------------------------------------------------------------------------
export interface AdminAuthResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'admin';
    avatar?: string;
  };
  token?: string;
  cookieHeader?: string;
}

function getSupabaseAuthClient() {
  const url = cleanEnv(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const key = cleanEnv(
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE
  );
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Validates admin login credentials against Supabase Auth and configured ADMIN_PASSWORD
 */
export async function handleAdminLoginCore(
  emailInput: string,
  passwordInput: string,
  req?: any
): Promise<AdminAuthResult> {
  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const password = String(passwordInput || '');

  const clientIp =
    req?.headers?.['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req?.socket?.remoteAddress ||
    'client-ip';
  const rateLimitKey = `${clientIp}_${cleanEmail || 'unknown'}`;

  // 1. Check brute-force rate limit
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      success: false,
      statusCode: 429,
      error: `Demasiadas tentativas falhadas. Por motivos de segurança, tente novamente dentro de ${rateLimit.retryAfterMinutes || 15} minutos.`,
    };
  }

  if (!cleanEmail || !password) {
    return {
      success: false,
      statusCode: 400,
      error: 'Por favor, introduza o seu e-mail e a palavra-passe.',
    };
  }

  const expectedEmail = getAdminEmail();

  // Validate admin email
  if (cleanEmail !== expectedEmail) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      statusCode: 401,
      error: 'Credenciais inválidas.',
    };
  }

  let authenticated = false;
  let supabaseAuthFailed = false;
  let supabaseUserId: string | null = null;

  // A. Authenticate with Supabase Auth if client is available
  const supabase = getSupabaseAuthClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        authenticated = true;
        supabaseUserId = data.user.id;
      } else if (error) {
        // Controlled invalid credentials response
        if (error.status === 400 || (error as any).code === 'invalid_credentials') {
          // Password did not match in Supabase Auth
        } else {
          // Log server-side error securely (no password, token, or keys logged)
          console.error('[ADMIN LOGIN ERROR]', error.message || 'Falha de comunicação com o serviço Supabase Auth');
          supabaseAuthFailed = true;
        }
      }
    } catch (err: any) {
      console.error('[ADMIN LOGIN ERROR]', err?.message || 'Exceção ao autenticar com Supabase Auth');
      supabaseAuthFailed = true;
    }
  }

  // B. Fallback to ADMIN_PASSWORD constant-time check
  if (!authenticated) {
    try {
      const expectedPassword = getAdminPassword();
      if (expectedPassword) {
        const passA = Buffer.from(password);
        const passB = Buffer.from(expectedPassword);
        if (passA.length === passB.length && crypto.timingSafeEqual(passA, passB)) {
          authenticated = true;
        }
      }
    } catch (err: any) {
      console.error('[ADMIN LOGIN ERROR]', err?.message || 'Erro ao validar palavra-passe de administração');
    }
  }

  if (!authenticated) {
    const attempt = recordFailedAttempt(rateLimitKey);
    if (attempt.blocked) {
      return {
        success: false,
        statusCode: 429,
        error: 'Número limite de tentativas excedido. Acesso temporariamente bloqueado por 15 minutos.',
      };
    }

    // If Supabase had a genuine connection/server failure and local password didn't match
    if (supabaseAuthFailed) {
      return {
        success: false,
        statusCode: 500,
        error: 'Erro no servidor de autenticação. O administrador deve verificar a configuração do servidor.',
      };
    }

    return {
      success: false,
      statusCode: 401,
      error: 'Credenciais inválidas.',
    };
  }

  // Clear failed attempts on success
  clearFailedAttempts(rateLimitKey);

  const profile = getAdminProfileData();
  const user = {
    id: supabaseUserId || 'fortimoz-admin-01',
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatar: '/proseguranca-logo.png',
  };

  const token = createSignedSessionToken(user);
  const cookieHeader = buildSetCookieHeader(token, 7 * 24 * 3600, req);

  return {
    success: true,
    statusCode: 200,
    user,
    token,
    cookieHeader,
  };
}

/**
 * Verifies active admin session from Cookie or Bearer token
 */
export function verifyAdminSessionFromRequest(req: any): {
  authenticated: boolean;
  user: SessionPayload | null;
} {
  // 1. Try Cookie
  const cookieHeader = req?.headers?.cookie;
  let token: string | undefined;

  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    token = cookies[SESSION_COOKIE_NAME];
  }

  // 2. Try Authorization Bearer header as fallback
  if (!token && req?.headers?.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return { authenticated: false, user: null };
  }

  const payload = verifySignedSessionToken(token);
  if (!payload) {
    return { authenticated: false, user: null };
  }

  return { authenticated: true, user: payload };
}

/**
 * Changes admin password
 */
export async function handleAdminChangePasswordCore(
  currentPasswordInput: string,
  newPasswordInput: string,
  emailInput?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const currentPass = String(currentPasswordInput || '');
  const newPass = String(newPasswordInput || '');

  if (!currentPass) {
    return { success: false, error: 'A palavra-passe atual é obrigatória.' };
  }

  if (!newPass || newPass.length < 6) {
    return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
  }

  const activePass = getAdminPassword();
  const passA = Buffer.from(currentPass);
  const passB = Buffer.from(activePass);
  const passwordsMatch = passA.length === passB.length && crypto.timingSafeEqual(passA, passB);

  if (!passwordsMatch) {
    return { success: false, error: 'A palavra-passe atual não está correta.' };
  }

  // Save new password locally for immediate runtime persistence
  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const localStorePath = path.resolve(dataDir, 'admin-session-config.json');
    let existing: any = {};
    if (fs.existsSync(localStorePath)) {
      try {
        existing = JSON.parse(fs.readFileSync(localStorePath, 'utf-8'));
      } catch {}
    }
    existing.customPassword = newPass;
    existing.updatedAt = new Date().toISOString();
    fs.writeFileSync(localStorePath, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (saveErr) {
    console.warn('[AdminAuthCore] Aviso ao persistir nova palavra-passe localmente:', saveErr);
  }

  return {
    success: true,
    message: 'Palavra-passe alterada com sucesso! Para persistência permanente na Vercel, atualize também a variável de ambiente ADMIN_PASSWORD.',
  };
}

/**
 * Updates admin profile (name, email)
 */
export async function handleAdminUpdateProfileCore(
  nameInput: string,
  emailInput: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  const cleanName = (nameInput || '').trim();
  const cleanEmail = (emailInput || '').trim().toLowerCase();

  if (!cleanName || !cleanEmail) {
    return { success: false, error: 'Nome e e-mail são obrigatórios.' };
  }

  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const localStorePath = path.resolve(dataDir, 'admin-session-config.json');
    let existing: any = {};
    if (fs.existsSync(localStorePath)) {
      try {
        existing = JSON.parse(fs.readFileSync(localStorePath, 'utf-8'));
      } catch {}
    }
    existing.name = cleanName;
    existing.email = cleanEmail;
    existing.updatedAt = new Date().toISOString();
    fs.writeFileSync(localStorePath, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[AdminAuthCore] Erro ao salvar perfil:', err);
  }

  return {
    success: true,
    user: {
      id: 'fortimoz-admin-01',
      name: cleanName,
      email: cleanEmail,
      role: 'superadmin',
      avatar: '/proseguranca-logo.png',
    },
  };
}
