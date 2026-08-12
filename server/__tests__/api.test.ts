/**
 * API integration tests.
 *
 * These tests verify the Express app's route handlers, middleware, and
 * validation logic. They use the app directly (imported Express instance)
 * with mocked request/response objects to avoid starting a real HTTP server.
 *
 * NOTE: Routes are tested by calling the Router directly. Route paths are
 * relative to the router itself (e.g. router.post('/') is tested with url: '/').
 * When mounted in server.ts, these become /api/... and /...
 */
import { describe, it, expect, vi } from 'vitest';
import { type Request, type NextFunction } from 'express';

// ── Helpers: create mock Express req/res ────────────────────────────────────

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    method: 'GET',
    url: '/',
    ...overrides,
  } as Request;
}

// Use a plain object cast to any to avoid TS issues with Express Response internals
function mockRes(): any {
  const res: any = {};
  res.statusCode = 200;
  res._headers = {};

  res.status = function (code: number) {
    res.statusCode = code;
    return res;
  };

  res.json = function (data: unknown) {
    res._body = data;
    return res;
  };

  res.setHeader = function (name: string, value: string) {
    res._headers[name] = value;
    return res;
  };

  return res;
}

// ── Middleware tests ────────────────────────────────────────────────────────

describe('Security Middleware', () => {
  it('Helmet security headers middleware exports a function', async () => {
    const { securityHeaders } = await import('../middleware/security.js');
    expect(typeof securityHeaders).toBe('function');
  });

  it('CORS middleware exports a function', async () => {
    const { corsMiddleware } = await import('../middleware/security.js');
    expect(typeof corsMiddleware).toBe('function');
  });
});

describe('Auth Middleware', () => {
  it('requireApiKey rejects requests without credentials', async () => {
    const { requireApiKey } = await import('../middleware/auth.js');
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = () => { throw new Error('next() should not be called'); };

    requireApiKey(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._body?.success).toBe(false);
  });

  it('requireApiKey accepts valid x-api-key header when API_KEY is set', async () => {
    // Reset module cache so config re-reads process.env
    vi.resetModules();
    process.env.API_KEY = 'test-api-key-123';

    const { requireApiKey } = await import('../middleware/auth.js');
    const req = mockReq({ headers: { 'x-api-key': 'test-api-key-123' } });
    const res = mockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    requireApiKey(req, res, next);

    expect(nextCalled).toBe(true);

    // Clean up
    delete process.env.API_KEY;
    vi.resetModules();
  });

  it('createAdminSessionToken returns a valid session token', async () => {
    const { createAdminSessionToken, isValidAdminSession } = await import('../middleware/auth.js');
    const token = createAdminSessionToken();
    expect(typeof token).toBe('string');
    expect(token.startsWith('adm_')).toBe(true);
    expect(isValidAdminSession(token)).toBe(true);
    expect(isValidAdminSession('fake-token')).toBe(false);
  });
});

describe('Rate Limiter Middleware', () => {
  it('exports a middleware function', async () => {
    const { rateLimiter } = await import('../middleware/rateLimiter.js');
    expect(typeof rateLimiter).toBe('function');
  });

  it('allows requests within the rate limit', async () => {
    const { rateLimiter } = await import('../middleware/rateLimiter.js');
    const req = mockReq({ ip: '127.0.0.1' });
    const res = mockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    rateLimiter(req, res, next);
    expect(nextCalled).toBe(true);
  });
});

describe('Error Handler Middleware', () => {
  it('globalErrorHandler handles AppError', async () => {
    vi.resetModules();
    const { globalErrorHandler, BadRequestError } = await import('../middleware/errorHandler.js');
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = () => {};

    globalErrorHandler(new BadRequestError('Dữ liệu không hợp lệ'), req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._body?.success).toBe(false);
  });

  it('globalErrorHandler returns 500 for generic Error', async () => {
    vi.resetModules();
    const { globalErrorHandler } = await import('../middleware/errorHandler.js');
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = () => {};

    globalErrorHandler(new Error('Something broke'), req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._body?.success).toBe(false);
  });
});

// ── Validation tests ────────────────────────────────────────────────────────

