import React from 'react';
import { Phone, Headset, Mail, MapPin, ShieldCheck, Globe, Shield } from 'lucide-react';
import { SiteSettings } from '../../types/index.js';

interface TopBarProps {
  onOpenAdmin: () => void;
  siteSettings?: SiteSettings;
  isWholesaleAuthenticated?: boolean;
  onLockWholesale?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAdmin,
  siteSettings,
  isWholesaleAuthenticated,
  onLockWholesale,
}) => {
  const hotline = siteSettings?.hotline || '0968 123 456';
  const techSupportPhone = siteSettings?.techSupportPhone || '0901 234 567';
  const email = siteSettings?.email || 'contact@nongcomachinery.vn';

  return (
    <div className="bg-slate-100 border-b border-slate-200 text-xs text-slate-700 py-1.5">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-wrap items-center justify-between gap-2">
        {/* Left contacts */}
        <div className="flex items-center flex-wrap gap-4 md:gap-6">
          <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-red-600 transition-colors font-medium">
            <Phone className="w-3.5 h-3.5 text-red-600" />
            <span>Hotline: <strong className="text-slate-900 font-semibold">{hotline}</strong></span>
          </a>
          <a href={`tel:${techSupportPhone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-green-700 transition-colors">
            <Headset className="w-3.5 h-3.5 text-green-700" />
            <span>Tư vấn kỹ thuật: <strong className="text-slate-900">{techSupportPhone}</strong></span>
          </a>
          <a href={`mailto:${email}`} className="hidden lg:flex items-center gap-1.5 hover:text-green-700 transition-colors">
            <Mail className="w-3.5 h-3.5 text-red-500" />
            <span>Email: {email}</span>
          </a>
        </div>

        {/* Right options & Admin trigger */}
        <div className="flex items-center gap-4 md:gap-6 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5 hover:text-green-700 cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-green-700" />
            <span>Hệ thống đại lý</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 hover:text-green-700 cursor-pointer">
            <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
            <span>Bảo hành chính hãng</span>
          </div>
          {/* Wholesale Authenticated Badge & Lock Button */}
          {isWholesaleAuthenticated && onLockWholesale && (
            <div className="flex items-center gap-1.5 bg-emerald-800 text-white px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs">
              <span>🔒 Đã xác thực Khách Sỉ</span>
              <button
                onClick={onLockWholesale}
                title="Khóa lại trang web (Đăng xuất)"
                className="bg-emerald-950 hover:bg-black text-amber-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition-colors cursor-pointer ml-1"
              >
                Khóa trang
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 cursor-pointer font-medium">
            <span className="text-sm">🇻🇳</span>
            <span>Tiếng Việt</span>
            <span className="text-[10px]">▼</span>
          </div>

          {/* Discrete System Management Trigger Icon */}
          <button
            onClick={onOpenAdmin}
            title="Hệ thống quản lý"
            className="flex items-center justify-center p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-all shadow-xs cursor-pointer ml-1"
          >
            <Shield className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
