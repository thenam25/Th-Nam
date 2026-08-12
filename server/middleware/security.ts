/**
 * Security middleware: Helmet headers + CORS configuration.
 */
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config.js';

/**
 * Helmet configuration with CSP tuned for this application:
 * - Self-hosted SPA
 * - Images from Supabase Storage, Unsplash CDN, and inline data: URIs
 * - Scripts include unsafe-inline for Vite HMR in development
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'https://*.supabase.co',
        'https://images.unsplash.com',
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: [
        "'self'",
        'https://*.supabase.co',
        'https://firestore.googleapis.com',
      ],
      frameSrc: ["'self'"],
      formAction: ["'self'"],
    },
  },
  // Disable X-Powered-By to avoid leaking tech stack info
  hidePoweredBy: true,
  // Prevent MIME type sniffing
  xContentTypeOptions: true,
  // Prevent clickjacking
  frameguard: { action: 'deny' },
});

/**
 * CORS configuration.
 * In production, only allows the configured APP_URL.
 * In development, allows localhost origins.
 */
export const corsMiddleware = cors({
  origin: config.isProduction
    ? [config.appUrl].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-api-key',
    'x-admin-token',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
});
