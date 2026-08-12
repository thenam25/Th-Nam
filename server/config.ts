/**
 * Centralized server configuration.
 * All environment variable access is consolidated here for
 * auditability, validation, and typed access.
 */
import dotenv from 'dotenv';
dotenv.config();

function env(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

function bool(key: string, fallback = false): boolean {
  const val = process.env[key];
  if (val === undefined) return fallback;
  return val === 'true' || val === '1';
}

export const config = {
  // ── Environment ──────────────────────────────────────────────────────
  nodeEnv: env('NODE_ENV', 'development'),
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
  isVercel: Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_BUILDER),

  // ── API Security ─────────────────────────────────────────────────────
  apiKey: env('API_KEY'),
  adminPassword: env('ADMIN_PASSWORD'),

  // ── Gemini AI ────────────────────────────────────────────────────────
  geminiApiKey: env('GEMINI_API_KEY'),

  // ── Supabase (Data Sync + Image Storage) ─────────────────────────────
  supabaseUrl: env('SUPABASE_URL'),
  supabaseAnonKey: env('SUPABASE_ANON_KEY'),

  // ── Cloudinary (Image CDN — replaces Firestore for ảnh) ─────────────
  cloudinaryCloudName: env('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: env('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: env('CLOUDINARY_API_SECRET'),

  // ── Legacy Firestore (deprecated — use Supabase instead) ─────────────
  firestoreBaseUrl: env('FIRESTORE_BASE_URL'),
  firestoreApiKey: env('FIRESTORE_API_KEY'),

  // ── App ──────────────────────────────────────────────────────────────
  appUrl: env('APP_URL', 'http://localhost:3000'),
  port: parseInt(env('PORT', '3000'), 10),

  // ── Feature Flags ────────────────────────────────────────────────────
  disableHmr: bool('DISABLE_HMR', false),
} as const;

/**
 * Validates that critical production environment variables are set.
 * Logs warnings for missing optional-but-recommended variables.
 */
export function validateConfig(): string[] {
  const warnings: string[] = [];

  if (!config.apiKey) {
    if (config.isProduction) {
      warnings.push(
        'CRITICAL: API_KEY is not set in production. All admin write endpoints will be disabled.'
      );
    } else {
      warnings.push(
        'WARNING: API_KEY is not set. Admin write endpoints are unprotected in development.'
      );
    }
  }

  if (!config.adminPassword) {
    warnings.push(
      'WARNING: ADMIN_PASSWORD is not set. Admin login will be disabled until configured.'
    );
  }

  if (!config.geminiApiKey) {
    warnings.push(
      'INFO: GEMINI_API_KEY is not set. AI-powered PPTX import will use fallback text extraction.'
    );
  }

  // ── Data persistence ──────────────────────────────────────────────────
  if (config.isVercel && (!config.supabaseUrl || !config.supabaseAnonKey)) {
    warnings.push(
      'CRITICAL: SUPABASE_URL + SUPABASE_ANON_KEY chưa cấu hình. Trên Vercel, data sẽ MẤT khi cold start. ' +
      'Đăng ký miễn phí tại https://supabase.com và chạy SQL tạo bảng app_state (xem server/db/cloudSync.ts).'
    );
  } else if (!config.isVercel && (!config.supabaseUrl || !config.supabaseAnonKey)) {
    warnings.push(
      'INFO: Supabase chưa cấu hình. Data chỉ lưu local, không sync cloud.'
    );
  }

  // ── Image storage ─────────────────────────────────────────────────────
  const hasCloudinary = Boolean(config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret);
  const hasSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey);

  if (!hasCloudinary && !hasSupabase) {
    warnings.push(
      'INFO: Chưa cấu hình Cloudinary hoặc Supabase Storage. Ảnh sẽ lưu dưới dạng base64 trong database (không khuyến khích cho production). ' +
      'Đăng ký Cloudinary miễn phí (25GB) tại https://cloudinary.com hoặc dùng Supabase Storage.'
    );
  }

  if (!hasCloudinary && hasSupabase) {
    warnings.push(
      'INFO: Đang dùng Supabase Storage cho ảnh (free: 1GB). Với 6000 ảnh, nên dùng thêm Cloudinary (free: 25GB) để thoải mái hơn.'
    );
  }

  return warnings;
}
