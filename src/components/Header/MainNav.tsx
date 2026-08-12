import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ChevronDown, FileText, ShoppingCart } from 'lucide-react';
import { Category, SiteSettings } from '../../types/index.js';

interface MainNavProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (catId: string | null) => void;
  onNavigateToProducts?: () => void;
  onRequestQuote: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  siteSettings?: SiteSettings;
}

export const MainNav: React.FC<MainNavProps> = ({
  categories,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onNavigateToProducts,
  onRequestQuote,
  activeTab,
  setActiveTab,
  siteSettings,
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!showCategoryMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryMenu]);

  const companyName = siteSettings?.companyName || 'NÔNG CƠ MACHINERY';
  const slogan = siteSettings?.slogan || 'Uy tín tạo nên thương hiệu';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          {/* LOGO */}
          <div
            onClick={() => {
              setActiveTab('home');
              onSelectCategory(null);
              onSearchChange('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            {siteSettings?.logoUrl && siteSettings.logoUrl.trim() !== '' ? (
              <img src={siteSettings.logoUrl} alt={companyName} className="w-11 h-11 object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform" />
            ) : (
              /* Logo Icon: Green cogwheel */
              <div className="w-11 h-11 rounded-full bg-emerald-700 p-1 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full border-2 border-dashed border-yellow-400 rounded-full flex items-center justify-center bg-emerald-800">
                  <span className="text-xl font-black text-yellow-400">⚙️</span>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1 font-black text-xl lg:text-2xl tracking-tight leading-none">
                <span className="text-emerald-800 uppercase">{companyName}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">{slogan}</p>
            </div>
          </div>

          {/* DANH MỤC SẢN PHẨM YELLOW BUTTON */}
          <div className="relative hidden xl:block" ref={categoryMenuRef}>
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs uppercase px-4 py-2.5 rounded-md transition-all shadow-xs"
            >
              <Menu className="w-4 h-4 text-slate-900" />
              <span>DANH MỤC SẢN PHẨM</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showCategoryMenu && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                <div
                  onClick={() => {
                    onSelectCategory(null);
                    setActiveTab('products');
                    if (onNavigateToProducts) onNavigateToProducts();
                    setShowCategoryMenu(false);
                  }}
                  className="px-4 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <span>TẤT CẢ SẢN PHẨM</span>
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setActiveTab('products');
                      if (onNavigateToProducts) onNavigateToProducts();
                      setShowCategoryMenu(false);
                    }}
                    className="px-4 py-2.5 hover:bg-emerald-50 text-xs font-medium text-slate-700 hover:text-emerald-800 cursor-pointer flex items-center justify-between transition-colors border-t border-slate-100"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                      {cat.productCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NAV LINKS (Desktop) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 font-bold text-xs uppercase text-slate-800">
            <button
              onClick={() => {
                setActiveTab('home');
                onSelectCategory(null);
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-emerald-700 transition-colors py-1 ${activeTab === 'home' ? 'text-emerald-700 border-b-2 border-emerald-600' : ''}`}
            >
              TRANG CHỦ
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                onSelectCategory(null);
                if (onNavigateToProducts) onNavigateToProducts();
              }}
              className={`flex items-center gap-1 hover:text-emerald-700 transition-colors py-1 ${activeTab === 'products' ? 'text-emerald-700 border-b-2 border-emerald-600' : ''}`}
            >
              <span>SẢN PHẨM</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`hover:text-emerald-700 transition-colors py-1 ${activeTab === 'brands' ? 'text-emerald-700 border-b-2 border-emerald-600' : ''}`}
            >
              THƯƠNG HIỆU
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                onSelectCategory(null);
                if (onNavigateToProducts) onNavigateToProducts();
              }}
              className={`hover:text-emerald-700 transition-colors py-1 ${activeTab === 'products' ? 'text-emerald-700 border-b-2 border-emerald-600' : ''}`}
            >
              CATALOGUE
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`hover:text-emerald-700 transition-colors py-1 ${activeTab === 'news' ? 'text-emerald-700 border-b-2 border-emerald-600' : ''}`}
            >
              TIN TỨC
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`hover:text-emerald-700 transition-colors py-1 ${activeTab === 'about' ? 'text-emerald-700 border-b-2 border-emerald-600' : ''}`}
            >
              GIỚI THIỆU
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`hover:text-emerald-700 transition-colors py-1 ${activeTab === 'contact' ? 'text-emerald-700 border-b-2 border-emerald-600' : ''}`}
            >
              LIÊN HỆ
            </button>
          </nav>

          {/* SEARCH BAR */}
          <div className="flex-1 max-w-xs lg:max-w-md hidden sm:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-4 pr-9 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-emerald-700 text-white rounded-full flex items-center justify-center hover:bg-emerald-800 transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RED CTA BUTTON: YÊU CẦU BÁO GIÁ */}
          <button
            onClick={onRequestQuote}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-3.5 py-2.5 rounded-md transition-all shadow-md shrink-0 active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">YÊU CẦU BÁO GIÁ</span>
            <span className="sm:hidden">BÁO GIÁ</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-slate-700 hover:text-emerald-800"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-3 py-2 bg-slate-100 text-xs rounded-md border border-slate-300"
              />
            </div>
            <button
              onClick={() => {
                setActiveTab('home');
                setShowMobileMenu(false);
              }}
              className="text-left font-bold text-xs py-2 px-3 hover:bg-slate-100 rounded"
            >
              TRANG CHỦ
            </button>
            <button
              onClick={() => {
                setActiveTab('products');
                onSelectCategory(null);
                if (onNavigateToProducts) onNavigateToProducts();
                setShowMobileMenu(false);
              }}
              className="text-left font-bold text-xs py-2 px-3 hover:bg-slate-100 rounded"
            >
              SẢN PHẨM
            </button>
            <button
              onClick={() => {
                setActiveTab('brands');
                setShowMobileMenu(false);
              }}
              className="text-left font-bold text-xs py-2 px-3 hover:bg-slate-100 rounded"
            >
              THƯƠNG HIỆU
            </button>
            <button
              onClick={() => {
                setActiveTab('products');
                onSelectCategory(null);
                if (onNavigateToProducts) onNavigateToProducts();
                setShowMobileMenu(false);
              }}
              className="text-left font-bold text-xs py-2 px-3 hover:bg-slate-100 rounded"
            >
              CATALOGUE
            </button>
            <button
              onClick={() => {
                setActiveTab('news');
                setShowMobileMenu(false);
              }}
              className="text-left font-bold text-xs py-2 px-3 hover:bg-slate-100 rounded"
            >
              TIN TỨC
            </button>
            <button
              onClick={() => {
                setActiveTab('about');
                setShowMobileMenu(false);
              }}
              className="text-left font-bold text-xs py-2 px-3 hover:bg-slate-100 rounded"
            >
              GIỚI THIỆU
            </button>
            <button
              onClick={() => {
                setActiveTab('contact');
                setShowMobileMenu(false);
              }}
              className="text-left font-bold text-xs py-2 px-3 hover:bg-slate-100 rounded"
            >
              LIÊN HỆ
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
