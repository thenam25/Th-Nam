import fs from 'fs';
import path from 'path';
import { Product, Category, Brand, BannerSlide, NewsArticle, QuoteRequest, ImportJob, SiteSettings } from '../src/types/index.js';
import initialRepoDb from '../data/db.json' with { type: 'json' };
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_BRANDS, SEED_BANNERS, SEED_NEWS, DEFAULT_SITE_SETTINGS } from './db/seedData.js';
import { fetchCloudDb, pushCloudDb } from './db/cloudSync.js';
import { DatabaseSchema } from './db/schema.js';

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export { DEFAULT_SITE_SETTINGS };

class LocalDatabase {
  private data: DatabaseSchema;
  private _initializing = true;

  constructor() {
    this.data = {
      products: [],
      categories: [],
      brands: [],
      banners: [],
      news: [],
      quoteRequests: [],
      importJobs: [],
      siteSettings: DEFAULT_SITE_SETTINGS,
    };
    this.init();
    this._initializing = false;
  }

  /**
   * Initialize the database from the most appropriate source.
   *
   * Priority order:
   * 1. /tmp/data/db.json (Vercel warm instance — user's live data)
   * 2. /tmp/data/db.json.bak (recovery from interrupted write)
   * 3. Bundled data/db.json (deployment seed — copy to /tmp on first cold start)
   * 4. initialRepoDb (TypeScript import fallback)
   * 5. SEED_* constants (hardcoded fallback)
   *
   * After local init, an async cloud fetch is scheduled to check for
   * newer data from Firestore (best-effort, non-blocking).
   */
  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // ── Vercel cold start: seed /tmp from bundled data ─────────────────
      // On Vercel, /tmp is ephemeral. On cold start it's empty.
      // Copy the bundled data/db.json (deployment seed) to /tmp/data/
      // so it serves as the initial state for this cold-start lifecycle.
      if (isVercel && !fs.existsSync(DB_FILE)) {
        const bundledSeedFile = path.join(process.cwd(), 'data', 'db.json');
        if (fs.existsSync(bundledSeedFile)) {
          try {
            fs.copyFileSync(bundledSeedFile, DB_FILE);
            console.log('[DB Init] Cold start — copied bundled seed db.json to /tmp/data/.');
          } catch (copyErr: any) {
            console.warn('[DB Init] Could not copy bundled seed to /tmp:', copyErr.message);
          }
        }
      }

      const bakFile = DB_FILE + '.bak';
      let loadedData: DatabaseSchema | null = null;

      // ── Step 1: Load from /tmp/data/db.json (warm instance or just-seeded) ──
      for (let attempt = 0; attempt < 5; attempt++) {
        if (fs.existsSync(DB_FILE)) {
          try {
            const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
            if (fileContent && fileContent.trim()) {
              loadedData = JSON.parse(fileContent);
              if (loadedData && (Array.isArray(loadedData.products) || Array.isArray(loadedData.categories))) {
                break;
              }
              loadedData = null; // Invalid — retry or fall through
            }
          } catch (readErr: any) {
            console.error(`[DB Init] Attempt ${attempt + 1}: Error reading db.json:`, readErr.message);
          }
        }

        // Try backup file
        if (!loadedData && fs.existsSync(bakFile)) {
          try {
            const bakContent = fs.readFileSync(bakFile, 'utf-8');
            if (bakContent && bakContent.trim()) {
              loadedData = JSON.parse(bakContent);
              if (loadedData && (Array.isArray(loadedData.products) || Array.isArray(loadedData.categories))) {
                console.log('[DB Init] Recovered database from backup file.');
                break;
              }
              loadedData = null;
            }
          } catch (bakErr: any) {
            console.error(`[DB Init] Attempt ${attempt + 1}: Error reading backup:`, bakErr.message);
          }
        }

        if (attempt < 4) {
          // Brief pause before retry (busy-wait ~50ms for file lock contention)
          const start = Date.now();
          while (Date.now() - start < 50) { /* spin */ }
        }
      }

