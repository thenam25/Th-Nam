export interface ProductSpecification {
  id: string;
  productId: string;
  key: string;
  value: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  model: string;
  brandId: string;
  brandName?: string;
  categoryId: string;
  categoryName?: string;
  price: number | null; // stored as number e.g. 420000000, null for 'Liên hệ'
  priceType: 'FIXED' | 'CONTACT';
  currency: string; // 'VND'
  description: string;
  status: 'ACTIVE' | 'DRAFT' | 'HIDDEN';
  featured: boolean;
  isNew?: boolean;
  isHot?: boolean;
  sortOrder: number;
  images: ProductImage[];
  specifications: ProductSpecification[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  country?: string;
}

export interface BannerSlide {
  id: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  bgImageUrl: string;
  machineImageUrl: string;
  productLink?: string;
  catalogueLink?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  views: number;
}

export interface QuoteRequest {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  productId?: string;
  productName?: string;
  note?: string;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

// PowerPoint Import Data Types
export type ImportJobStatus =
  | 'UPLOADING'
  | 'PARSING'
  | 'EXTRACTING'
  | 'OCR'
  | 'AI_ANALYSIS'
  | 'VALIDATING'
  | 'READY_FOR_REVIEW'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED';

export type ImportItemStatus = 'AUTO_APPROVED' | 'NEEDS_REVIEW' | 'DUPLICATE' | 'REJECTED' | 'IMPORTED';

export interface FieldConfidence {
  productName: number;
  model: number;
  brand: number;
  price: number;
  category: number;
  overall: number;
}

export interface PPTXShapeObject {
  id: string;
  type: 'text' | 'image' | 'group' | 'table' | 'shape';
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageRef?: string; // filename or relationship id
  imageUrl?: string;
}

export interface PPTXSlideData {
  slideNumber: number;
  objects: PPTXShapeObject[];
  extractedText: string;
  images: string[];
}

export interface ImportItem {
  id: string;
  importJobId: string;
  slideNumber: number;
  sourceObjectIds: string[];
  sourceBoundingBox?: { x: number; y: number; width: number; height: number };
  imageUrl: string;
  images?: string[];
  rawText: string;
  extractedName: string;
  extractedModel: string;
  extractedBrand: string;
  extractedCategory: string;
  extractedPrice: number | null;
  priceType: 'FIXED' | 'CONTACT';
  extractedSku?: string;
  extractedDescription?: string;
  extractedSpecifications?: Record<string, string>;
  confidence: FieldConfidence;
  status: ImportItemStatus;
  reviewReason?: string;
  duplicateProductId?: string;
  isEditedByAdmin?: boolean;
}

export interface ImportJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportJobStatus;
  progressPercent: number;
  currentStepMessage: string;
  totalSlides: number;
  totalProductsDetected: number;
  totalProductsImported: number;
  totalProductsNeedReview: number;
  items: ImportItem[];
  createdAt: string;
  completedAt?: string;
}

export interface SiteSettings {
  companyName: string;
  slogan: string;
  logoUrl?: string;
  hotline: string;
  techSupportPhone: string;
  email: string;
  address: string;
  workingHours: string;
  warrantyPolicy: string;
  zaloPhone: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  aboutText?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  mapEmbedUrl?: string;
  adminPassword?: string;
  bankAccountInfo?: string;
  footerCopyright?: string;
  isWholesaleLockEnabled?: boolean;
  wholesalePasscode?: string;
  wholesaleNoticeText?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isSupabaseStorageEnabled?: boolean;
  isMarqueeEnabled?: boolean;
  marqueeText?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalQuoteRequests: number;
  pendingQuotes: number;
  totalImportJobs: number;
  pendingReviewItems: number;
}
