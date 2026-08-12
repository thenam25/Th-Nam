import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { BannerSlide, SiteSettings } from '../../types/index.js';

interface HeroBannerProps {
  banners: BannerSlide[];
  onViewProducts?: () => void;
  onDownloadCatalogue?: () => void;
  siteSettings?: SiteSettings;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onViewProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];
  const slideImageUrl = currentBanner?.bgImageUrl || currentBanner?.machineImageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80';

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full bg-slate-950 overflow-hidden select-none group">
      {/* FULL-WIDTH EDGE-TO-EDGE BANNER CONTAINER (NO HEAVY BLUR FILTERS FOR MAX PERFORMANCE) */}
      <div 
        onClick={onViewProducts}
        className="relative z-10 w-full overflow-hidden cursor-pointer group/slide"
      >
        <img
          src={slideImageUrl}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-auto block transition-all duration-300"
          decoding="async"
          loading="eager"
          referrerPolicy="no-referrer"
        />

        {/* OVERLAY BUTTON "XEM SẢN PHẨM" */}
        {onViewProducts && (
          <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProducts();
              }}
              className="group/btn flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm uppercase tracking-wide px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xl border border-emerald-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-200 group-hover/btn:rotate-12 transition-transform" />
              <span>XEM SẢN PHẨM</span>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* CAROUSEL NAVIGATION ARROWS */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs border border-white/10"
            title="Slide trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs border border-white/10"
            title="Slide kế tiếp"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* CAROUSEL INDICATOR DOTS */}
          <div className="absolute bottom-3 right-4 sm:right-8 z-30 flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};


