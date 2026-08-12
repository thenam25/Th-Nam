import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Clock, FileText } from 'lucide-react';
import { SiteSettings } from '../../types/index.js';

interface FooterProps {
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings }) => {
  const companyName = siteSettings?.companyName || 'NÔNG CƠ MACHINERY';
  const hotline = siteSettings?.hotline || '0968 123 456';
  const techSupportPhone = siteSettings?.techSupportPhone || '0901 234 567';
  const email = siteSettings?.email || 'contact@nongcomachinery.vn';
  const address = siteSettings?.address || 'KCN Phố Nối A, Huyện Văn Lâm, Tỉnh Hưng Yên';
  const workingHours = siteSettings?.workingHours || 'Thứ 2 - Thứ 7 (7:30 - 17:30)';
  const warrantyPolicy = siteSettings?.warrantyPolicy || 'Bảo hành chính hãng 12-24 tháng';

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t-4 border-emerald-700">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* COL 1: COMPANY INFO (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-yellow-400 font-bold text-xl shadow-md">
                ⚙️
              </div>
              <div>
                <span className="font-black text-xl text-emerald-500 tracking-tight uppercase">{companyName}</span>
              </div>
            </div>

            <p className="text-slate-400 font-medium leading-relaxed">
              {siteSettings?.aboutText || 'Chuyên nhập khẩu, lắp ráp và phân phối chính hãng các dòng máy cày, máy xới đất, máy gặt đập, máy bơm nước, máy phát điện và phụ tùng nông cơ hàng đầu.'}
            </p>

            <div className="space-y-2 pt-1 text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Trụ sở chính: {address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Hotline kinh doanh: <strong className="text-white">{hotline}</strong> - <strong className="text-white">{techSupportPhone}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Email: {email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Thời gian làm việc: {workingHours}</span>
              </div>
            </div>
          </div>

          {/* COL 2: SẢN PHẨM & DANH MỤC (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-sm uppercase text-white tracking-wide border-b border-slate-800 pb-2">
              DANH MỤC SẢN PHẨM
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Máy Cày & Máy Kéo Nông Nghiệp</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Máy Xới Đất & Phay Đất</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Máy Gặt Đập Liên Hợp</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Máy Bơm Nước Đầu Xăng / Diesel</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Máy Phát Điện Công Nghiệp</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Máy Cắt Cỏ & Thiết Bị Làm Vườn</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Phụ Tùng & Phụ Kiện Nông Cơ</li>
            </ul>
          </div>

          {/* COL 3: CHÍNH SÁCH & HỖ TRỢ (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-extrabold text-sm uppercase text-white tracking-wide border-b border-slate-800 pb-2">
              HỖ TRỢ & BẢO HÀNH
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li className="hover:text-yellow-400 cursor-pointer transition-colors flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Chính sách bảo hành chính hãng 12-24 tháng</span>
              </li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <span>Quy trình yêu cầu báo giá & hợp đồng thương mại</span>
              </li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Hướng dẫn thanh toán & Vận chuyển toàn quốc</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Dịch vụ bảo dưỡng & Sửa chữa tận nơi</li>
              <li className="hover:text-yellow-400 cursor-pointer transition-colors">Đăng ký trở thành Đại lý ủy quyền</li>
            </ul>

            <div className="pt-2">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <p className="font-bold text-white text-[11px] uppercase mb-1">Tư vấn kỹ thuật trực tiếp</p>
                <p className="text-emerald-400 font-black text-sm">{techSupportPhone} (Kỹ sư hỗ trợ 24/7)</p>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>{siteSettings?.footerCopyright || `© 2026 ${companyName}. Tất cả quyền được bảo lưu.`}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Bảo mật thông tin</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Sơ đồ trang</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
