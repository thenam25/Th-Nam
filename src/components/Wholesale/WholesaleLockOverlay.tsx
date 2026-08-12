import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, Phone, CheckCircle, AlertCircle, Eye, EyeOff, Tractor } from 'lucide-react';
import { SiteSettings } from '../../types/index.js';

interface WholesaleLockOverlayProps {
  siteSettings: Partial<SiteSettings>;
  onAuthenticate: (passcode: string) => boolean;
}

export const WholesaleLockOverlay: React.FC<WholesaleLockOverlayProps> = ({ siteSettings, onAuthenticate }) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const hotline = siteSettings.hotline || '0968 123 456';
  const zalo = siteSettings.zaloPhone || hotline;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!inputCode.trim()) {
      setErrorMsg('Vui lòng nhập Mã Khách Sỉ để tiếp tục');
      return;
    }

    const success = onAuthenticate(inputCode.trim());
    if (!success) {
      setErrorMsg('Mã Khách Sỉ không đúng. Vui lòng kiểm tra lại hoặc liên hệ Hotline/Zalo.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* BRAND TOP BANNER */}
        <div className="bg-emerald-900 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-800/50 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-2">
            {siteSettings.logoUrl ? (
              <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-md border border-emerald-700/50">
                <img src={siteSettings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 border border-emerald-700/60 flex items-center justify-center shadow-inner">
                <Tractor className="w-8 h-8 text-amber-400" />
              </div>
            )}

            <h1 className="font-black text-lg sm:text-xl uppercase tracking-wider text-amber-300">
              {siteSettings.companyName || 'NÔNG CƠ MACHINERY'}
            </h1>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60 text-[11px] font-bold text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>CỔNG BẢO MẬT KHÁCH HÀNG SỈ & ĐẠI LÝ</span>
            </div>
          </div>
        </div>

        {/* LOCK FORM CONTENT */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Yêu cầu Mã Truy Cập Bán Sỉ</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              {siteSettings.wholesaleNoticeText || 'Trang web dành riêng cho Đại Lý & Khách Hàng Sỉ. Vui lòng nhập Mã Truy Cập để xem Báo Giá & Danh Mục Sản Phẩm.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nhập Mã Khách Sỉ (PIN / Mật khẩu):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Nhập mã truy cập..."
                  autoFocus
                  className="w-full pl-9 pr-10 py-3 text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-emerald-700/50"
            >
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>XÁC NHẬN MÃ TRUY CẬP</span>
            </button>
          </form>

          {/* HELP & HOTLINE */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Chưa có mã hoặc quên mã truy cập sỉ?
            </p>
            <a
              href={`https://zalo.me/${zalo.replace(/\s+/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors border border-emerald-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Liên hệ Zalo / Hotline lấy mã: {hotline}</span>
            </a>
          </div>

        </div>

        {/* FOOTER COPYRIGHT */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 text-center text-[10px] text-slate-400 font-medium">
          Dành riêng cho Khách Hàng Sỉ & Đại Lý Ủy Quyền
        </div>

      </div>
    </div>
  );
};
