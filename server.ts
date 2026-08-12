/**
 * Nông Cơ Machinery — Express Server
 *
 * Modular architecture:
 * - Middleware: rateLimiter, auth, security (Helmet + CORS), errorHandler
 * - Routes: products, categories, brands, banners, quotes, admin, settings, upload, import
 * - Config: centralized env var access via server/config.ts
 * - Validation: Zod schemas applied to all write endpoints via server/validation/
 */
import express from 'express';
import path from 'path';

// ── Config ───────────────────────────────────────────────────────────────
import { config, validateConfig } from './server/config.js';

// ── Middleware ───────────────────────────────────────────────────────────
import { rateLimiter } from './server/middleware/rateLimiter.js';
import { securityHeaders, corsMiddleware } from './server/middleware/security.js';
import { globalErrorHandler } from './server/middleware/errorHandler.js';

// ── Route modules ────────────────────────────────────────────────────────
import productsRouter from './server/routes/products.js';
import categoriesRouter from './server/routes/categories.js';
import brandsRouter from './server/routes/brands.js';
import bannersRouter from './server/routes/banners.js';
import quotesRouter from './server/routes/quotes.js';
import adminRouter from './server/routes/admin.js';
import settingsRouter from './server/routes/settings.js';
import uploadRouter from './server/routes/upload.js';
import importRouter from './server/routes/import.js';

// ── Constants ────────────────────────────────────────────────────────────
const MAX_JSON_SIZE = '100mb';

// ── Validate config on startup ───────────────────────────────────────────
const configWarnings = validateConfig();
for (const warning of configWarnings) {
  console.warn(`[Config] ${warning}`);
}

// ── Express app setup ────────────────────────────────────────────────────
export const app = express();

// Global middleware (applied to all routes)
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_JSON_SIZE }));
app.use(rateLimiter);

// ── Mount API routes ─────────────────────────────────────────────────────
// Mount order matters: more specific prefixes first, then catch-all.
//
// On Vercel, rewrites send /api/* to the Express app — the /api prefix
// is preserved in req.url. Each router expects paths relative to its
// own domain root, so we mount with the full RESTful prefix.

// Domain routers — mounted with /api/<domain> prefix to match frontend calls
app.use('/api/products', productsRouter);     // /api/products, /api/products/:id, /api/products/batch, etc.
app.use('/api/categories', categoriesRouter); // /api/categories, /api/categories/:id
app.use('/api/brands', brandsRouter);         // /api/brands
app.use('/api/quotes', quotesRouter);         // /api/quotes
app.use('/api/settings', settingsRouter);     // /api/settings

// Routers whose internal paths already include their domain prefix
app.use('/api', bannersRouter);      // router has /banners, /banners/:id, /banners/save-all, /news
app.use('/api', adminRouter);        // router has /admin/login, /health, /stats, /reset-data, /backup/*
app.use('/api', uploadRouter);       // router has /upload/image, /supabase/test
app.use('/api', importRouter);       // router has /import/pptx, /import/jobs, etc.

// Root mounts for local dev — Vercel rewrites non-/api requests to static files,
// so these only matter when running the Express server directly.
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/brands', brandsRouter);
app.use('/quotes', quotesRouter);
app.use('/settings', settingsRouter);
app.use('/', bannersRouter);
app.use('/', adminRouter);
app.use('/', uploadRouter);
app.use('/', importRouter);

// ── Global error handler (must be last) ──────────────────────────────────
app.use(globalErrorHandler);

// ── Server startup ───────────────────────────────────────────────────────
async function startServer() {
  const PORT = config.port;

  if (config.nodeEnv !== 'production') {
    // Dev mode: use Vite middleware for HMR
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[Dev] Vite HMR middleware enabled');
    } catch (e) {
      console.warn('[Dev] Vite middleware skipped:', e);
    }
  } else {
    // Production mode: serve built static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Nông Cơ Machinery running on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
  });
}

// On Vercel, the server is imported as a module (api/index.ts) — don't call listen()
if (!config.isVercel) {
  startServer();
}

export default app;
