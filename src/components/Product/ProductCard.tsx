import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.js';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onRequestQuote }) => {
  const primaryImg = (product?.images || []).find((img) => img.isPrimary && img.url)?.url || (product?.images || []).find((img) => img.url)?.url || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=600&auto=format&fit=crop&q=80';

  const formatVND = (price: number | null) => {
    if (price === null || price === undefined || price === 0) {
      return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* BADGE TAG */}
      {product.isHot && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded shadow-sm tracking-wider">
          HOT
        </div>
      )}
      {!product.isHot && product.isNew && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-yellow-400 text-slate-900 font-black text-[10px] uppercase px-2 py-0.5 rounded shadow-sm tracking-wider">
          MỚI
        </div>
      )}

      {/* PRODUCT IMAGE CONTAINER */}
      <div className="relative w-full h-44 sm:h-48 p-4 bg-slate-50/50 flex items-center justify-center overflow-hidden">
        <img
          src={primaryImg}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
        />
      </div>

      {/* PRODUCT INFO */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 border-t border-slate-100">
        <div>
          {/* Brand Tag */}
          {product.brandName && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              {product.brandName}
            </span>
          )}

          {/* Product Name */}
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Model */}
          <p className="text-xs text-slate-500 font-medium mt-1">
            Model: <span className="font-bold text-slate-800">{product.model}</span>
          </p>
        </div>

        {/* PRICE & ACTION BUTTON */}
        <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between gap-2">
          <div>
            <div className="text-red-600 font-black text-sm sm:text-base tracking-tight">
              {formatVND(product.price)}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestQuote(product);
            }}
            title="Yêu cầu báo giá"
            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white border border-emerald-200 flex items-center justify-center transition-all shadow-2xs"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Hover View Detail */}
        <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-800 group-hover:text-emerald-900 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Xem chi tiết</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
