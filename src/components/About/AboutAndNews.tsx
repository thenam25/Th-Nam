import React, { useState } from 'react';
import { ArrowRight, Send, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { NewsArticle, SiteSettings } from '../../types/index.js';

interface AboutAndNewsProps {
  news: NewsArticle[];
  onViewAllNews: () => void;
  onViewAbout: () => void;
  siteSettings?: SiteSettings;
}

export const AboutAndNews: React.FC<AboutAndNewsProps> = ({ news, onViewAllNews, onViewAbout, siteSettings }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 border-t border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: VỀ NÔNG CƠ MACHINERY (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <div>
            <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
              VỀ {siteSettings?.companyName || 'NÔNG CƠ MACHINERY'}
            </h3>
            <div className="w-10 h-1 bg-emerald-700 rounded-full mt-2" />
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {siteSettings?.aboutText || 'Với hơn 10 năm kinh nghiệm trong lĩnh vực phân phối máy nông nghiệp, chúng tôi tự hào là đối tác tin cậy của hàng ngàn khách hàng trên toàn quốc.'}
          </p>

          {/* STATISTICS GRID matching reference image */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 pt-2">
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
              <div className="font-black text-lg text-emerald-800">10+</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Năm kinh nghiệm</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
              <div className="font-black text-lg text-emerald-800">1000+</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Sản phẩm</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
              <div className="font-black text-lg text-emerald-800">50+</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Đại lý toàn quốc</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
              <div className="font-black text-lg text-emerald-800">98%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Khách hàng hài lòng</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onViewAbout}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-md transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <span>TÌM HIỂU THÊM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* COLUMN 2: TIN TỨC MỚI NHẤT (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                TIN TỨC MỚI NHẤT
              </h3>
              <div className="w-10 h-1 bg-red-600 rounded-full mt-2" />
            </div>

            <button
              onClick={onViewAllNews}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 uppercase tracking-wide flex items-center gap-1"
            >
              <span>XEM TẤT CẢ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={onViewAllNews}
                className="group flex items-start gap-3.5 p-2.5 rounded-lg border border-slate-200/80 hover:border-emerald-600 hover:bg-slate-50 transition-all cursor-pointer bg-white shadow-2xs"
              >
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-md overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* News Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {item.publishedAt}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug mt-0.5">
                    {item.title}
                  </h4>
                  <div className="text-[11px] font-semibold text-emerald-800 group-hover:underline flex items-center gap-1 mt-1">
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: ĐĂNG KÝ NHẬN TIN (3 Cols) */}
        <div className="lg:col-span-3 space-y-4 bg-slate-100 p-6 rounded-xl border border-slate-200/80">
          <div>
            <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
              ĐĂNG KÝ NHẬN TIN
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              Nhận thông tin sản phẩm mới, khuyến mãi và tin tức nông nghiệp hữu ích.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="w-full pl-3 pr-10 py-2.5 bg-white text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-md flex items-center justify-center transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {subscribed && (
              <p className="text-[11px] font-bold text-emerald-800">
                ✓ Đăng ký nhận tin thành công!
              </p>
            )}
          </form>

          {/* Social Icons */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Theo dõi chúng tôi</p>
            <div className="flex items-center gap-2">
              <a href="#" className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:opacity-90">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-90">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
