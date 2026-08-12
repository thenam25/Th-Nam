import React, { useState } from 'react';
import { X, CheckCircle2, FileText, Send } from 'lucide-react';
import { Product } from '../../types/index.js';

interface QuoteModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmitQuote: (data: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    productId?: string;
    productName?: string;
    note: string;
  }) => Promise<void>;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ product, onClose, onSubmitQuote }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmitQuote({
        customerName,
        phone,
        email,
        address,
        productId: product?.id,
        productName: product ? `${product.name} (Model: ${product.model})` : 'Yêu cầu tư vấn tổng hợp',
        note,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase">
              GỬI YÊU CẦU BÁO GIÁ THÀNH CÔNG!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Cảm ơn quý khách <strong className="text-slate-900">{customerName}</strong>. Chuyên viên tư vấn kỹ thuật Nông Cơ Machinery sẽ liên hệ với quý khách qua SĐT <strong className="text-slate-900">{phone}</strong> trong vòng 15 phút.
            </p>
            <button
              onClick={onClose}
              className="bg-emerald-800 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-lg hover:bg-emerald-900 transition-colors"
            >
              HOÀN TẤT
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base uppercase text-slate-900">YÊU CẦU BÁO GIÁ</h3>
                <p className="text-[11px] text-slate-500 font-medium">Nhận báo giá ưu đãi tốt nhất từ nhà phân phối</p>
              </div>
            </div>

            {product && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-3">
                <img
                  src={(product?.images || []).find(img => img.url)?.url || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=200&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-12 h-12 object-contain bg-white rounded border border-emerald-100 p-0.5"
                />
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{product.name}</div>
                  <div className="text-[11px] text-emerald-800 font-semibold">Model: {product.model}</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email (Nếu có)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@gmail.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ví dụ: Thái Bình"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú yêu cầu cụ thể
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Cần tư vấn công suất, phương thức giao hàng hoặc số lượng lớn..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>ĐANG GỬI...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>GỬI YÊU CẦU NGAY (MIỄN PHÍ)</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
