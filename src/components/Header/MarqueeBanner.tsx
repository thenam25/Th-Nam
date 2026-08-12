import React from 'react';
import { SiteSettings } from '../../types/index.js';

interface MarqueeBannerProps {
  siteSettings?: SiteSettings;
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ siteSettings }) => {
  // If explicitly disabled in settings
  if (siteSettings?.isMarqueeEnabled === false) {
    return null;
  }

  const defaultText =
    '🔥 THÔNG BÁO BÁO GIÁ SỈ: Hỗ trợ trả góp 0% lãi suất khi mua máy gặt đập & máy xới Kubota - Yanmar! 🚜 Bảo hành chính hãng 24 tháng - Giao hàng & lắp đặt tận nơi toàn quốc! 📞 Hotline đặt hàng nhanh: ' +
    (siteSettings?.hotline || '0968 123 456') +
    ' 🌟 Cam kết phụ tùng thay thế 100% chính hãng.';

  const marqueeText = siteSettings?.marqueeText?.trim() || defaultText;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-emerald-950 border-b border-amber-600/30 shadow-xs relative overflow-hidden z-20">
      <div className="max-w-[1536px] mx-auto flex items-center h-8 px-2 sm:px-4">
        {/* Marquee viewport */}
        <div className="overflow-hidden relative w-full flex items-center h-full">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-amber-400 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-amber-400 to-transparent z-10 pointer-events-none" />

          {/* Continuous scrolling text line */}
          <div className="animate-marquee whitespace-nowrap text-xs font-black tracking-wide flex items-center">
            <span className="inline-block pr-12">{marqueeText}</span>
            <span className="inline-block pr-12">{marqueeText}</span>
            <span className="inline-block pr-12">{marqueeText}</span>
            <span className="inline-block pr-12">{marqueeText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
