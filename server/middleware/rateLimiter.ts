/**
 * In-memory rate limiter middleware.
 * Limits requests per IP within a sliding window.
 */
import { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;
const CLEANUP_INTERVAL_MS = 5 * 60_000; // 5 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow Node.js process to exit even if this interval is still running
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
    });
    return;
  }

  next();
}
