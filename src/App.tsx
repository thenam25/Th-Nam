import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { TopBar } from './components/Header/TopBar.js';
import { MarqueeBanner } from './components/Header/MarqueeBanner.js';
import { MainNav } from './components/Header/MainNav.js';
import { HeroBanner } from './components/Hero/HeroBanner.js';
import { CategoryBar } from './components/Category/CategoryBar.js';
import { FeaturedProducts } from './components/Product/FeaturedProducts.js';
import { ProductCard } from './components/Product/ProductCard.js';
import { UspBanner } from './components/USP/UspBanner.js';
import { AboutAndNews } from './components/About/AboutAndNews.js';
import { Footer } from './components/Footer/Footer.js';
import { FloatingContact } from './components/Contact/FloatingContact.js';
import { ProductDetailModal } from './components/Product/ProductDetailModal.js';
import { QuoteModal } from './components/Quote/QuoteModal.js';
import { WholesaleLockOverlay } from './components/Wholesale/WholesaleLockOverlay.js';
import { Product, Category, Brand, BannerSlide, NewsArticle, SiteSettings } from './types/index.js';

// Code-splitting: lazy-load heavy admin components (3233-line AdminPanel + login modal)
const AdminPanel = lazy(() => import('./components/Admin/AdminPanel.js').then(m => ({ default: m.AdminPanel })));
const AdminLoginModal = lazy(() => import('./components/Admin/AdminLoginModal.js').then(m => ({ default: m.AdminLoginModal })));

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | undefined>(undefined);

  // Navigation and filter state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState<number>(20);

  const productsSectionRef = useRef<HTMLDivElement>(null);

  const handleGoHome = () => {
    setActiveTab('home');
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToProductsSection = (catId: string | null = null) => {
    setActiveTab('home');
    setSelectedCategoryId(catId);
    setSelectedBrandId(null);
    setSearchQuery('');
    setTimeout(() => {
      if (productsSectionRef.current) {
        productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }, 60);
  };

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(20);
  }, [selectedCategoryId, selectedBrandId, searchQuery, activeTab]);

  // Modals state & Admin Security Authentication State
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Wholesale Privacy Lock State
  const [isWholesaleAuthenticated, setIsWholesaleAuthenticated] = useState<boolean>(() => {
    try {
      // Clear legacy localStorage key if present so fresh sessions always prompt
      localStorage.removeItem('wholesale_auth_v1');
      return sessionStorage.getItem('wholesale_auth_v1') === 'true';
    } catch {
      return false;
    }
  });

  const handleAuthenticateWholesale = (code: string): boolean => {
    const targetCode = siteSettings?.wholesalePasscode || '123456';
    if (code.trim() === targetCode.trim()) {
      try {
        sessionStorage.setItem('wholesale_auth_v1', 'true');
      } catch (err) {
        console.error(err);
      }
      setIsWholesaleAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLockWholesale = () => {
    try {
      sessionStorage.removeItem('wholesale_auth_v1');
      localStorage.removeItem('wholesale_auth_v1');
    } catch (err) {
      console.error(err);
    }
    setIsWholesaleAuthenticated(false);
  };

  const handleOpenAdminTrigger = () => {
    // ALWAYS require password prompt every single time admin button is clicked
    setShowAdminAuthModal(true);
  };

  useEffect(() => {
    const titleName = siteSettings?.companyName || 'Công ty TNHH Bảo Nam Tân Phú';
    document.title = `${titleName} - Máy & Phụ Tùng Nông Nghiệp`;
  }, [siteSettings]);

  useEffect(() => {
    loadCatalogData();
  }, []);

  const safeFetchJson = async (url: string, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        if (i === retries) break;
        await new Promise((r) => setTimeout(r, 600 * (i + 1)));
      }
    }
    return { success: false };
  };

  const loadCatalogData = async () => {
    try {
      const [resProds, resCats, resBrands, resBanners, resNews, resSettings] = await Promise.all([
        safeFetchJson('/api/products'),
        safeFetchJson('/api/categories'),
        safeFetchJson('/api/brands'),
        safeFetchJson('/api/banners'),
        safeFetchJson('/api/news'),
        safeFetchJson('/api/settings'),
      ]);

      if (resProds?.success) setProducts(resProds.data);
      if (resCats?.success) setCategories(resCats.data);
      if (resBrands?.success) setBrands(resBrands.data);
      if (resBanners?.success) setBanners(resBanners.data);
      if (resNews?.success) setNews(resNews.data);
      if (resSettings?.success && resSettings.data) setSiteSettings(resSettings.data);
    } catch (err) {
      console.warn('Network issue loading initial catalog data, retrying automatically:', err);
    }
  };

  const handleOpenQuote = (product?: Product) => {
    setQuoteProduct(product || null);
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async (quoteData: any) => {
    try {
      await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });
    } catch (err) {
      console.error('Failed to submit quote:', err);
    }
  };

  // Filter products based on search, category, brand
  const filteredProducts = products.filter((p) => {
    if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
    if (selectedBrandId && p.brandId !== selectedBrandId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchModel = p.model.toLowerCase().includes(q);
      const matchCat = p.categoryName?.toLowerCase().includes(q);
      const matchBrand = p.brandName?.toLowerCase().includes(q);
      if (!matchName && !matchModel && !matchCat && !matchBrand) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 antialiased flex flex-col justify-between">
      <div>
        {/* TOP CONTACT & WARRANTY BAR */}
        <TopBar
          onOpenAdmin={handleOpenAdminTrigger}
          siteSettings={siteSettings}
          isWholesaleAuthenticated={isWholesaleAuthenticated}
          onLockWholesale={handleLockWholesale}
        />

        {/* SCROLLING ANNOUNCEMENT MARQUEE BANNER */}
        <MarqueeBanner siteSettings={siteSettings} />

        {/* MAIN NAVIGATION BAR */}
        <MainNav
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectCategory={(catId) => handleScrollToProductsSection(catId)}
          onNavigateToProducts={() => handleScrollToProductsSection(null)}
          onRequestQuote={() => handleOpenQuote()}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          siteSettings={siteSettings}
        />

        {/* HOME & PRODUCTS MAIN VIEW CONTENT */}
        {(activeTab === 'home' || activeTab === 'products') && (
          <>
            {/* HERO BANNER - ALWAYS MOUNTED AT THE TOP */}
            <HeroBanner
              banners={banners}
              onViewProducts={() => handleScrollToProductsSection(null)}
              onDownloadCatalogue={() => handleScrollToProductsSection(null)}
              siteSettings={siteSettings}
            />

            {/* VIBRANT GREEN FIELD & BLUE SKY BACKGROUND WRAPPER */}
            <div className="relative text-slate-900 overflow-hidden pt-4 pb-12 transition-all">
              {/* Layer 1: High resolution bright green field under blue sky image */}
              <div
                className="absolute inset-0 bg-cover bg-fixed bg-center pointer-events-none"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&auto=format&fit=crop&q=80')`,
                }}
              />

              {/* Layer 2: Subtle fresh overlay gradient to maintain readability while keeping bright green & blue sky visual */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-emerald-50/70 to-emerald-100/85 backdrop-blur-[2px] pointer-events-none" />

              {/* Layer 3: Soft sun glare and cloud atmosphere glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-sky-200/30 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-emerald-400/20 rounded-full blur-[140px] pointer-events-none" />

              {/* CONTENT OVERLAY */}
              <div className="relative z-10 space-y-8">
                {/* CATEGORY BAR (8 CARDS) */}
                <CategoryBar
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={(catId) => handleScrollToProductsSection(catId)}
                />

                {/* FEATURED PRODUCTS SECTION */}
                <FeaturedProducts
                  products={products}
                  onSelectProduct={setSelectedProductDetail}
                  onRequestQuote={handleOpenQuote}
                  onViewAll={() => handleScrollToProductsSection(null)}
                />

                {/* CONNECTED USP BANNER (4 COLOR BLOCKS) */}
                <UspBanner />

                {/* ALL PRODUCTS CATALOG SECTION WITH CATEGORY BAR ON TOP */}
                <div
                  ref={productsSectionRef}
                  className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 scroll-mt-10 bg-white/95 rounded-2xl border border-slate-200 shadow-md backdrop-blur-xs"
                >
                  {/* HÀNG PHÂN LOẠI DANH MỤC PHÍA TRÊN */}
                  <div className="mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-2">
                      DANH MỤC PHÂN LOẠI SẢN PHẨM
                    </h3>
                    <CategoryBar
                      categories={categories}
                      selectedCategoryId={selectedCategoryId}
                      onSelectCategory={(catId) => setSelectedCategoryId(catId)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {selectedCategoryId
                          ? (categories || []).find((c) => c.id === selectedCategoryId)?.name || 'DANH MỤC SẢN PHẨM'
                          : searchQuery
                          ? `KẾT QUẢ TÌM KIẾM: "${searchQuery}"`
                          : 'TẤT CẢ SẢN PHẨM MÁY NÔNG CƠ'}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Hiển thị {filteredProducts.length} sản phẩm máy nông nghiệp chất lượng cao
                      </p>
                    </div>

                    {/* CATEGORY FILTER CHIPS */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      <button
                        onClick={() => setSelectedCategoryId(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          !selectedCategoryId ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Tất cả ({products.length})
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                            cat.id === selectedCategoryId ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {cat.name} ({cat.productCount})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PRODUCT GRID WITH BATCHED RENDERING FOR FAST PERFORMANCE */}
                  {filteredProducts.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {filteredProducts.slice(0, displayLimit).map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onSelect={setSelectedProductDetail}
                            onRequestQuote={handleOpenQuote}
                          />
                        ))}
                      </div>

                      {/* LOAD MORE BUTTON FOR LARGE CATALOGS */}
                      {filteredProducts.length > displayLimit && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => setDisplayLimit((prev) => prev + 20)}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-700/50"
                          >
                            XEM THÊM (CÒN {filteredProducts.length - displayLimit} SẢN PHẨM)
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200 p-8">
                      <div className="text-4xl">🚜</div>
                      <h3 className="font-bold text-base text-slate-900">Không tìm thấy sản phẩm phù hợp</h3>
                      <p className="text-xs text-slate-500">Vui lòng thử tìm kiếm từ khóa khác hoặc chọn danh mục sản phẩm khác.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategoryId(null);
                        }}
                        className="bg-emerald-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg"
                      >
                        XEM TẤT CẢ SẢN PHẨM
                      </button>
                    </div>
                  )}
                </div>

                {/* ABOUT & NEWS SECTION */}
                <AboutAndNews
                  news={news}
                  onViewAllNews={() => setActiveTab('news')}
                  onViewAbout={() => setActiveTab('about')}
                  siteSettings={siteSettings}
                />
              </div>
            </div>
          </>
        )}

        {/* BRANDS VIEW */}
        {activeTab === 'brands' && (
          <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-6">
            <h1 className="text-2xl font-black text-slate-900 uppercase">THƯƠNG HIỆU ĐỐI TÁC CHÍNH HÃNG</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((b) => (
                <div key={b.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="font-black text-xl text-emerald-800">{b.name}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{b.description}</p>
                  <div className="text-xs font-bold text-slate-400">Xuất xứ: {b.country}</div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* CATALOGUE VIEW */}
        {activeTab === 'catalogue' && (
          <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
              <h1 className="text-2xl font-black text-slate-900 uppercase">CATALOGUE SẢN PHẨM MÁY NÔNG CƠ 2026</h1>
              <p className="text-xs text-slate-600 max-w-xl mx-auto">
                Tải về bộ tài liệu Catalogue chi tiết đầy đủ hình ảnh, thông số kỹ thuật và hướng dẫn vận hành các dòng máy nông nghiệp.
              </p>
              <button
                onClick={() => setShowAdminPanel(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-xs uppercase px-6 py-3 rounded-lg shadow-md"
              >
                MỞ BỘ CÔNG CỤ IMPORT CATALOG POWERPOINT (.PPTX)
              </button>
            </div>
          </main>
        )}

        {/* NEWS VIEW */}
        {activeTab === 'news' && (
          <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-6">
            <h1 className="text-2xl font-black text-slate-900 uppercase">TIN TỨC & KỸ THUẬT NÔNG NGHIỆP</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src={item.imageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'} alt="" className="w-full h-44 object-cover" />
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold">{item.publishedAt}</span>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ABOUT VIEW */}
        {activeTab === 'about' && (
          <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 space-y-4">
              <h1 className="text-2xl font-black text-slate-900 uppercase">GIỚI THIỆU {siteSettings?.companyName || 'NÔNG CƠ MACHINERY'}</h1>
              <p className="text-xs text-slate-700 leading-relaxed">
                {siteSettings?.aboutText || `${siteSettings?.companyName || 'Nông Cơ Machinery'} là thương hiệu nhập khẩu và phân phối máy nông nghiệp, thiết bị cơ giới nông nghiệp hàng đầu tại Việt Nam. Chúng tôi cam kết mang tới cho bà con nông dân những giải pháp thiết bị hiện đại, bền bỉ, tiết kiệm nhiên liệu với chi phí tối ưu nhất.`}
              </p>
            </div>
          </main>
        )}

        {/* CONTACT VIEW */}
        {activeTab === 'contact' && (
          <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 space-y-4">
              <h1 className="text-2xl font-black text-slate-900 uppercase">THÔNG TIN LIÊN HỆ</h1>
              <div className="space-y-3 text-xs text-slate-700">
                <p><strong>Tên đơn vị:</strong> {siteSettings?.companyName || 'Nông Cơ Machinery'}</p>
                <p><strong>Hotline Bán Hàng:</strong> {siteSettings?.hotline || '0968 123 456'}</p>
                <p><strong>Hotline Kỹ Thuật:</strong> {siteSettings?.techSupportPhone || '0901 234 567'}</p>
                <p><strong>Email:</strong> {siteSettings?.email || 'contact@nongcomachinery.vn'}</p>
                <p><strong>Địa chỉ trụ sở:</strong> {siteSettings?.address || 'Hệ thống đại lý nông cơ toàn quốc'}</p>
                <p><strong>Giờ làm việc:</strong> {siteSettings?.workingHours || '8:00 - 18:00'}</p>
                <p><strong>Cam kết bảo hành:</strong> {siteSettings?.warrantyPolicy || 'Bảo hành chính hãng 12-24 tháng'}</p>
                {siteSettings?.bankAccountInfo && (
                  <p><strong>Tài khoản ngân hàng:</strong> {siteSettings.bankAccountInfo}</p>
                )}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* FOOTER */}
      <Footer siteSettings={siteSettings} />

      {/* RIGHT FLOATING WIDGETS */}
      <FloatingContact onRequestQuote={() => handleOpenQuote()} siteSettings={siteSettings} />

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProductDetail}
        siteSettings={siteSettings}
        onClose={() => setSelectedProductDetail(null)}
        onRequestQuote={handleOpenQuote}
      />

      {/* QUOTE REQUEST MODAL */}
      {showQuoteModal && (
        <QuoteModal
          product={quoteProduct}
          onClose={() => {
            setShowQuoteModal(false);
            setQuoteProduct(null);
          }}
          onSubmitQuote={handleSubmitQuote}
        />
      )}

      {/* ADMIN SECURITY LOGIN MODAL (lazy-loaded) */}
      <Suspense fallback={null}>
        {showAdminAuthModal && (
          <AdminLoginModal
            isOpen={showAdminAuthModal}
            onClose={() => setShowAdminAuthModal(false)}
            onSuccess={() => {
              setIsAdminAuthenticated(true);
              setShowAdminAuthModal(false);
              setShowAdminPanel(true);
            }}
            correctPassword={siteSettings?.adminPassword || 'admin123'}
          />
        )}
      </Suspense>

      {/* ADMIN CMS & POWERPOINT IMPORT PANEL (lazy-loaded) */}
      <Suspense fallback={null}>
        {showAdminPanel && (
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            onRefreshData={loadCatalogData}
          />
        )}
      </Suspense>

      {/* WHOLESALE B2B PRIVACY ACCESS LOCK OVERLAY */}
      {(siteSettings?.isWholesaleLockEnabled !== false) && !isWholesaleAuthenticated && (
        <WholesaleLockOverlay
          siteSettings={siteSettings || {
            companyName: 'Công ty TNHH Bảo Nam Tân Phú',
            wholesaleNoticeText: 'Trang web dành riêng cho Đại Lý & Khách Hàng Sỉ. Vui lòng nhập Mã Truy Cập để xem Báo Giá & Danh Mục Sản Phẩm.',
            hotline: '0968 123 456',
            zaloPhone: '0968123456',
            wholesalePasscode: '123456',
            isWholesaleLockEnabled: true
          }}
          onAuthenticate={handleAuthenticateWholesale}
        />
      )}
    </div>
  );
}

export default App;
