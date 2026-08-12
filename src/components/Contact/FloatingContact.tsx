import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Headset, ArrowUp } from 'lucide-react';
import { SiteSettings } from '../../types/index.js';

interface FloatingContactProps {
  onRequestQuote: () => void;
  siteSettings?: SiteSettings;
}

export const FloatingContact: React.FC<FloatingContactProps> = ({ onRequestQuote, siteSettings }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const phone = siteSettings?.hotline ? siteSettings.hotline.replace(/\s+/g, '') : '0968123456';
  const zalo = siteSettings?.zaloPhone ? siteSettings.zaloPhone.replace(/\s+/g, '') : '0968123456';

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* FLOATING CONTACT BUTTONS (Right edge) matching reference image */}
      <div className="fixed right-3 bottom-24 z-40 flex flex-col gap-2.5 select-none">
        {/* GREEN: GỌI NGAY */}
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 group active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0">
            <Phone className="w-3 h-3 animate-pulse" />
          </div>
          <span className="hidden sm:inline">Gọi ngay</span>
        </a>

        {/* RED: CHAT ZALO */}
        <a
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 group active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-white text-red-600 flex items-center justify-center shrink-0 font-black text-[10px]">
            Z
          </div>
          <span className="hidden sm:inline">Chat Zalo</span>
        </a>

        {/* YELLOW: TƯ VẤN 24/7 */}
        <button
          onClick={onRequestQuote}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs px-3.5 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 group active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-slate-900 text-yellow-400 flex items-center justify-center shrink-0">
            <Headset className="w-3 h-3" />
          </div>
          <span className="hidden sm:inline">Tư vấn 24/7</span>
        </button>
      </div>

      {/* BACK TO TOP BUTTON (Red Circle Bottom Right) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Về đầu trang"
          className="fixed right-4 bottom-6 z-40 w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-90"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};
