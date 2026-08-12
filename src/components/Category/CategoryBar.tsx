import React, { useState, useMemo } from 'react';
import { Category } from '../../types/index.js';
import { ChevronDown, ChevronUp, Tractor, Droplets, Zap, Sparkles, Wrench, Package, Layers } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

interface GroupedCategory {
  primaryId: string;
  allIds: string[];
  name: string;
  imageUrl?: string;
  productCount: number;
}

const CategoryCardImage: React.FC<{ imageUrl?: string; name: string }> = ({ imageUrl, name }) => {
  const [imgError, setImgError] = useState(false);

  const getFallbackIcon = () => {
    const norm = (name || '').toLowerCase();
    if (norm.includes('cày') || norm.includes('xới') || norm.includes('gặt') || norm.includes('kéo') || norm.includes('nông cơ')) {
      return <Tractor className="w-8 h-8 text-emerald-700" />;
    }
    if (norm.includes('bơm')) {
      return <Droplets className="w-8 h-8 text-blue-600" />;
    }
    if (norm.includes('phát điện') || norm.includes('điện')) {
      return <Zap className="w-8 h-8 text-amber-500" />;
    }
    if (norm.includes('cắt cỏ') || norm.includes('cỏ')) {
      return <Sparkles className="w-8 h-8 text-lime-600" />;
    }
    if (norm.includes('phụ tùng') || norm.includes('phụ kiện') || norm.includes('sửa')) {
      return <Wrench className="w-8 h-8 text-slate-700" />;
    }
    return <Package className="w-8 h-8 text-emerald-800" />;
  };

  if (!imageUrl || imgError || imageUrl.trim() === '') {
    return (
      <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center p-2">
        {getFallbackIcon()}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className="w-full h-full object-contain"
    />
  );
};

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, selectedCategoryId, onSelectCategory }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group & Deduplicate Categories by Name
  const groupedCategories = useMemo(() => {
    const map = new Map<string, GroupedCategory>();

    categories.forEach((cat) => {
      const normName = (cat.name || 'MÁY NÔNG CƠ').trim().toUpperCase();
      if (!map.has(normName)) {
        map.set(normName, {
          primaryId: cat.id,
          allIds: [cat.id],
          name: normName,
          imageUrl: cat.imageUrl,
          productCount: cat.productCount || 0,
        });
      } else {
        const existing = map.get(normName)!;
        existing.allIds.push(cat.id);
        existing.productCount += cat.productCount || 0;
        if (!existing.imageUrl && cat.imageUrl) {
          existing.imageUrl = cat.imageUrl;
        }
      }
    });

    return Array.from(map.values());
  }, [categories]);

  const visibleCategories = isExpanded ? groupedCategories : groupedCategories.slice(0, 8);
  const hasMore = groupedCategories.length > 8;

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 sm:pt-6 relative z-30 mb-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 sm:p-5 transition-all">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-xs sm:text-sm uppercase tracking-tight text-slate-900">
                DANH MỤC SẢN PHẨM MÁY NÔNG CƠ
              </h2>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Tất cả các dòng máy móc & phụ tùng chất lượng cao ({groupedCategories.length} nhóm danh mục)
              </p>
            </div>
          </div>

          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 shadow-2xs active:scale-95 cursor-pointer"
            >
              <span>{isExpanded ? 'Thu gọn danh mục' : `Xem tất cả (${groupedCategories.length}) danh mục`}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* CATEGORY GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {visibleCategories.map((cat) => {
            const isSelected = cat.allIds.includes(selectedCategoryId || '');

            return (
              <div
                key={cat.primaryId}
                onClick={() => onSelectCategory(isSelected ? null : cat.primaryId)}
                className={`group flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/90 shadow-md ring-2 ring-emerald-600/30'
                    : 'border-slate-200/80 hover:border-emerald-600 hover:shadow-md bg-white'
                }`}
              >
                {/* Product Photo or Fallback Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 mb-2 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-2xs">
                  <CategoryCardImage imageUrl={cat.imageUrl} name={cat.name} />
                </div>

                {/* Name */}
                <h3 className="font-black text-[11px] sm:text-xs uppercase text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-tight">
                  {cat.name}
                </h3>

                {/* Product count badge */}
                {cat.productCount > 0 && (
                  <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                    ({cat.productCount} SP)
                  </span>
                )}

                {/* Accent Line */}
                <div
                  className={`w-6 h-0.5 mt-1.5 rounded-full transition-all ${
                    isSelected ? 'bg-red-600 w-10' : 'bg-slate-200 group-hover:bg-emerald-600 group-hover:w-8'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* FOOTER TOGGLE WHEN MANY CATEGORIES */}
        {hasMore && !isExpanded && (
          <div className="mt-3 pt-2 text-center border-t border-dashed border-slate-200">
            <button
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-1.5 rounded-full transition-all cursor-pointer border border-emerald-200/80"
            >
              <span>Xem thêm {groupedCategories.length - 8} danh mục khác</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
