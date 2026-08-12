import React, { useState } from 'react';
import { X, FileText, Phone, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Product, SiteSettings } from '../../types/index.js';

interface ProductDetailModalProps {
  product: Product | null;
  siteSettings?: SiteSettings;
  onClose: () => void;
  onRequestQuote: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  siteSettings,
  onClose,
  onRequestQuote,
}) => {
  if (!product) return null;

  const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=800&auto=format&fit=crop&q=80';

  const [selectedImg, setSelectedImg] = useState<string>(
    (product.images || []).find((img) => img.url)?.url || DEFAULT_PRODUCT_IMG
  );

  // Image Zoom Lightbox State
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const hotline = siteSettings?.hotline || '0968 123 456';

  const formatVND = (price: number | null) => {
    if (price === null || price === undefined || price === 0) {
      return 'Liên hệ trực tiếp';
    }
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleZoomIn = () => setZoomScale((s) => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setZoomScale((s) => {
      const next = Math.max(s - 0.5, 1);
      if (next === 1) setZoomPos({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoomScale(1);
    setZoomPos({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - zoomPos.x, y: e.clientY - zoomPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomScale > 1) {
      setZoomPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoomScale((s) => Math.min(s + 0.25, 4));
    } else {
      setZoomScale((s) => {
        const next = Math.max(s - 0.25, 1);
        if (next === 1) setZoomPos({ x: 0, y: 0 });
        return next;
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
          
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* LEFT: IMAGE GALLERY (5 Cols) */}
              <div className="md:col-span-5 space-y-3">
                <div
                  onClick={() => {
                    handleResetZoom();
                    setIsZoomOpen(true);
                  }}
                  className="relative w-full h-64 sm:h-80 rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center overflow-hidden cursor-zoom-in group shadow-xs hover:border-emerald-500 transition-all"
                  title="Bấm vào đây để xem ảnh to và thu phóng tùy ý"
                >
                  <img
                    src={selectedImg || DEFAULT_PRODUCT_IMG}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 bg-slate-900/85 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bấm để phóng to hình ảnh</span>
                  </div>
                </div>

                {/* Thumbnails */}
                {(product.images || []).length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {(product.images || []).map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImg(img.url || DEFAULT_PRODUCT_IMG)}
                        className={`w-14 h-14 rounded-lg border-2 overflow-hidden p-1 bg-slate-50 shrink-0 cursor-pointer transition-all ${
                          selectedImg === img.url ? 'border-emerald-700 shadow-sm scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url || DEFAULT_PRODUCT_IMG} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: DETAILS & SPECS (7 Cols) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded">
                      {product.categoryName || 'MÁY NÔNG CƠ'}
                    </span>
                    {product.brandName && (
                      <span className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                        {product.brandName}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {product.name}
                  </h2>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span>Model: <strong className="text-slate-800">{product.model}</strong></span>
                    <span>|</span>
                    <span>Mã SKU: <strong className="text-slate-800">{product.sku}</strong></span>
                  </div>
                </div>

                {/* Price Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Giá niêm yết:</span>
                    <div className="text-2xl font-black text-red-600 tracking-tight">
                      {formatVND(product.price)}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-emerald-800 font-bold">
                    ✓ Còn hàng sẵn tại kho
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {product.description}
                </p>

                {/* Specifications Table */}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-extrabold text-xs uppercase text-slate-900">
                      THÔNG SỐ KỸ THUẬT
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs divide-y divide-slate-100">
                      {product.specifications.map((spec) => (
                        <div key={spec.id} className="grid grid-cols-12 p-2.5 bg-white odd:bg-slate-50/50">
                          <span className="col-span-5 font-bold text-slate-700">{spec.key}</span>
                          <span className="col-span-7 text-slate-900 font-semibold">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onRequestQuote(product);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase py-3.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>YÊU CẦU BÁO GIÁ TẬN GỐC</span>
                  </button>

                  <a
                    href={`tel:${hotline.replace(/\s+/g, '')}`}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase py-3.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>GỌI {hotline}</span>
                  </a>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* FULLSCREEN IMAGE ZOOM LIGHTBOX */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-200">
          {/* Lightbox Top Header */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white py-2.5 px-4 z-10 bg-slate-900/80 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-xs sm:max-w-md">
                {product.name}
              </span>
              <span className="text-xs text-emerald-400 font-black bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                {Math.round(zoomScale * 100)}%
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleZoomIn}
                title="Phóng to (+)"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title="Thu nhỏ (-)"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Đặt lại kích thước ban đầu"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>
              <div className="w-px h-5 bg-slate-700 mx-1" />
              <button
                onClick={() => setIsZoomOpen(false)}
                className="p-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center gap-1 text-xs cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
                <span>ĐÓNG</span>
              </button>
            </div>
          </div>

          {/* Lightbox Center Interactive Canvas */}
          <div
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden relative my-2 cursor-grab active:cursor-grabbing"
          >
            <img
              src={selectedImg || DEFAULT_PRODUCT_IMG}
              alt={product.name}
              style={{
                transform: `translate(${zoomPos.x}px, ${zoomPos.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              className="max-w-full max-h-[75vh] object-contain drop-shadow-2xl pointer-events-auto transition-transform"
              draggable={false}
            />
          </div>

          {/* Lightbox Footer - Thumbnails */}
          <div className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 z-10 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-xl">
            <div className="text-[11px] text-slate-300 font-medium flex items-center gap-2">
              <span className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-bold">Hướng dẫn:</span>
              <span>Dùng con trỏ chuột lăn để thu phóng | Kéo thả hình để di chuyển khi đang phóng to</span>
            </div>

            {(product.images || []).length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                {(product.images || []).map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setSelectedImg(img.url || DEFAULT_PRODUCT_IMG);
                      handleResetZoom();
                    }}
                    className={`w-11 h-11 rounded-lg border-2 overflow-hidden p-1 bg-white shrink-0 transition-all cursor-pointer ${
                      selectedImg === img.url ? 'border-emerald-500 scale-105 shadow-md' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url || DEFAULT_PRODUCT_IMG} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