      // ── Step 2: Fall back to repo/bundled data if /tmp has nothing ──
      if (!loadedData) {
        // Try the repo file at process.cwd() (works for both local dev and Vercel with includeFiles)
        const repoDbFile = path.join(process.cwd(), 'data', 'db.json');
        if (fs.existsSync(repoDbFile) && repoDbFile !== DB_FILE) {
          try {
            const repoContent = fs.readFileSync(repoDbFile, 'utf-8');
            if (repoContent && repoContent.trim()) {
              loadedData = JSON.parse(repoContent);
              if (loadedData) {
                console.log('[DB Init] Loaded seed data from repo data/db.json.');
              }
            }
          } catch (repoErr: any) {
            console.error('[DB Init] Error reading repo data/db.json:', repoErr.message);
          }
        }
      }

      // ── Step 3: TypeScript import fallback ──
      if (!loadedData && initialRepoDb && Array.isArray((initialRepoDb as any).products)) {
        loadedData = initialRepoDb as unknown as DatabaseSchema;
        console.log('[DB Init] Loaded seed data from bundled initialRepoDb import.');
      }

      // ── Step 4: Hardcoded seed fallback ──
      if (!loadedData) {
        console.log('[DB Init] No data found — using hardcoded seed constants.');
      }

      // ── Assemble final data ──────────────────────────────────────────
      const loadedProds = loadedData ? (Array.isArray(loadedData.products) ? loadedData.products : []) : [];
      const loadedCats = loadedData ? (Array.isArray(loadedData.categories) ? loadedData.categories : []) : [];
      const loadedBrands = loadedData ? (Array.isArray(loadedData.brands) ? loadedData.brands : []) : [];
      const loadedBanners = loadedData ? (Array.isArray(loadedData.banners) ? loadedData.banners : []) : [];
      const loadedNews = loadedData ? (Array.isArray(loadedData.news) ? loadedData.news : []) : [];
      const deletedProds = loadedData ? (Array.isArray(loadedData.deletedProductIds) ? loadedData.deletedProductIds : []) : [];
      const deletedCats = loadedData ? (Array.isArray(loadedData.deletedCategoryIds) ? loadedData.deletedCategoryIds : []) : [];
      const deletedBrands = loadedData ? (Array.isArray(loadedData.deletedBrandIds) ? loadedData.deletedBrandIds : []) : [];

      // If loaded data has isInitialized: true, it's "canonical" — use it directly.
      // If not (legacy data), treat loaded data as seed-like and prefer non-empty arrays.
      const isCanonical = loadedData?.isInitialized === true;

      let finalProds: Product[];
      let finalCats: Category[];
      let finalBrands: Brand[];

      if (isCanonical) {
        // Canonical data: use exactly what was loaded
        finalProds = loadedProds;
        finalCats = loadedCats;
        finalBrands = loadedBrands;
      } else {
        // Non-canonical: prefer loaded data if non-empty, else fall back to seed
        finalProds = loadedProds.length > 0 ? loadedProds : SEED_PRODUCTS;
        finalCats = loadedCats.length > 0 ? loadedCats : SEED_CATEGORIES;
        finalBrands = loadedBrands.length > 0 ? loadedBrands : SEED_BRANDS;
      }

      // ── Apply deletion filters (preserve user's delete actions) ──────
      if (deletedProds.length > 0) {
        finalProds = finalProds.filter((p) => !deletedProds.includes(p.id));
      }
      if (deletedCats.length > 0) {
        finalCats = finalCats.filter((c) => !deletedCats.includes(c.id));
      }
      if (deletedBrands.length > 0) {
        finalBrands = finalBrands.filter((b) => !deletedBrands.includes(b.id));
      }

      // ── Populate this.data ───────────────────────────────────────────
      this.data = {
        products: finalProds,
        categories: finalCats,
        brands: finalBrands,
        banners: loadedBanners.length > 0 ? loadedBanners : SEED_BANNERS,
        news: loadedNews.length > 0 ? loadedNews : SEED_NEWS,
        quoteRequests: loadedData?.quoteRequests || [],
        importJobs: loadedData?.importJobs || [],
        siteSettings: { ...DEFAULT_SITE_SETTINGS, ...(loadedData?.siteSettings || {}) },
        isInitialized: true,
        lastModified: loadedData?.lastModified || new Date().toISOString(),
        deletedProductIds: deletedProds,
        deletedCategoryIds: deletedCats,
        deletedBrandIds: deletedBrands,
      };

