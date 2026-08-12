/**
 * Authentication & authorization middleware.
 *
 * - requireApiKey: protects admin write endpoints via API key or admin session token
 * - Admin session tokens: issued by POST /api/admin/login, valid for 30 minutes
 */
import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

const ADMIN_SESSION_TTL_MS = 30 * 60_000; // 30 minutes

interface AdminSession {
  expiresAt: number;
}

const adminSessionTokens = new Map<string, AdminSession>();

/**
 * Creates a new admin session token (called from admin login route).
 */
export function createAdminSessionToken(): string {
  const token = `adm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  adminSessionTokens.set(token, { expiresAt: Date.now() + ADMIN_SESSION_TTL_MS });
  return token;
}

/**
 * Validates an admin session token. Returns true if valid and not expired.
 */
export function isValidAdminSession(token: string): boolean {
  const session = adminSessionTokens.get(token);
  if (!session) return false;
  if (Date.now() >= session.expiresAt) {
    adminSessionTokens.delete(token);
    return false;
  }
  return true;
}

/**
 * Middleware that requires either a valid API key or an admin session token.
 *
 * Authentication methods (checked in order):
 * 1. x-admin-token header (admin session from /api/admin/login)
 * 2. Authorization: Bearer <token> header
 * 3. x-api-key header
 *
 * SECURITY: If no API_KEY is configured in production, ALL write requests
 * are rejected. There is no bypass path — the previous dangerous bypass
 * `if (isProduction && !API_KEY) return next()` has been removed.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  const adminToken = req.headers['x-admin-token'] as string | undefined;

  // 1. Check admin session token
  if (adminToken && isValidAdminSession(adminToken)) {
    return next();
  }

  // 2. Check API key (via Bearer token or x-api-key header)
  const providedKey = bearerToken || apiKeyHeader || '';

  if (config.apiKey && providedKey === config.apiKey) {
    return next();
  }

  // 3. No valid credentials — reject
  if (!config.apiKey) {
    console.error(
      'SECURITY: No API_KEY configured. All admin write endpoints are disabled. ' +
      'Set the API_KEY environment variable to enable admin access.'
    );
  }

  res.status(401).json({
    success: false,
    message: 'Không có quyền truy cập. Vui lòng cung cấp API Key hoặc đăng nhập Admin.',
  });
}
