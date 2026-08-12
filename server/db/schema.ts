/**
 * Database schema types used across the database layer.
 */

import { Product, Category, Brand, BannerSlide, NewsArticle, QuoteRequest, ImportJob, SiteSettings } from '../../src/types/index.js';

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  banners: BannerSlide[];
  news: NewsArticle[];
  quoteRequests: QuoteRequest[];
  importJobs: ImportJob[];
  siteSettings: SiteSettings;
  isInitialized?: boolean;
  lastModified?: string; // ISO timestamp — used to compare freshness between local & cloud
  deletedProductIds?: string[];
  deletedCategoryIds?: string[];
  deletedBrandIds?: string[];
}