      console.log(`[DB Loaded] Products: ${this.data.products.length}, Categories: ${this.data.categories.length}, Brands: ${this.data.brands.length}`);

      // ── Persist and schedule cloud sync ──────────────────────────────
      this.save();

      // Schedule async cloud fetch — best effort, non-blocking.
      // If cloud has newer data (e.g., from another instance), merge it in.
      if (isVercel) {
        this.scheduleCloudSync();
      }
    } catch (err: any) {
      console.error('[DB Init] Fatal error initializing DB:', err.message || err);
      // Ensure we always have some data, even on catastrophic failure
      this.data = {
        products: SEED_PRODUCTS,
        categories: SEED_CATEGORIES,
        brands: SEED_BRANDS,
        banners: SEED_BANNERS,
        news: SEED_NEWS,
        quoteRequests: [],
        importJobs: [],
        siteSettings: DEFAULT_SITE_SETTINGS,
        isInitialized: true,
        deletedProductIds: [],
        deletedCategoryIds: [],
        deletedBrandIds: [],
      };
    }
  }

  /**
   * Best-effort async cloud sync. Fetches data from Firestore and merges
   * if the cloud data is more recent than local data.
   *
   * IMPORTANT: This only merges cloud → local if cloud data is NEWER
   * (based on lastModified timestamp). It never overwrites newer local
   * data with older cloud data.
   */
  private scheduleCloudSync(): void {
    // Retry cloud fetch up to 3 times with exponential backoff
    const tryFetch = (attempt: number): Promise<any> => {
      return fetchCloudDb().then((cloudData) => {
        if (!cloudData || attempt >= 3) return cloudData;
        // If cloud data seems empty/seed-like, retry after delay
        const cloudProds = Array.isArray(cloudData.products) ? cloudData.products : [];
        if (cloudProds.length === 0 && attempt < 2) {
          console.log(`[DB Cloud Sync] Empty cloud data on attempt ${attempt + 1}, retrying...`);
          return new Promise((resolve) =>
            setTimeout(() => resolve(tryFetch(attempt + 1)), 2000 * (attempt + 1))
          );
        }
        return cloudData;
      }).catch((err) => {
        if (attempt < 2) {
          console.warn(`[DB Cloud Sync] Fetch attempt ${attempt + 1} failed, retrying:`, err.message || err);
          return new Promise((resolve) =>
            setTimeout(() => resolve(tryFetch(attempt + 1)), 2000 * (attempt + 1))
          );
        }
        console.warn('[DB Cloud Sync] All fetch attempts failed.');
        return null;
      });
    };

    tryFetch(0).then((cloudData) => {
      if (!cloudData) return;

      const cloudProds = Array.isArray(cloudData.products) ? cloudData.products : [];
      const localProds = this.data.products;

      // Compare timestamps: only merge if cloud is newer than local
      const cloudTime = cloudData.lastModified ? new Date(cloudData.lastModified).getTime() : 0;
      const localTime = this.data.lastModified ? new Date(this.data.lastModified).getTime() : 0;

      // Merge if: cloud is newer than local, OR local looks like seed data (≤8 products)
      const localLooksLikeSeed = localProds.length <= 8 && !this.data.lastModified;
      const cloudIsNewer = cloudTime > localTime;
      const cloudHasMoreData = cloudProds.length > localProds.length;

      if (cloudIsNewer || (localLooksLikeSeed && cloudHasMoreData)) {
        console.log(
          `[DB Cloud Sync] Merging cloud data — local: ${localProds.length} prods (${localTime ? new Date(localTime).toISOString() : 'no timestamp'}), ` +
          `cloud: ${cloudProds.length} prods (${cloudTime ? new Date(cloudTime).toISOString() : 'no timestamp'}), ` +
          `reason: ${cloudIsNewer ? 'cloud is newer' : 'local looks like seed'}`
        );

        // Preserve deleted IDs from both sources
        const mergedDeletedProds = Array.from(new Set([
          ...(this.data.deletedProductIds || []),
          ...(Array.isArray(cloudData.deletedProductIds) ? cloudData.deletedProductIds : []),
        ]));
        const mergedDeletedCats = Array.from(new Set([
          ...(this.data.deletedCategoryIds || []),
          ...(Array.isArray(cloudData.deletedCategoryIds) ? cloudData.deletedCategoryIds : []),
        ]));

        // Apply deletion filter to cloud products
        let mergedProds = cloudProds.filter(
          (p: Product) => !mergedDeletedProds.includes(p.id)
        );

        this.data = {
          ...this.data,
          products: mergedProds,
          categories: cloudData.categories?.length ? cloudData.categories : this.data.categories,
          brands: cloudData.brands?.length ? cloudData.brands : this.data.brands,
          banners: cloudData.banners?.length ? cloudData.banners : this.data.banners,
          news: cloudData.news?.length ? cloudData.news : this.data.news,
          siteSettings: { ...this.data.siteSettings, ...(cloudData.siteSettings || {}) },
          lastModified: cloudData.lastModified || this.data.lastModified,
          deletedProductIds: mergedDeletedProds,
          deletedCategoryIds: mergedDeletedCats,
          deletedBrandIds: Array.from(new Set([
            ...(this.data.deletedBrandIds || []),
            ...(Array.isArray(cloudData.deletedBrandIds) ? cloudData.deletedBrandIds : []),
          ])),
        };

        // Save locally but don't push back to cloud (avoid ping-pong)
        this._initializing = true;  // temporarily block cloud push
        this.save();               // writes to /tmp only
        this._initializing = false;
        console.log(`[DB Cloud Sync] Merged — now have ${this.data.products.length} products.`);
      } else {
        console.log(
          `[DB Cloud Sync] Local data is current — keeping local ` +
          `(${localProds.length} prods, modified ${this.data.lastModified || 'unknown'}).`
        );
      }
    }).catch((err) => {
      console.warn('[DB Cloud Sync] Async cloud fetch failed:', err.message || err);
    });
  }

  public save() {
    try {
      this.data.isInitialized = true;
      this.data.lastModified = new Date().toISOString();
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const jsonString = JSON.stringify(this.data, null, 2);
      const tmpFile = DB_FILE + '.tmp';

      // 1. Write to temporary file first
      fs.writeFileSync(tmpFile, jsonString, 'utf-8');

      // 2. Create backup before replacing
      if (fs.existsSync(DB_FILE)) {
        try {
          fs.copyFileSync(DB_FILE, DB_FILE + '.bak');
        } catch {}
      }

      // 3. Atomically replace DB_FILE using atomic rename
      fs.renameSync(tmpFile, DB_FILE);

      // 4. Sync state persistently to Cloud Firestore
      // CRITICAL: Do NOT push to cloud during initialization — pushing seed
      // data to Firestore would overwrite the user's real production data.
      if (!this._initializing) {
        pushCloudDb(this.data, DATA_DIR);
      } else {
        console.log('[DB Save] Skipping cloud push during initialization (prevents seed overwrite).');
      }
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Products Repository
  // ═══════════════════════════════════════════════════════════════════

  public getProducts(params?: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    featured?: boolean;
    isHot?: boolean;
    isNew?: boolean;
    limit?: number;
  }): Product[] {
    let result = [...this.data.products];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brandName && p.brandName.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    if (params?.categoryId) {
      result = result.filter((p) => p.categoryId === params.categoryId);
    }

    if (params?.brandId) {
      result = result.filter((p) => p.brandId === params.brandId);
    }

    if (params?.featured !== undefined) {
      result = result.filter((p) => p.featured === params.featured);
    }

    if (params?.isHot !== undefined) {
      result = result.filter((p) => p.isHot === params.isHot);
    }

    if (params?.isNew !== undefined) {
      result = result.filter((p) => p.isNew === params.isNew);
    }

    result.sort((a, b) => a.sortOrder - b.sortOrder);

    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return (this.data.products || []).find((p) => p.id === id || p.slug === id);
  }

  public saveProduct(product: Partial<Product>): Product {
    const now = new Date().toISOString();
    let existingIndex = (this.data.products || []).findIndex((p) => p.id === product.id);

    // Auto calculate brandName and categoryName
    const cat = (this.data.categories || []).find((c) => c.id === product.categoryId);
    const brand = (this.data.brands || []).find((b) => b.id === product.brandId);

    if (existingIndex >= 0) {
      const updated: Product = {
        ...this.data.products[existingIndex],
        ...product,
        categoryName: cat ? cat.name : this.data.products[existingIndex].categoryName,
        brandName: brand ? brand.name : this.data.products[existingIndex].brandName,
        updatedAt: now,
      };
      this.data.products[existingIndex] = updated;
      this.save();
      return updated;
    } else {
      const newProduct: Product = {
        id: product.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: product.name || 'Sản phẩm mới',
        slug: product.slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'san-pham-moi'),
        sku: product.sku || `SKU-${Date.now()}`,
        model: product.model || 'N/A',
        brandId: product.brandId || '',
        brandName: brand?.name || product.brandName || '',
        categoryId: product.categoryId || '',
        categoryName: cat?.name || product.categoryName || '',
        price: product.price !== undefined ? product.price : null,
        priceType: product.price ? 'FIXED' : 'CONTACT',
        currency: 'VND',
        description: product.description || '',
        status: product.status || 'ACTIVE',
        featured: !!product.featured,
        isHot: !!product.isHot,
        isNew: !!product.isNew,
        sortOrder: product.sortOrder || this.data.products.length + 1,
        images: product.images || [
          {
            id: `img-${Date.now()}`,
            productId: '',
            url: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=800&auto=format&fit=crop&q=80',
            isPrimary: true,
            sortOrder: 1,
          },
        ],
        specifications: product.specifications || [],
        createdAt: now,
        updatedAt: now,
      };
      this.data.products.push(newProduct);
      this.save();
      return newProduct;
    }
  }

  public deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.data.products.splice(idx, 1);
      if (!this.data.deletedProductIds) this.data.deletedProductIds = [];
      if (!this.data.deletedProductIds.includes(id)) {
        this.data.deletedProductIds.push(id);
      }
      this.save();
      return true;
    }
    return false;
  }

  public clearAllProducts(): boolean {
    const allCurrentIds = this.data.products.map((p) => p.id);
    this.data.products = [];
    if (!this.data.deletedProductIds) this.data.deletedProductIds = [];
    this.data.deletedProductIds = Array.from(new Set([...this.data.deletedProductIds, ...allCurrentIds, ...SEED_PRODUCTS.map((p) => p.id)]));
    this.save();
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Categories Repository
  // ═══════════════════════════════════════════════════════════════════

  public getCategories(): Category[] {
    // Map categories with updated product counts
    const withCounts = this.data.categories.map((cat) => {
      const count = this.data.products.filter((p) => p.categoryId === cat.id).length;
      return { ...cat, productCount: count };
    });

    // Deduplicate by normalized name while preserving product count totals
    const uniqueMap = new Map<string, Category>();
    for (const cat of withCounts) {
      const normName = (cat.name || 'DANH MỤC').trim().toUpperCase();
      if (!uniqueMap.has(normName)) {
        uniqueMap.set(normName, { ...cat });
      } else {
        const existing = uniqueMap.get(normName)!;
        existing.productCount += cat.productCount;
        if (!existing.imageUrl && cat.imageUrl) {
          existing.imageUrl = cat.imageUrl;
        }
      }
    }

    return Array.from(uniqueMap.values());
  }

  public saveCategory(category: Partial<Category>): Category {
    let idx = this.data.categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...category };
      this.save();
      return this.data.categories[idx];
    } else {
      const newCat: Category = {
        id: category.id || `cat-${Date.now()}`,
        name: category.name || 'Danh mục mới',
        slug: category.slug || 'danh-muc-moi',
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        productCount: 0,
        sortOrder: this.data.categories.length + 1,
      };
      this.data.categories.push(newCat);
      this.save();
      return newCat;
    }
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.data.categories.splice(idx, 1);
      if (!this.data.deletedCategoryIds) this.data.deletedCategoryIds = [];
      if (!this.data.deletedCategoryIds.includes(id)) {
        this.data.deletedCategoryIds.push(id);
      }
      this.save();
      return true;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Brands Repository
  // ═══════════════════════════════════════════════════════════════════

  public getBrands(): Brand[] {
    return this.data.brands;
  }

  public saveBrand(brand: Partial<Brand>): Brand {
    let idx = this.data.brands.findIndex((b) => b.id === brand.id);
    if (idx >= 0) {
      this.data.brands[idx] = { ...this.data.brands[idx], ...brand };
      this.save();
      return this.data.brands[idx];
    } else {
      const newBrand: Brand = {
        id: brand.id || `brand-${Date.now()}`,
        name: brand.name || 'Thương hiệu mới',
        slug: brand.slug || 'thuong-hieu-moi',
        description: brand.description || '',
        country: brand.country || 'Việt Nam',
      };
      this.data.brands.push(newBrand);
      this.save();
      return newBrand;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Banners Repository
  // ═══════════════════════════════════════════════════════════════════

  public getBanners(): BannerSlide[] {
    return this.data.banners || [];
  }

  public saveBanners(banners: BannerSlide[]): BannerSlide[] {
    this.data.banners = banners;
    this.save();
    return this.data.banners;
  }

  public saveBanner(banner: Partial<BannerSlide>): BannerSlide {
    if (!this.data.banners) this.data.banners = [];
    if (banner.id) {
      const idx = this.data.banners.findIndex((b) => b.id === banner.id);
      if (idx >= 0) {
        this.data.banners[idx] = { ...this.data.banners[idx], ...banner };
        this.save();
        return this.data.banners[idx];
      }
    }
    const newBanner: BannerSlide = {
      id: banner.id || `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      titleLine1: banner.titleLine1 || 'GIẢI PHÁP TOÀN DIỆN',
      titleLine2: banner.titleLine2 || 'CHO NÔNG NGHIỆP HIỆN ĐẠI',
      description: banner.description || 'Cung cấp đa dạng các dòng máy nông nghiệp chất lượng cao.',
      bgImageUrl: banner.bgImageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80',
      machineImageUrl: banner.machineImageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=1000&auto=format&fit=crop&q=80',
      sortOrder: banner.sortOrder ?? (this.data.banners.length + 1),
      isActive: banner.isActive ?? true,
    };
    this.data.banners.push(newBanner);
    this.save();
    return newBanner;
  }

  public deleteBanner(id: string): boolean {
    if (!this.data.banners) return false;
    const prevLen = this.data.banners.length;
    this.data.banners = this.data.banners.filter((b) => b.id !== id);
    if (this.data.banners.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════
  // News Repository
  // ═══════════════════════════════════════════════════════════════════

  public getNews(): NewsArticle[] {
    return this.data.news;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Quote Requests Repository
  // ═══════════════════════════════════════════════════════════════════

  public getQuoteRequests(): QuoteRequest[] {
    return this.data.quoteRequests;
  }

  public createQuoteRequest(req: Partial<QuoteRequest>): QuoteRequest {
    const newReq: QuoteRequest = {
      id: `quote-${Date.now()}`,
      customerName: req.customerName || 'Khách hàng',
      phone: req.phone || '',
      email: req.email || '',
      address: req.address || '',
      productId: req.productId,
      productName: req.productName || 'Yêu cầu tư vấn chung',
      note: req.note || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.data.quoteRequests.unshift(newReq);
    this.save();
    return newReq;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Import Jobs Repository
  // ═══════════════════════════════════════════════════════════════════

  public getImportJobs(): ImportJob[] {
    return this.data.importJobs;
  }

  public getImportJobById(id: string): ImportJob | undefined {
    return (this.data.importJobs || []).find((j) => j.id === id);
  }

  public saveImportJob(job: ImportJob): ImportJob {
    const idx = (this.data.importJobs || []).findIndex((j) => j.id === job.id);
    if (idx >= 0) {
      this.data.importJobs[idx] = job;
    } else {
      this.data.importJobs.unshift(job);
    }
    this.save();
    return job;
  }

  public deleteImportItem(jobId: string, itemId: string): ImportJob | undefined {
    const job = this.getImportJobById(jobId);
    if (!job) return undefined;
    job.items = job.items.filter((it) => it.id !== itemId);
    job.totalProductsDetected = job.items.length;
    job.totalProductsNeedReview = job.items.filter((it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE').length;
    this.saveImportJob(job);
    return job;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Settings Repository
  // ═══════════════════════════════════════════════════════════════════

  public getSettings(): SiteSettings {
    // Settings come purely from stored data + env vars — no hardcoded secrets.
    const settings = this.data.siteSettings || { ...DEFAULT_SITE_SETTINGS };
    if (!settings.supabaseUrl && process.env.SUPABASE_URL) {
      settings.supabaseUrl = process.env.SUPABASE_URL;
    }
    if (!settings.supabaseAnonKey && process.env.SUPABASE_ANON_KEY) {
      settings.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    }
    return settings;
  }

  public saveSettings(settings: Partial<SiteSettings>): SiteSettings {
    this.data.siteSettings = {
      ...(this.data.siteSettings || DEFAULT_SITE_SETTINGS),
      ...settings,
    };
    this.save();
    return this.data.siteSettings;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Admin: Reset / Backup / Restore / Sample Data
  // ═══════════════════════════════════════════════════════════════════

  public resetToSeed(): void {
    this.data = {
      products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
      categories: JSON.parse(JSON.stringify(SEED_CATEGORIES)),
      brands: JSON.parse(JSON.stringify(SEED_BRANDS)),
      banners: JSON.parse(JSON.stringify(SEED_BANNERS)),
      news: JSON.parse(JSON.stringify(SEED_NEWS)),
      quoteRequests: [],
      importJobs: [],
      siteSettings: { ...DEFAULT_SITE_SETTINGS },
      lastModified: new Date().toISOString(),
    };
    this.save();
  }

  public exportFullDatabase(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public importFullDatabase(importedData: any): DatabaseSchema {
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('File sao lưu không hợp lệ hoặc dữ liệu bị hỏng.');
    }

    this.data = {
      products: Array.isArray(importedData.products) ? importedData.products : [],
      categories: Array.isArray(importedData.categories) ? importedData.categories : [],
      brands: Array.isArray(importedData.brands) ? importedData.brands : [],
      banners: Array.isArray(importedData.banners) ? importedData.banners : [],
      news: Array.isArray(importedData.news) ? importedData.news : [],
      quoteRequests: Array.isArray(importedData.quoteRequests) ? importedData.quoteRequests : [],
      importJobs: Array.isArray(importedData.importJobs) ? importedData.importJobs : [],
      siteSettings: importedData.siteSettings || { ...DEFAULT_SITE_SETTINGS },
    };

    this.save();
    return this.data;
  }

  public createSampleImportJob(): ImportJob {
    const jobId = `job-sample-${Date.now()}`;
    const sampleJob: ImportJob = {
      id: jobId,
      fileName: 'Catalog_May_Nong_Co_2026_Sample.pptx',
      fileSize: 4850000,
      status: 'READY_FOR_REVIEW',
      progressPercent: 100,
      currentStepMessage: 'Đã trích xuất thành công 5 sản phẩm nông cơ mẫu từ catalog PPTX!',
      totalSlides: 5,
      totalProductsDetected: 5,
      totalProductsImported: 0,
      totalProductsNeedReview: 2,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `item-s1`,
          importJobId: jobId,
          slideNumber: 1,
          sourceObjectIds: ['s1-img', 's1-txt'],
          imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=600&auto=format&fit=crop&q=80',
          rawText: 'MÁY CÀY YANMAR EF393T 39HP\nĐộng cơ Diesel 3 xi lanh\nGiá: 265.000.000 VNĐ',
          extractedName: 'Máy cày Yanmar EF393T',
          extractedModel: 'EF393T',
          extractedBrand: 'Yanmar',
          extractedCategory: 'MÁY CÀY',
          extractedPrice: 265000000,
          priceType: 'FIXED',
          extractedSku: 'YM-EF393T',
          extractedDescription: 'Máy cày Yanmar EF393T công suất 39HP, dẫn động 4 bánh mạnh mẽ.',
          confidence: { productName: 0.95, model: 0.92, brand: 0.98, price: 0.9, category: 0.94, overall: 0.94 },
          status: 'AUTO_APPROVED',
        },
        {
          id: `item-s2`,
          importJobId: jobId,
          slideNumber: 2,
          sourceObjectIds: ['s2-img', 's2-txt'],
          imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
          rawText: 'MÁY XỚI ĐẤT KUBOTA FQ650 6.5HP\nModel: FQ650\nGiá liên hệ',
          extractedName: 'Máy xới đất Kubota FQ650',
          extractedModel: 'FQ650',
          extractedBrand: 'Kubota',
          extractedCategory: 'MÁY XỚI ĐẤT',
          extractedPrice: 22000000,
          priceType: 'FIXED',
          extractedSku: 'KB-FQ650',
          extractedDescription: 'Máy xới đất mini làm vườn xới tơi xốp, động cơ xăng dễ nổ.',
          confidence: { productName: 0.88, model: 0.85, brand: 0.95, price: 0.75, category: 0.9, overall: 0.86 },
          status: 'AUTO_APPROVED',
        },
        {
          id: `item-s3`,
          importJobId: jobId,
          slideNumber: 3,
          sourceObjectIds: ['s3-img', 's3-txt'],
          imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop&q=80',
          rawText: 'MÁY BƠM NƯỚC HONDA WL20XH 5.5HP\nỐng 50mm, bơm 670 lít/phút\nGiá: 6.800.000 VNĐ',
          extractedName: 'Máy bơm nước Honda WL20XH',
          extractedModel: 'WL20XH',
          extractedBrand: 'Honda',
          extractedCategory: 'MÁY BƠM NƯỚC',
          extractedPrice: 6800000,
          priceType: 'FIXED',
          extractedSku: 'HD-WL20XH',
          extractedDescription: 'Máy bơm nước Honda chính hãng lưu lượng cao cho đồng ruộng.',
          confidence: { productName: 0.9, model: 0.88, brand: 0.96, price: 0.92, category: 0.95, overall: 0.92 },
          status: 'NEEDS_REVIEW',
          reviewReason: 'Cần xác nhận thông số cột áp',
        },
        {
          id: `item-s4`,
          importJobId: jobId,
          slideNumber: 4,
          sourceObjectIds: ['s4-img', 's4-txt'],
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
          rawText: 'MÁY PHÁT ĐIỆN HONDA EP2500CX 2.2KVA\nGiá: 11.500.000 VNĐ',
          extractedName: 'Máy phát điện Honda EP2500CX',
          extractedModel: 'EP2500CX',
          extractedBrand: 'Honda',
          extractedCategory: 'MÁY PHÁT ĐIỆN',
          extractedPrice: 11500000,
          priceType: 'FIXED',
          extractedSku: 'HD-EP2500CX',
          extractedDescription: 'Máy phát điện xăng Honda tự động điều áp AVR.',
          confidence: { productName: 0.94, model: 0.92, brand: 0.97, price: 0.91, category: 0.93, overall: 0.93 },
          status: 'NEEDS_REVIEW',
          reviewReason: 'Cần kiểm tra xuất xứ',
        },
        {
          id: `item-s5`,
          importJobId: jobId,
          slideNumber: 5,
          sourceObjectIds: ['s5-img', 's5-txt'],
          imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
          rawText: 'MÁY GẶT KUBOTA DC-105X 105HP\nHàm cắt 2.3m, công suất lớn\nGiá: 580.000.000 VNĐ',
          extractedName: 'Máy gặt đập Kubota DC-105X',
          extractedModel: 'DC-105X',
          extractedBrand: 'Kubota',
          extractedCategory: 'MÁY GẶT ĐẬP',
          extractedPrice: 580000000,
          priceType: 'FIXED',
          extractedSku: 'KB-DC105X',
          extractedDescription: 'Máy gặt liên hợp gặt đập lúa ngã, sình lầy.',
          confidence: { productName: 0.96, model: 0.95, brand: 0.99, price: 0.94, category: 0.97, overall: 0.96 },
          status: 'AUTO_APPROVED',
        },
      ],
    };

    this.saveImportJob(sampleJob);
    return sampleJob;
  }
}

declare global {
  var __LOCAL_DB_INSTANCE__: LocalDatabase | undefined;
}

if (!globalThis.__LOCAL_DB_INSTANCE__) {
  globalThis.__LOCAL_DB_INSTANCE__ = new LocalDatabase();
}

export const db = globalThis.__LOCAL_DB_INSTANCE__;
