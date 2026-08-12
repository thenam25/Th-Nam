import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.js';
import { ProductCard } from './ProductCard.js';

interface FeaturedProductsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
  onViewAll: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onSelectProduct,
  onRequestQuote,
  onViewAll,
}) => {
  return (
    <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: TITLE BLOCK matching reference image */}
        <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between items-start space-y-6 shadow-2xs">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
              SẢN PHẨM
            </h2>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight leading-none uppercase mt-1">
              NỔI BẬT
            </h2>
            <div className="w-12 h-1 bg-red-600 rounded-full mt-3" />
            <p className="text-xs text-slate-600 font-medium mt-3 leading-relaxed">
              Các dòng máy nông nghiệp bán chạy nhất, được khẳng định chất lượng bởi hàng ngàn bà con nông dân toàn quốc.
            </p>
          </div>

          <div className="w-full space-y-4">
            <button
              onClick={onViewAll}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-4 py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <span>XEM TẤT CẢ</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Navigation arrows */}
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-emerald-700 hover:text-white flex items-center justify-center text-slate-700 transition-colors shadow-2xs">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-emerald-700 hover:text-white flex items-center justify-center text-slate-700 transition-colors shadow-2xs">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT CARDS GRID */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {products.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onRequestQuote={onRequestQuote}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
