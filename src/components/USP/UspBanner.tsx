import React from 'react';
import { ShieldCheck, Tag, Truck, Wrench } from 'lucide-react';

export const UspBanner: React.FC = () => {
  return (
    <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl overflow-hidden shadow-lg border border-slate-200">
        
        {/* BLOCK 1: CHÍNH HÃNG 100% (Dark Green) */}
        <div className="bg-emerald-800 text-white p-5 flex items-center gap-4 transition-all hover:bg-emerald-900">
          <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-600/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-yellow-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-yellow-300">
              CHÍNH HÃNG 100%
            </h4>
            <p className="text-xs text-emerald-100 font-medium mt-0.5 leading-snug">
              Cam kết sản phẩm chính hãng, đầy đủ CO, CQ
            </p>
          </div>
        </div>

        {/* BLOCK 2: GIÁ TỐT NHẤT (Vibrant Red) */}
        <div className="bg-red-600 text-white p-5 flex items-center gap-4 transition-all hover:bg-red-700">
          <div className="w-12 h-12 rounded-full bg-red-700/60 border border-red-400/50 flex items-center justify-center shrink-0">
            <Tag className="w-7 h-7 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-white">
              GIÁ TỐT NHẤT
            </h4>
            <p className="text-xs text-red-100 font-medium mt-0.5 leading-snug">
              Giá cạnh tranh nhất thị trường, nhiều ưu đãi hấp dẫn
            </p>
          </div>
        </div>

        {/* BLOCK 3: GIAO HÀNG TOÀN QUỐC (Gold Yellow) */}
        <div className="bg-yellow-400 text-slate-900 p-5 flex items-center gap-4 transition-all hover:bg-yellow-500">
          <div className="w-12 h-12 rounded-full bg-yellow-500/60 border border-yellow-600/50 flex items-center justify-center shrink-0">
            <Truck className="w-7 h-7 text-slate-900" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
              GIAO HÀNG TOÀN QUỐC
            </h4>
            <p className="text-xs text-slate-800 font-medium mt-0.5 leading-snug">
              Giao hàng nhanh chóng, an toàn, đúng hẹn
            </p>
          </div>
        </div>

        {/* BLOCK 4: BẢO HÀNH UY TÍN (Forest Green) */}
        <div className="bg-emerald-900 text-white p-5 flex items-center gap-4 transition-all hover:bg-slate-900">
          <div className="w-12 h-12 rounded-full bg-emerald-800/60 border border-emerald-600/50 flex items-center justify-center shrink-0">
            <Wrench className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-emerald-300">
              BẢO HÀNH UY TÍN
            </h4>
            <p className="text-xs text-emerald-100 font-medium mt-0.5 leading-snug">
              Bảo hành chính hãng, hỗ trợ kỹ thuật tận tâm 24/7
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