describe('Validation Middleware', () => {
  it('validate() returns a middleware function', async () => {
    const { validate } = await import('../validation/middleware.js');
    const { productInputSchema } = await import('../validation/schemas.js');
    const mw = validate(productInputSchema);
    expect(typeof mw).toBe('function');
  });

  it('validate() rejects invalid product data (empty name)', async () => {
    const { validate } = await import('../validation/middleware.js');
    const { productInputSchema } = await import('../validation/schemas.js');
    const mw = validate(productInputSchema);

    const req = mockReq({ body: { name: '' } });
    const res = mockRes();
    const next: NextFunction = () => {};

    mw(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._body?.success).toBe(false);
  });

  it('validate() accepts valid product data and coerces types', async () => {
    const { validate } = await import('../validation/middleware.js');
    const { productInputSchema } = await import('../validation/schemas.js');
    const mw = validate(productInputSchema);

    const req = mockReq({
      body: {
        name: 'Máy cày Yanmar EF393T',
        price: 420_000_000,
        category: 'MÁY CÀY',
        brand: 'Yanmar',
      },
    });
    const res = mockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    mw(req, res, next);

    expect(nextCalled).toBe(true);
    expect(req.body.name).toBe('Máy cày Yanmar EF393T');
  });
});

// ── Config tests ────────────────────────────────────────────────────────────

describe('Config', () => {
  it('exports config object with required fields', async () => {
    const { config } = await import('../config.js');
    expect(config).toBeDefined();
    expect(typeof config.nodeEnv).toBe('string');
    expect(typeof config.port).toBe('number');
    expect(config.port).toBeGreaterThan(0);
    expect('apiKey' in config).toBe(true);
    expect('adminPassword' in config).toBe(true);
    expect('geminiApiKey' in config).toBe(true);
  });

  it('validateConfig returns array of warnings', async () => {
    const { validateConfig } = await import('../config.js');
    const warnings = validateConfig();
    expect(Array.isArray(warnings)).toBe(true);
  });
});

// ── Route handler tests ─────────────────────────────────────────────────────
// Access the private Router.handle via type assertion

describe('Admin Routes', () => {
  it('GET /health returns ok status', async () => {
    const { default: router } = await import('../routes/admin.js');

    const req = mockReq({ method: 'GET', url: '/health' });
    const res = mockRes();

    // Router.handle is a private method; use any to call it in tests
    (router as any).handle(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res._body?.status).toBe('ok');
    expect(res._body?.timestamp).toBeDefined();
  });

  it('GET /stats returns dashboard data', async () => {
    const { default: router } = await import('../routes/admin.js');

    const req = mockReq({ method: 'GET', url: '/stats' });
    const res = mockRes();

    (router as any).handle(req, res, () => {});

    expect(res.statusCode).toBe(200);
    expect(res._body?.success).toBe(true);
    expect(res._body?.data).toBeDefined();
    expect(typeof res._body?.data?.totalProducts).toBe('number');
    expect(typeof res._body?.data?.totalCategories).toBe('number');
  });

  it('POST /admin/login rejects empty password', async () => {
    const { default: router } = await import('../routes/admin.js');

    const req = mockReq({
      method: 'POST',
      url: '/admin/login',
      body: { password: '' },
    });
    const res = mockRes();

    (router as any).handle(req, res, () => {});

    // Should be rejected by Zod validation (400) or by login logic
    expect([400, 401, 500]).toContain(res.statusCode);
  });
});

describe('Products Routes', () => {
  it('GET / (product list) returns data', async () => {
    const { default: router } = await import('../routes/products.js');

    // The router's root route is '/' (mounted at /api and / in server.ts)
    const req = mockReq({ method: 'GET', url: '/' });
    const res = mockRes();

    (router as any).handle(req, res, () => {});

    expect(res.statusCode).toBe(200);
    // The route returns { success: true, data: products }
    expect(res._body?.success).toBe(true);
    expect(Array.isArray(res._body?.data)).toBe(true);
  });

  it('POST / (create product) without auth is rejected', async () => {
    const { default: router } = await import('../routes/products.js');

    // POST / is the create product route: router.post('/', requireApiKey, ...)
    const req = mockReq({
      method: 'POST',
      url: '/',
      body: { name: 'Test Product', price: 1_000_000 },
    });
    const res = mockRes();

    (router as any).handle(req, res, () => {});

    // Without API key, auth middleware should reject
    expect([400, 401]).toContain(res.statusCode);
  });
});
