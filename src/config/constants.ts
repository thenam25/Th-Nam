/**
 * Application-wide constants for consistent configuration.
 * Centralizes magic numbers, limits, and display settings.
 */

// ── Pagination & Display ──────────────────────────────────────────────
export const PRODUCTS_PER_PAGE = 20;
export const FEATURED_PRODUCTS_LIMIT = 6;
export const RELATED_PRODUCTS_LIMIT = 5;
export const CATEGORIES_PER_VIEW = 8;

// ── Image & Upload ────────────────────────────────────────────────────
export const DEFAULT_IMAGE_QUALITY = 80;
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
export const MAX_JSON_SIZE = '100mb';
export const UPLOAD_DIR = '/tmp/uploads';

// ── Rate Limiting ─────────────────────────────────────────────────────
export const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute
export const RATE_LIMIT_CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

// ── Auth & Session ────────────────────────────────────────────────────
export const ADMIN_SESSION_TTL_MS = 30 * 60_000; // 30 minutes
export const TOKEN_BYTE_LENGTH = 48;
export const API_KEY_HEADER = 'x-api-key';
export const ADMIN_TOKEN_HEADER = 'x-admin-token';

// ── PPTX Import ───────────────────────────────────────────────────────
export const PPTX_CHUNK_TTL_MS = 10 * 60_000; // 10 minutes
export const EMU_PER_PX = 9525; // English Metric Units per pixel

// ── AI / Gemini ───────────────────────────────────────────────────────
export const GEMINI_MAX_RETRIES = 1;
export const GEMINI_INITIAL_DELAY_MS = 1000;
export const GEMINI_RESPONSE_SCHEMA_NAME = 'ProductBulkExtraction';

// ── UI Animation ──────────────────────────────────────────────────────
export const SCROLL_DEBOUNCE_MS = 150;
export const TOAST_DURATION_MS = 3000;
export const MODAL_ANIMATION_DURATION_MS = 200;

// ── Supabase / Storage ────────────────────────────────────────────────
export const SUPABASE_DEFAULT_URL = 'https://zqufilzcwciznfutqhth.supabase.co';
export const STORAGE_BUCKET_NAME = 'nong-co-images';

// ── Contact ───────────────────────────────────────────────────────────
export const DEFAULT_HOTLINE = '0968 123 456';
export const DEFAULT_ZALO_PHONE = '0968123456';
export const DEFAULT_COMPANY_NAME = 'Công ty TNHH Bảo Nam Tân Phú';
export const DEFAULT_EMAIL = 'contact@nongcomachinery.vn';

// ── Product ───────────────────────────────────────────────────────────
export const DEFAULT_CURRENCY = 'VND';
export const PRICE_MINIMUM_VALID = 1_000; // Minimum valid price in VND

// ── DB ────────────────────────────────────────────────────────────────
export const DB_READ_RETRY_MAX = 5;
export const DB_READ_RETRY_DELAY_MS = 50;
export const CLOUD_SYNC_TIMEOUT_MS = 5000;
export const CLOUD_PUSH_TIMEOUT_MS = 6000;

// ── Default Placeholder URLs ──────────────────────────────────────────
export const PLACEHOLDER_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=800&auto=format&fit=crop&q=80';
export const PLACEHOLDER_HERO_BG =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80';
