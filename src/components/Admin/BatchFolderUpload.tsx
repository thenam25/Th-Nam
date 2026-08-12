import React, { useState, useRef } from 'react';
import { FolderPlus, Upload, Trash2, CheckCircle2, Sparkles, Layers, Tag, Save, ArrowRight, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Category, Brand } from '../../types/index.js';

interface BatchUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  model: string;
  categoryId: string;
  brandId: string;
  price: string; // string representation e.g. "12000000" or empty for CONTACT
  isHot?: boolean;
}

interface BatchFolderUploadProps {
  categories: Category[];
  brands: Brand[];
  onComplete: () => void;
  showToast: (msg: string) => void;
}

export const BatchFolderUpload: React.FC<BatchFolderUploadProps> = ({
  categories,
  brands,
  onComplete,
  showToast,
}) => {
  const [items, setItems] = useState<BatchUploadItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkBrand, setBulkBrand] = useState<string>('');
  const [bulkPrice, setBulkPrice] = useState<string>('');

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file name to readable product name
  const cleanFileNameToTitle = (filename: string): { title: string; model: string } => {
    // Remove file extension
    let nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    
    // Replace underscores, dashes with spaces
    let clean = nameWithoutExt.replace(/[-_]+/g, ' ').trim();

    // Capitalize first letter of each word
    let title = clean
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Extract potential model (e.g. 5200, GX35, EF393T)
    const modelMatch = title.match(/([A-Z0-9]{3,8})/i);
    const model = modelMatch ? modelMatch[0].toUpperCase() : `M-${Math.floor(Math.random() * 900 + 100)}`;

    return { title: title || 'Sản phẩm mới', model };
  };

  // Handle file list processing
  const handleFilesAdded = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: BatchUploadItem[] = [];
    const defaultCatId = categories[0]?.id || '';
    const defaultBrandId = brands[0]?.id || '';

    const validFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      showToast('⚠️ Không tìm thấy file hình ảnh hợp lệ trong thư mục/tệp đã chọn!');
      return;
    }

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const { title, model } = cleanFileNameToTitle(file.name);
      
      // Create Base64 data URI or Object URL
      const reader = new FileReader();
      const previewUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: `batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        name: title,
        model,
        categoryId: bulkCategory || defaultCatId,
        brandId: bulkBrand || defaultBrandId,
        price: bulkPrice || '',
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    showToast(`✅ Đã tải ${newItems.length} ảnh sản phẩm vào danh sách chờ!`);
  };

  // Bulk Apply
  const applyBulkCategory = () => {
    if (!bulkCategory) return;
    setItems((prev) => prev.map((item) => ({ ...item, categoryId: bulkCategory })));
    const catName = (categories || []).find((c) => c.id === bulkCategory)?.name || '';
    showToast(`Đã áp dụng danh mục "${catName}" cho tất cả sản phẩm!`);
  };

  const applyBulkBrand = () => {
    if (!bulkBrand) return;
    setItems((prev) => prev.map((item) => ({ ...item, brandId: bulkBrand })));
    const brandName = (brands || []).find((b) => b.id === bulkBrand)?.name || '';
    showToast(`Đã áp dụng thương hiệu "${brandName}" cho tất cả sản phẩm!`);
  };

  const applyBulkPrice = () => {
    setItems((prev) => prev.map((item) => ({ ...item, price: bulkPrice })));
    showToast(bulkPrice ? `Đã áp dụng giá chung cho tất cả sản phẩm!` : `Đã chuyển tất cả sang "Giá liên hệ"!`);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Save all to database
  const handleSaveAll = async () => {
    if (items.length === 0) return;

    setIsSaving(true);
    try {
      const productsToSave = items.map((item) => {
        const cat = (categories || []).find((c) => c.id === item.categoryId);
        const br = (brands || []).find((b) => b.id === item.brandId);
        const numPrice = item.price ? parseInt(item.price.replace(/\D/g, ''), 10) || null : null;

        return {
          name: item.name,
          model: item.model,
          sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          brandId: item.brandId,
          brandName: br?.name || 'KHÁC',
          categoryId: item.categoryId,
          categoryName: cat?.name || 'MÁY NÔNG CƠ',
          price: numPrice,
          priceType: numPrice ? 'FIXED' : 'CONTACT',
          currency: 'VND',
          description: `Sản phẩm ${item.name} chính hãng chất lượng cao.`,
          status: 'ACTIVE',
          featured: true,
          images: [
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              productId: '',
              url: item.previewUrl,
              isPrimary: true,
              sortOrder: 1,
            },
          ],
        };
      });

      // Save in small chunks of 2 products to avoid Vercel 4.5MB payload limit
      const CHUNK_SIZE = 2;
      let totalSaved = 0;

      for (let i = 0; i < productsToSave.length; i += CHUNK_SIZE) {
        const chunk = productsToSave.slice(i, i + CHUNK_SIZE);
        const response = await fetch('/api/products/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: chunk }),
        });

        const res = await response.json();
        if (res.success) {
          totalSaved += chunk.length;
        } else {
          showToast(`⚠️ Lỗi khi lưu một số sản phẩm: ${res.message || res.error}`);
        }
      }

      if (totalSaved > 0) {
        showToast(`🎉 Tải lên thành công ${totalSaved}/${productsToSave.length} sản phẩm vào hệ thống!`);
        setItems([]);
        onComplete();
      }
    } catch (err: any) {
      showToast(`❌ Lỗi kết nối: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Folder Picker Buttons */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-700/60 rounded-xl border border-emerald-500/30 backdrop-blur-md">
              <FolderPlus className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">ĐĂNG TẢI SẢN PHẨM NHANH BẰNG THƯ MỤC / NHIỀU ẤNH</h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Chọn cả thư mục hình ảnh sản phẩm từ máy tính của bạn. Hệ thống tự động tách tên, chuẩn hóa và tạo sản phẩm hàng loạt!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Folder input */}
            <input
              type="file"
              ref={folderInputRef}
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
            />
            <button
              onClick={() => folderInputRef.current?.click()}
              className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>CHỌN NGUYÊN THƯ MỤC ẤNH (FOLDER)</span>
            </button>

            {/* Multiple files input */}
            <input
              type="file"
              ref={filesInputRef}
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
              multiple
              accept="image/*"
            />
            <button
              onClick={() => filesInputRef.current?.click()}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              <span>CHỌN NHIỀU FILE ẤNH CÙNG LÚC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Settings & Actions Bar (If items exist) */}
      {items.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
            <span className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>ĐAN GIẢI LẬP {items.length} SẢN PHẨM TRONG HÀNG CHỜ</span>
            </span>
            <button
              onClick={() => setItems([])}
              className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ hàng chờ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Bulk Category */}
            <div className="flex gap-2">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              >
                <option value="">-- Chọn danh mục chung --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={applyBulkCategory}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
              >
                Áp dụng
              </button>
            </div>

            {/* Bulk Brand */}
            <div className="flex gap-2">
              <select
                value={bulkBrand}
                onChange={(e) => setBulkBrand(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              >
                <option value="">-- Chọn thương hiệu chung --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button
                onClick={applyBulkBrand}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
              >
                Áp dụng
              </button>
            </div>

            {/* Bulk Price */}
            <div className="flex gap-2">
              <input
                type="text"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="Giá chung (VD: 15000000)"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
              <button
                onClick={applyBulkPrice}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Items Table / Spreadsheet view */}
      {items.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">STT</th>
                  <th className="p-3 w-20 text-center">Hình ảnh</th>
                  <th className="p-3 min-w-[200px]">Tên sản phẩm</th>
                  <th className="p-3 w-32">Model</th>
                  <th className="p-3 w-40">Danh mục</th>
                  <th className="p-3 w-36">Thương hiệu</th>
                  <th className="p-3 w-36">Giá bán (VNĐ)</th>
                  <th className="p-3 w-12 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 text-center">
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-12 h-12 object-contain bg-slate-50 rounded-lg border border-slate-200 p-1 mx-auto"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it) => (it.id === item.id ? { ...it, name: val } : it))
                          );
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.model}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it) => (it.id === item.id ? { ...it, model: val } : it))
                          );
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-700"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={item.categoryId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it) => (it.id === item.id ? { ...it, categoryId: val } : it))
                          );
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={item.brandId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it) => (it.id === item.id ? { ...it, brandId: val } : it))
                          );
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                      >
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.price}
                        placeholder="Để trống = Giá liên hệ"
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it) => (it.id === item.id ? { ...it, price: val } : it))
                          );
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-bold text-emerald-800"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa khỏi danh sách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs font-semibold text-slate-600">
              Tổng cộng: <strong className="text-slate-900 font-bold">{items.length}</strong> sản phẩm sẵn sàng đăng tải
            </span>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-xl transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                  <span>ĐANG LƯU DỮ LIỆU SẢN PHẨM...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-yellow-300" />
                  <span>LƯU TẤT CẢ {items.length} SẢN PHẨM VÀO HỆ THỐNG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Chưa có ảnh sản phẩm nào được chọn</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hãy bấm nút <strong>"CHỌN NGUYÊN THƯ MỤC ẤNH"</strong> bên trên để tải lên hàng chục hoặc hàng trăm ảnh cùng lúc. Hệ thống sẽ tự động chuyển tên ảnh thành tên sản phẩm!
          </p>
        </div>
      )}
    </div>
  );
};
