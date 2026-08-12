import React, { useState, useRef } from 'react';
import { Download, Upload, ShieldCheck, Database, CheckCircle2, AlertTriangle, RefreshCw, FileText, FileUp, Sparkles, HardDrive } from 'lucide-react';

interface BackupManagerProps {
  onRefreshData: () => void;
  showToast: (msg: string) => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ onRefreshData, showToast }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [importedFileName, setImportedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger export backup file download
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/backup/export');
      if (!res.ok) throw new Error('Không thể xuất dữ liệu từ máy chủ');
      
      const data = await res.json();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `NongCo_BaoNamTanPhu_FullBackup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('🎉 Đã tải file sao lưu dữ liệu toàn hệ thống (.json) thành công!');
    } catch (err: any) {
      showToast(`❌ Lỗi sao lưu: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle backup JSON file select for restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Dữ liệu file không đúng cấu trúc JSON.');
        }
        setPreviewData(parsed);
        showToast('✅ Đã đọc file sao lưu thành công! Hãy kiểm tra thông tin trước khi khôi phục.');
      } catch (err: any) {
        setPreviewData(null);
        showToast(`❌ Lỗi đọc file JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Perform full restore
  const handleConfirmRestore = async () => {
    if (!previewData) return;

    setIsImporting(true);
    try {
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: previewData }),
      });

      const result = await res.json();
      if (result.success) {
        showToast('🎉 Đã khôi phục toàn bộ dữ liệu thành công! Hệ thống đang cập nhật lại trang...');
        setPreviewData(null);
        setImportedFileName('');
        setTimeout(() => {
          onRefreshData();
          window.location.reload();
        }, 1200);
      } else {
        showToast(`❌ Khôi phục thất bại: ${result.error || result.message}`);
      }
    } catch (err: any) {
      showToast(`❌ Lỗi khôi phục: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/30 rounded-xl border border-emerald-500/30 backdrop-blur-md">
              <Database className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">SAO LƯU & KHÔI PHỤC DỮ LIỆU WEBSITE</h2>
              <p className="text-xs text-slate-300">
                Xuất file sao lưu đầy đủ (.json) hoặc nhập dữ liệu vào website mới. Đảm bảo an toàn 100% không bị mất thông tin sản phẩm, danh mục, cấu hình!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: BACKUP EXPORT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">1. TẠO TỆP SAO LƯU (EXPORT)</h3>
                <p className="text-xs text-slate-500">Tải toàn bộ dữ liệu hiện tại về máy tính cá nhân</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bao gồm tất cả danh mục sản phẩm, máy móc, hình ảnh</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bao gồm danh sách thương hiệu, banner quảng cáo, tin tức</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bao gồm thông tin liên hệ, hotline, cấu hình giao diện</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                <span>ĐANG XUẤT FILE SAO LƯU...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-yellow-300" />
                <span>TẢI VỀ TỆP SAO LƯU DỮ LIỆU (.JSON)</span>
              </>
            )}
          </button>
        </div>

        {/* CARD 2: RESTORE IMPORT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">2. KHÔI PHỤC DỮ LIỆU (IMPORT)</h3>
                <p className="text-xs text-slate-500">Nạp file sao lưu (.json) vào hệ thống web mới</p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json"
              className="hidden"
            />

            {!previewData ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-colors space-y-2"
              >
                <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  Bấm vào đây để chọn tệp sao lưu <span className="text-emerald-700">.json</span>
                </div>
                <div className="text-[11px] text-slate-400">Chỉ chấp nhận file định dạng .json đã xuất từ hệ thống</div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-200/80 pb-2">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>File: {importedFileName}</span>
                  </span>
                  <button
                    onClick={() => {
                      setPreviewData(null);
                      setImportedFileName('');
                    }}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    Đổi file khác
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    Sản phẩm: <strong className="text-emerald-800">{previewData.products?.length || 0}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    Danh mục: <strong className="text-emerald-800">{previewData.categories?.length || 0}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    Thương hiệu: <strong className="text-emerald-800">{previewData.brands?.length || 0}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    Banner Slide: <strong className="text-emerald-800">{previewData.banners?.length || 0}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirmRestore}
            disabled={!previewData || isImporting}
            className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 active:scale-95"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                <span>ĐANG KHÔI PHỤC DỮ LIỆU...</span>
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4 text-yellow-300" />
                <span>XÁC NHẬN KHÔI PHỤC FULL DỮ LIỆU NGAY</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
