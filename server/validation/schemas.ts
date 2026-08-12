/**
 * Zod validation schemas for all API inputs.
 *
 * These schemas validate and sanitize request bodies for all POST/PUT endpoints.
 * The `.passthrough()` option allows extra fields through (they are ignored),
 * preventing breakage when the admin panel sends additional fields.
 */
import { z } from 'zod';

// ── Helpers ──────────────────────────────────────────────────────────────

const vietnamPhoneRegex = /^(0|\+84)[1-9]\d{8,9}$/;
const nonEmptyString = (min = 1, max = 500) =>
  z.string().min(min, `Tối thiểu ${min} ký tự`).max(max, `Tối đa ${max} ký tự`);

// ── Admin ────────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  password: nonEmptyString(1, 200),
});

// ── Products ─────────────────────────────────────────────────────────────

export const productSpecificationSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  key: nonEmptyString(1, 200),
  value: nonEmptyString(1, 500),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  url: z.string().url('URL ảnh không hợp lệ'),
  thumbnailUrl: z.string().url().optional(),
  alt: z.string().optional(),
  sortOrder: z.number().int().min(0).default(1),
  isPrimary: z.boolean().default(false),
});

export const productInputSchema = z.object({
  id: z.string().optional(),
  name: nonEmptyString(1, 200),
  slug: z.string().optional(),
  sku: z.string().optional(),
  model: z.string().optional(),
  brandId: z.string().optional(),
  brandName: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  price: z.number().nullable().optional().default(null),
  priceType: z.enum(['FIXED', 'CONTACT']).optional().default('CONTACT'),
  currency: z.string().optional().default('VND'),
  description: z.string().optional().default(''),
  status: z.enum(['ACTIVE', 'DRAFT', 'HIDDEN']).optional().default('ACTIVE'),
  featured: z.boolean().optional().default(false),
  isHot: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional(),
  images: z.array(productImageSchema).optional().default([]),
  specifications: z.array(productSpecificationSchema).optional().default([]),
}).passthrough();

export const productBatchInputSchema = z.object({
  products: z.array(productInputSchema).min(1, 'Danh sách sản phẩm không được trống'),
}).passthrough();

export const batchCategorySchema = z.object({
  productIds: z.array(z.string()).min(1, 'Chưa chọn sản phẩm nào'),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
});

// ── Categories ───────────────────────────────────────────────────────────

export const categoryInputSchema = z.object({
  id: z.string().optional(),
  name: nonEmptyString(1, 100),
  slug: z.string().optional(),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  productCount: z.number().int().min(0).optional().default(0),
  sortOrder: z.number().int().optional(),
}).passthrough();

// ── Brands ───────────────────────────────────────────────────────────────

export const brandInputSchema = z.object({
  id: z.string().optional(),
  name: nonEmptyString(1, 100),
  slug: z.string().optional(),
  logoUrl: z.string().optional().default(''),
  description: z.string().optional().default(''),
  country: z.string().optional().default(''),
}).passthrough();

// ── Banners ──────────────────────────────────────────────────────────────

export const bannerInputSchema = z.object({
  id: z.string().optional(),
  titleLine1: nonEmptyString(1, 200),
  titleLine2: z.string().optional().default(''),
  description: z.string().optional().default(''),
  bgImageUrl: z.string().optional().default(''),
  machineImageUrl: z.string().optional().default(''),
  productLink: z.string().optional(),
  catalogueLink: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional().default(true),
}).passthrough();

export const bannerSaveAllSchema = z.object({
  banners: z.array(bannerInputSchema).optional().default([]),
}).passthrough();

// ── Quotes ───────────────────────────────────────────────────────────────

export const quoteInputSchema = z.object({
  customerName: nonEmptyString(1, 200),
  phone: z.string().regex(vietnamPhoneRegex, 'Số điện thoại không hợp lệ (VD: 0968123456)'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().optional().default(''),
  productId: z.string().optional(),
  productName: z.string().optional().default('Yêu cầu tư vấn chung'),
  note: z.string().optional().default(''),
});

// ── Settings ─────────────────────────────────────────────────────────────

export const settingsSchema = z.object({
  companyName: z.string().optional(),
  slogan: z.string().optional(),
  logoUrl: z.string().optional(),
  hotline: z.string().optional(),
  techSupportPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  workingHours: z.string().optional(),
  warrantyPolicy: z.string().optional(),
  zaloPhone: z.string().optional(),
  heroTitleLine1: z.string().optional(),
  heroTitleLine2: z.string().optional(),
  heroDescription: z.string().optional(),
  aboutText: z.string().optional(),
  facebookUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  adminPassword: z.string().optional(),
  bankAccountInfo: z.string().optional(),
  footerCopyright: z.string().optional(),
  isWholesaleLockEnabled: z.boolean().optional(),
  wholesalePasscode: z.string().optional(),
  wholesaleNoticeText: z.string().optional(),
  supabaseUrl: z.string().optional(),
  supabaseAnonKey: z.string().optional(),
  isSupabaseStorageEnabled: z.boolean().optional(),
  isMarqueeEnabled: z.boolean().optional(),
  marqueeText: z.string().optional(),
}).passthrough();

// ── Supabase Test ────────────────────────────────────────────────────────

export const supabaseTestSchema = z.object({
  url: z.string().optional().default(''),
  key: z.string().optional().default(''),
});

// ── Import Items ─────────────────────────────────────────────────────────

export const importJobSchema = z.object({
  id: z.string(),
  fileName: z.string().optional().default(''),
  fileSize: z.number().optional().default(0),
  status: z.string().optional(),
  items: z.array(z.any()).optional().default([]),
}).passthrough();

export const importAppendItemsSchema = z.object({
  items: z.array(z.any()).min(1, 'Danh sách sản phẩm không được trống'),
});

export const batchApproveItemsSchema = z.object({
  jobId: z.string(),
  itemIds: z.array(z.string()).min(1, 'Chưa chọn sản phẩm nào'),
});

export const importBatchCategorySchema = z.object({
  jobId: z.string(),
  itemIds: z.array(z.string()).min(1, 'Chưa chọn sản phẩm nào'),
  categoryName: z.string().optional(),
  job: z.any().optional(),
});

export const importReviewItemSchema = z.object({
  jobId: z.string(),
  itemData: z.any(),
});

export const importCommitSchema = z.object({
  importAll: z.boolean().optional(),
  job: z.any().optional(),
  items: z.array(z.any()).optional(),
}).passthrough();

// ── Backup ───────────────────────────────────────────────────────────────

export const backupImportSchema = z.object({
  data: z.any().optional(),
}).passthrough();

// ── Type exports ─────────────────────────────────────────────────────────

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type BrandInput = z.infer<typeof brandInputSchema>;
export type BannerInput = z.infer<typeof bannerInputSchema>;
export type QuoteInput = z.infer<typeof quoteInputSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
