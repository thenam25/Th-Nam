import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Package,
  Layers,
  Tag,
  FileText,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  Search,
  X,
  Sparkles,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  RotateCcw,
  CheckCheck,
  FileUp,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Image,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Product, Category, Brand, QuoteRequest, ImportJob, ImportItem, SiteSettings, BannerSlide } from '../../types/index.js';
import { BatchFolderUpload } from './BatchFolderUpload.js';
import { BackupManager } from './BackupManager.js';
import { FolderPlus, Database, Lock } from 'lucide-react';
import { parsePPTXClientSide } from '../../utils/clientPptxParser.js';

interface AdminPanelProps {
  isOpen?: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen = true, onClose, onRefreshData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'import' | 'batch_upload' | 'backup' | 'dashboard' | 'products' | 'categories' | 'brands' | 'quotes' | 'settings'>('import');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);

  // PPTX Import State
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [reviewItem, setReviewItem] = useState<ImportItem | null>(null);
  const [itemFilter, setItemFilter] = useState<'all' | 'need_review' | 'approved'>('all');

  // New Features: Slide Mode, Checkbox Selection, Sheet Separation, Lightbox Zoom
  const [slideMode, setSlideMode] = useState<'MULTI_PRODUCT' | 'SINGLE_PRODUCT'>('MULTI_PRODUCT');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [batchCategory, setBatchCategory] = useState<string>('');
  const [mainBatchCategoryId, setMainBatchCategoryId] = useState<string>('');
  const [sheetTab, setSheetTab] = useState<'pending' | 'imported'>('pending');
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    imgUrl: string;
    title: string;
    images?: string[];
    currentIndex?: number;
  } | null>(null);

  // Product & Category Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [uploadingCategoryImg, setUploadingCategoryImg] = useState<boolean>(false);
  const [uploadingLogoImg, setUploadingLogoImg] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Banner Slide Management State
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<BannerSlide> | null>(null);
  const [uploadingSlideImg, setUploadingSlideImg] = useState<'bgImageUrl' | 'machineImageUrl' | null>(null);

  // Custom Confirmation Modal & Toast state (to avoid browser iframe confirm blocking)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete_product' | 'delete_all_products' | 'delete_import_item' | 'delete_category' | 'reset_data';
    id?: string;
    title: string;
    message: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const executeConfirmAction = async () => {
    if (!confirmModal) return;
    const { type, id } = confirmModal;
    setConfirmModal(null);

    try {
      if (type === 'delete_product' && id) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        await fetchAdminData();
        onRefreshData();
        showToast('✓ Đã xóa sản phẩm thành công!');
      } else if (type === 'delete_category' && id) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        await fetchAdminData();
        onRefreshData();
        showToast('✓ Đã xóa danh mục thành công!');
      } else if (type === 'delete_all_products') {
        setProducts([]);
        await fetch('/api/products/all', { method: 'DELETE' });
        await fetchAdminData();
        onRefreshData();
        showToast('✓ Đã xóa tất cả sản phẩm khỏi hệ thống!');
      } else if (type === 'delete_import_item' && id && selectedJob) {
        await fetch(`/api/import/items/${selectedJob.id}/${id}`, { method: 'DELETE' });
        await fetchAdminData();
        showToast('✓ Đã xóa sản phẩm khỏi danh sách import!');
      } else if (type === 'reset_data') {
        const res = await fetch('/api/reset-data', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          setSelectedJob(null);
          await fetchAdminData();
          onRefreshData();
          showToast('🎉 ' + json.message);
        } else {
          showToast('Lỗi: ' + json.error);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Thao tác thất bại: ' + err.message);
    }
  };

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    companyName: 'NÔNG CƠ MACHINERY',
    slogan: 'Uy tín tạo nên thương hiệu',
    hotline: '0968 123 456',
    techSupportPhone: '0901 234 567',
    email: 'contact@nongcomachinery.vn',
    address: 'Hệ thống đại lý nông cơ toàn quốc',
    workingHours: '8:00 - 18:00 (Thứ 2 - Chủ Nhật)',
    warrantyPolicy: 'Bảo hành chính hãng 12-24 tháng',
    zaloPhone: '0968123456',
    heroTitleLine1: 'ĐỔI MỚI CÔNG NGHỆ',
    heroTitleLine2: 'NÂNG CAO NĂNG SUẤT NÔNG SẢN',
    heroDescription: 'Hệ thống máy gặt đập, máy xới đất và thiết bị nông cơ thế hệ mới chính hãng 100%.',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestMsg, setSupabaseTestMsg] = useState<{ success: boolean; isPaused?: boolean; text: string } | null>(null);

  const handleTestSupabaseConnection = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestMsg(null);
    try {
      const res = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: siteSettings.supabaseUrl,
          key: siteSettings.supabaseAnonKey,
        }),
      });
      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        setSupabaseTestMsg({ success: false, text: '❌ Không nhận được phản hồi JSON từ server. Kiểm tra lại kết nối mạng hoặc thử lại.' });
        showToast('❌ Không nhận được phản hồi từ server.');
        return;
      }

      if (json.cleanedUrl && json.cleanedUrl !== siteSettings.supabaseUrl) {
        setSiteSettings((prev) => ({ ...prev, supabaseUrl: json.cleanedUrl, isSupabaseStorageEnabled: json.success ? true : prev.isSupabaseStorageEnabled }));
      }

      if (json.success) {
        setSupabaseTestMsg({ success: true, text: `${json.message} (Đã kết nối thành công tới bucket: ${json.buckets?.join(', ') || 'images'})` });
        showToast('🎉 Kết nối Supabase thành công!');
      } else {
        setSupabaseTestMsg({ success: false, isPaused: json.isPaused, text: json.message });
        showToast('⚠️ Vui lòng đọc hướng dẫn xử lý lỗi Supabase bên dưới.');
      }
    } catch (err: any) {
      setSupabaseTestMsg({ success: false, text: '❌ Lỗi kết nối: ' + (err?.message || 'Không thể gửi yêu cầu kiểm tra') });
      showToast('❌ Lỗi kết nối Supabase');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const parseApiResponse = async (res: Response) => {
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
      const text = await res.text();
      const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
      return {
        success: false,
        message: cleanText.substring(0, 150) || `Máy chủ phản hồi mã lỗi ${res.status}`,
      };
    } catch {
      return { success: false, message: 'Không thể đọc phản hồi từ máy chủ' };
    }
  };

  const safeFetchJson = async (url: string, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url);
        const data = await parseApiResponse(res);
        if (data.success) {
          return data;
        }
      } catch (err) {
        if (i === retries) break;
        await new Promise((r) => setTimeout(r, 600 * (i + 1)));
      }
    }
    return { success: false };
  };

  const fetchAdminData = async () => {
    try {
      const [resStats, resProds, resCats, resBrands, resQuotes, resJobs, resSettings, resBanners] = await Promise.all([
        safeFetchJson('/api/stats'),
        safeFetchJson('/api/products'),
        safeFetchJson('/api/categories'),
        safeFetchJson('/api/brands'),
        safeFetchJson('/api/quotes'),
        safeFetchJson('/api/import/jobs'),
        safeFetchJson('/api/settings'),
        safeFetchJson('/api/banners'),
      ]);

      if (resStats?.success) setStats(resStats.data);
      if (resProds?.success) setProducts(resProds.data);
      if (resCats?.success) setCategories(resCats.data);
      if (resBrands?.success) setBrands(resBrands.data);
      if (resQuotes?.success) setQuotes(resQuotes.data);
      if (resSettings?.success && resSettings.data) setSiteSettings(resSettings.data);
      if (resBanners?.success && resBanners.data) setBanners(resBanners.data);
      if (resJobs?.success && Array.isArray(resJobs.data)) {
        setImportJobs(resJobs.data);
        if (resJobs.data.length > 0) {
          setSelectedJob((prev) => {
            if (!prev) return resJobs.data[0];
            const updated = resJobs.data.find((j: ImportJob) => j.id === prev.id);
            return updated || resJobs.data[0];
          });
        }
      }
    } catch (err) {
      console.warn('Network retry during admin data refresh:', err);
    }
  };

  // Reset Data to Initial Seed
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      type: 'reset_data',
      title: '⚠️ KHÔI PHỤC DỮ LIỆU GỐC',
      message: 'Tất cả sản phẩm đã import, cài đặt tùy chỉnh và danh sách sẽ được khôi phục về trạng thái ban đầu. Bạn có chắc chắn không?',
    });
  };

  // Load Sample PPTX Catalog
  const handleLoadSamplePPTX = async () => {
    try {
      setUploading(true);
      const res = await fetch('/api/import/sample', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setSelectedJob(json.data);
        await fetchAdminData();
        alert('🎉 Đã nạp thành công catalog PPTX mẫu với 5 sản phẩm nông cơ!');
      } else {
        alert('Lỗi: ' + json.error);
      }
    } catch (err: any) {
      alert('Lỗi nạp catalog mẫu: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle PPTX File Upload (100% Client-side JSZip Parsing to bypass Server limits)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
    if (file.name.toLowerCase().endsWith('.ppt')) {
      showToast('⚠️ File dạng .ppt (PowerPoint 97-2003 cũ). Vui lòng lưu lại dưới định dạng .pptx mới để hệ thống tự động bóc tách!');
      e.target.value = '';
      return;
    }

    const MAX_MB = 150;
    if (file.size > MAX_MB * 1024 * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      showToast(
        `❌ File "${file.name}" quá lớn (${fileSizeMB} MB). Dung lượng tối đa hệ thống tiếp nhận là ${MAX_MB} MB.`
      );
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // 1. Client-side parse PPTX locally in browser using JSZip
      const clientParsedJob = await parsePPTXClientSide(file, slideMode, (percent) => {
        setUploadProgress(percent);
      });

      if (!clientParsedJob || !Array.isArray(clientParsedJob.items) || clientParsedJob.items.length === 0) {
        throw new Error('Không bóc tách được sản phẩm nào từ file PPTX này.');
      }

      setUploadProgress(100);

      // 2. Set State IMMEDIATELY -> 100% instant UI response without waiting for server response!
      setSelectedJob(clientParsedJob);
      setImportJobs((prev) => [clientParsedJob, ...prev.filter((j) => j.id !== clientParsedJob.id)]);
      setSelectedItemIds([]);

      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      showToast(
        `🎉 Bóc tách thành công ${clientParsedJob.items.length} sản phẩm từ file "${file.name}" (${fileSizeMB} MB)!`
      );

      // 3. Non-blocking Background Chunked Sync to Backend Server (small < 1MB payloads)
      (async () => {
        try {
          // Save job metadata first
          const jobMeta = { ...clientParsedJob, items: [] };
          await fetch('/api/import/save-job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job: jobMeta }),
          });

          // Append items in chunks of 3 items to stay well below Vercel's 4.5MB limit
          const CHUNK_SIZE = 3;
          for (let i = 0; i < clientParsedJob.items.length; i += CHUNK_SIZE) {
            const chunk = clientParsedJob.items.slice(i, i + CHUNK_SIZE);
            await fetch(`/api/import/jobs/${clientParsedJob.id}/append-items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: chunk }),
            });
          }
        } catch (bgErr) {
          console.warn('Background server sync warning:', bgErr);
        }
      })();

      onRefreshData();
    } catch (err: any) {
      console.error('PPTX Import error:', err);
      let errMsg = err?.message || 'Không thể bóc tách file PPTX này.';
      if (errMsg.includes('Corrupted zip') || errMsg.includes('end of central directory')) {
        errMsg = 'File không phải định dạng PPTX chuẩn hoặc bị hỏng. Vui lòng mở file bằng PowerPoint và chọn "Save As" file .pptx mới.';
      }
      showToast(`❌ Lỗi bóc tách file: ${errMsg}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  // Checkbox Batch Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = (visibleItems: ImportItem[]) => {
    const visibleIds = visibleItems.map((i) => i.id);
    const allSelected = visibleIds.every((id) => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleApplyBatchCategory = async () => {
    if (!selectedJob || selectedItemIds.length === 0 || !batchCategory) return;

    // Update local state immediately for instant feedback
    const updatedItems = selectedJob.items.map((it) => {
      if (selectedItemIds.includes(it.id)) {
        return {
          ...it,
          extractedCategory: batchCategory,
          isEditedByAdmin: true,
          status: 'AUTO_APPROVED' as const,
        };
      }
      return it;
    });

    const updatedJob: ImportJob = {
      ...selectedJob,
      items: updatedItems,
      totalProductsNeedReview: updatedItems.filter(
        (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
      ).length,
    };

    setSelectedJob(updatedJob);
    setImportJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    showToast(`✓ Đã gán danh mục "${batchCategory}" cho ${selectedItemIds.length} sản phẩm!`);
    const catToApply = batchCategory;
    setBatchCategory('');

    try {
      await fetch('/api/import/items/batch-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          itemIds: selectedItemIds,
          categoryName: catToApply,
          job: updatedJob,
        }),
      });
      await fetchAdminData();
    } catch (err: any) {
      console.warn('Batch category server sync warning:', err);
    }
  };

  const handleApplyBatchApprove = async () => {
    if (!selectedJob || selectedItemIds.length === 0) return;

    // Update local state immediately
    const updatedItems = selectedJob.items.map((it) => {
      if (selectedItemIds.includes(it.id)) {
        return {
          ...it,
          status: 'AUTO_APPROVED' as const,
        };
      }
      return it;
    });

    const updatedJob: ImportJob = {
      ...selectedJob,
      items: updatedItems,
      totalProductsNeedReview: updatedItems.filter(
        (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
      ).length,
    };

    setSelectedJob(updatedJob);
    setImportJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    showToast(`✓ Đã phê duyệt ${selectedItemIds.length} sản phẩm!`);

    try {
      await fetch('/api/import/items/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          itemIds: selectedItemIds,
        }),
      });
      await fetchAdminData();
    } catch (err: any) {
      console.warn('Batch approve server sync warning:', err);
    }
  };

  const handleApplyBatchDelete = async () => {
    if (!selectedJob || selectedItemIds.length === 0) return;

    // Update local state immediately
    const updatedItems = selectedJob.items.filter((it) => !selectedItemIds.includes(it.id));
    const updatedJob: ImportJob = {
      ...selectedJob,
      items: updatedItems,
      totalProductsDetected: updatedItems.length,
      totalProductsNeedReview: updatedItems.filter(
        (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
      ).length,
    };

    setSelectedJob(updatedJob);
    setImportJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    showToast(`✓ Đã xóa ${selectedItemIds.length} sản phẩm khỏi danh sách!`);
    setSelectedItemIds([]);

    try {
      await fetch('/api/import/items/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          itemIds: selectedItemIds,
        }),
      });
      await fetchAdminData();
    } catch (err: any) {
      console.warn('Batch delete server sync warning:', err);
    }
  };

  const handleClearSheet = async () => {
    if (!selectedJob) return;
    try {
      const res = await fetch(`/api/import/jobs/${selectedJob.id}/clear`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setSelectedItemIds([]);
        showToast('🧹 ' + json.message);
        await fetchAdminData();
      } else {
        showToast('Lỗi làm sạch sheet: ' + json.message);
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    }
  };

  // Approve all items in selected import job
  const handleApproveAllItems = async () => {
    if (!selectedJob) return;

    const pendingIds = selectedJob.items.filter((i) => i.status !== 'IMPORTED').map((i) => i.id);
    if (pendingIds.length === 0) {
      showToast('✓ Tất cả sản phẩm đã được phê duyệt hoặc đã import!');
      return;
    }

    try {
      setIsBatchProcessing(true);
      const res = await fetch('/api/import/items/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          itemIds: pendingIds,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('✓ ' + json.message);
        await fetchAdminData();
      } else {
        showToast('Lỗi duyệt: ' + json.message);
      }
    } catch (err: any) {
      showToast('Lỗi kết nối: ' + err.message);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Commit Approved / All Items into DB
  const handleCommitJob = async (jobId: string, importAll = true) => {
    if (isCommitting || !selectedJob) return;
    try {
      setIsCommitting(true);

      // Pre-commit sync: Ensure server DB has job metadata and items in chunks before committing
      try {
        const jobMeta = { ...selectedJob, items: [] };
        await fetch('/api/import/save-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: jobMeta }),
        });

        const CHUNK_SIZE = 1;
        for (let i = 0; i < selectedJob.items.length; i += CHUNK_SIZE) {
          const chunk = selectedJob.items.slice(i, i + CHUNK_SIZE);
          await fetch(`/api/import/jobs/${selectedJob.id}/append-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: chunk }),
          });
        }
      } catch (syncErr) {
        console.warn('Pre-commit sync warning:', syncErr);
      }

      const res = await fetch(`/api/import/jobs/${jobId}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importAll }),
      });
      const json = await parseApiResponse(res);
      if (json.success) {
        setSheetTab('imported');
        showToast(`🎉 ${json.message}`);

        // Update local items state to imported
        const updatedJob: ImportJob = {
          ...selectedJob,
          status: 'COMPLETED',
          items: selectedJob.items.map((it) => ({ ...it, status: 'IMPORTED' })),
        };
        setSelectedJob(updatedJob);
        setImportJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));

        await fetchAdminData();
        onRefreshData();
      } else {
        showToast('❌ Lỗi import: ' + (json.message || json.error || 'Thao tác không thành công'));
      }
    } catch (err: any) {
      showToast('❌ Lỗi kết nối import: ' + err.message);
    } finally {
      setIsCommitting(false);
    }
  };

  // Delete single import item
  const handleDeleteImportItem = (itemId: string) => {
    if (!selectedJob) return;
    setConfirmModal({
      isOpen: true,
      type: 'delete_import_item',
      id: itemId,
      title: 'XÓA SẢN PHẨM KHỎI DANH SÁCH IMPORT',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách import?',
    });
  };

  // Save edited import item
  const handleSaveReviewItem = async (updatedData: Partial<ImportItem>) => {
    if (!reviewItem || !selectedJob) return;

    try {
      const res = await fetch(`/api/import/items/${reviewItem.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          itemData: updatedData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReviewItem(null);
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    const prod = (products || []).find((p) => p.id === id);
    setConfirmModal({
      isOpen: true,
      type: 'delete_product',
      id,
      title: 'XÁC NHẬN XÓA SẢN PHẨM',
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${prod?.name || 'này'}" khỏi hệ thống?`,
    });
  };

  // Delete all products
  const handleDeleteAllProducts = () => {
    setConfirmModal({
      isOpen: true,
      type: 'delete_all_products',
      title: '⚠️ CẢNH BÁO: XÓA TẤT CẢ SẢN PHẨM',
      message: `Hành động này sẽ xóa vĩnh viễn toàn bộ ${products.length} sản phẩm đang có trên website. Bạn có chắc chắn không?`,
    });
  };

  // Save product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/products' : `/api/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const json = await parseApiResponse(res);
      if (json.success) {
        setEditingProduct(null);
        await fetchAdminData();
        onRefreshData();
        showToast('✓ Đã lưu thông tin sản phẩm thành công!');
      } else {
        showToast('❌ Lỗi lưu sản phẩm: ' + (json.message || json.error || 'Thao tác thất bại'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('❌ Lỗi: ' + (err?.message || 'Lỗi kết nối'));
    }
  };

  // Save Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const isNew = !editingCategory.id;
      const url = isNew ? '/api/categories' : `/api/categories/${editingCategory.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      const json = await parseApiResponse(res);
      if (json.success) {
        setEditingCategory(null);
        await fetchAdminData();
        onRefreshData();
        showToast('✓ Đã lưu danh mục thành công!');
      } else {
        showToast('Lỗi: ' + (json.message || json.error || 'Không thể lưu danh mục'));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Thao tác thất bại: ' + err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = (id: string) => {
    const cat = (categories || []).find((c) => c.id === id);
    setConfirmModal({
      isOpen: true,
      type: 'delete_category',
      id,
      title: 'XÁC NHẬN XÓA DANH MỤC',
      message: `Bạn có chắc chắn muốn xóa danh mục "${cat?.name || 'này'}" khỏi hệ thống?`,
    });
  };

  // Save site settings
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      const json = await parseApiResponse(res);
      if (json.success) {
        showToast('🎉 Đã cập nhật thành công thông tin hiển thị website!');
        onRefreshData();
      } else {
        showToast('Lỗi cập nhật: ' + (json.message || json.error || 'Không thể cập nhật'));
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Banner Slide CRUD Handlers
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner),
      });
      const json = await res.json();
      if (json.success) {
        showToast('✓ Đã lưu slide banner thành công!');
        setEditingBanner(null);
        await fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        showToast('❌ Lỗi lưu slide: ' + (json.message || json.error));
      }
    } catch (err: any) {
      showToast('❌ Lỗi kết nối: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa slide banner này khỏi trang chủ?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('✓ Đã xóa slide banner!');
        await fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      showToast('❌ Lỗi xóa slide: ' + err.message);
    }
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIdx];
    newBanners[targetIdx] = temp;

    setBanners(newBanners);
    try {
      await fetch('/api/banners/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: newBanners }),
      });
      showToast('✓ Đã cập nhật thứ tự slide!');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showToast('Lỗi cập nhật thứ tự: ' + err.message);
    }
  };

  const handleFileUploadForSlide = async (file: File, field: 'bgImageUrl' | 'machineImageUrl') => {
    const formData = new FormData();
    formData.append('image', file);
    setUploadingSlideImg(field);
    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setEditingBanner((prev) => (prev ? { ...prev, [field]: json.url } : { [field]: json.url }));
        showToast('✓ Đã tải ảnh slide từ máy tính lên thành công!');
      } else {
        showToast('❌ Lỗi tải ảnh: ' + (json.message || 'Không thể upload'));
      }
    } catch (err: any) {
      showToast('❌ Lỗi upload: ' + err.message);
    } finally {
      setUploadingSlideImg(null);
    }
  };

  const handleCategoryFileUpload = async (file: File) => {
    setUploadingCategoryImg(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setEditingCategory((prev) => (prev ? { ...prev, imageUrl: json.url } : null));
        showToast('✓ Đã tải ảnh danh mục lên thành công!');
      } else {
        // Fallback to FileReader data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            setEditingCategory((prev) => (prev ? { ...prev, imageUrl: dataUrl } : null));
            showToast('✓ Đã chọn ảnh danh mục từ máy tính!');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setEditingCategory((prev) => (prev ? { ...prev, imageUrl: dataUrl } : null));
          showToast('✓ Đã chọn ảnh danh mục từ máy tính!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingCategoryImg(false);
    }
  };

  const handleLogoFileUpload = async (file: File) => {
    setUploadingLogoImg(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setSiteSettings((prev) => ({ ...prev, logoUrl: json.url }));
        showToast('✓ Đã tải Logo cửa hàng lên thành công!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            setSiteSettings((prev) => ({ ...prev, logoUrl: dataUrl }));
            showToast('✓ Đã chọn ảnh Logo từ máy tính!');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setSiteSettings((prev) => ({ ...prev, logoUrl: dataUrl }));
          showToast('✓ Đã chọn ảnh Logo từ máy tính!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogoImg(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col ${isOpen ? '' : 'hidden'}`}>
      {/* HEADER */}
      <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-yellow-400 font-bold">
            ⚙️
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-white">
              HỆ THỐNG QUẢN TRỊ CMS - {siteSettings.companyName}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Bóc tách PowerPoint Catalog AI • Quản lý sản phẩm • Tùy chỉnh thông tin</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* RESET DATA QUICK BUTTON */}
          <button
            onClick={handleResetData}
            title="Khôi phục dữ liệu gốc"
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DỮ LIỆU GỐC</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <button
              onClick={() => setActiveSubTab('import')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'import' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>IMPORT POWERPOINT (.PPTX)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('batch_upload')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'batch_upload' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>⚡ ĐĂNG TẢI NƠI / FOLDER ẤNH</span>
            </button>

            <button
              onClick={() => setActiveSubTab('backup')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'backup' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span>💾 SAO LƯU & KHÔI PHỤC</span>
            </button>

            <button
              onClick={() => setActiveSubTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'settings' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>TÙY CHỈNH THÔNG TIN SITE</span>
            </button>

            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'dashboard' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>DASHBOARD TỔNG QUAN</span>
            </button>

            <button
              onClick={() => setActiveSubTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'products' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>QUẢN LÝ SẢN PHẨM ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'categories' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>DANH MỤC SẢN PHẨM ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('brands')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'brands' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>THƯƠNG HIỆU ({brands.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('quotes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'quotes' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>YÊU CẦU BÁO GIÁ ({quotes.length})</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleResetData}
              className="w-full py-2 bg-red-900/50 hover:bg-red-800/80 border border-red-700 text-red-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>KHÔI PHỤC DỮ LIỆU GỐC</span>
            </button>
            <div className="text-[10px] text-slate-500 text-center">
              Gemini Vision Engine • 2026 Build
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* TAB: BATCH FOLDER UPLOAD */}
          {activeSubTab === 'batch_upload' && (
            <div className="max-w-6xl mx-auto">
              <BatchFolderUpload
                categories={categories}
                brands={brands}
                onComplete={() => {
                  fetchAdminData();
                  onRefreshData();
                }}
                showToast={showToast}
              />
            </div>
          )}

          {/* TAB: BACKUP & RESTORE */}
          {activeSubTab === 'backup' && (
            <div className="max-w-6xl mx-auto">
              <BackupManager
                onRefreshData={() => {
                  fetchAdminData();
                  onRefreshData();
                }}
                showToast={showToast}
              />
            </div>
          )}

          {/* TAB 1: IMPORT POWERPOINT CATALOG */}
          {activeSubTab === 'import' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* HEADER BOX WITH UPLOAD BUTTON, SAMPLE BUTTON & SLIDE MODE SELECTOR */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="max-w-xl">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span>IMPORT CATALOG BẰNG FILE POWERPOINT (.PPTX)</span>
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      Tải lên file slide catalog <strong>.pptx</strong>. Hệ thống bóc tách tự động hình ảnh, tên máy, model, giá cả và danh mục, sau đó đưa thẳng lên website cửa hàng.
                    </p>
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium mt-2">
                      ⚡ <strong>Hỗ trợ Upload Phân Đoạn (Chunked Upload):</strong> Tải mượt mà file PowerPoint nặng từ <strong>30MB, 40MB đến 100MB+</strong> (như file 40,702KB của bạn). Hệ thống tự động chia nhỏ thành các gói dữ liệu 4MB để tải lên ổn định không bao giờ nghẽn mạng!
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleLoadSamplePPTX}
                      disabled={uploading}
                      className="bg-slate-800 hover:bg-slate-900 text-yellow-400 border border-slate-700 font-bold text-xs uppercase px-4 py-3 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <FileUp className="w-4 h-4 text-yellow-400" />
                      <span>⚡ NẠP CATALOG MẪU PPTX (5 SẢN PHẨM)</span>
                    </button>

                    <label className="cursor-pointer bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase px-5 py-3 rounded-lg shadow-md transition-all flex items-center gap-2 active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>TẢI UPLOAD FILE .PPTX CỦA BẠN</span>
                      <input
                        type="file"
                        accept=".pptx"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* SLIDE MODE SELECTOR OPTION */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="text-emerald-700 font-black">⚙️ QUY TẮC AI ĐỌC SLIDE:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-slate-300 hover:border-emerald-500 transition-all shadow-2xs">
                      <input
                        type="radio"
                        name="slideMode"
                        value="MULTI_PRODUCT"
                        checked={slideMode === 'MULTI_PRODUCT'}
                        onChange={() => setSlideMode('MULTI_PRODUCT')}
                        className="accent-emerald-700"
                      />
                      <span><strong>1 Slide = Nhiều Sản Phẩm</strong> (Phổ biến - Tách từng ảnh thành dòng riêng)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-slate-300 hover:border-emerald-500 transition-all shadow-2xs">
                      <input
                        type="radio"
                        name="slideMode"
                        value="SINGLE_PRODUCT"
                        checked={slideMode === 'SINGLE_PRODUCT'}
                        onChange={() => setSlideMode('SINGLE_PRODUCT')}
                        className="accent-emerald-700"
                      />
                      <span><strong>1 Slide = 1 Sản Phẩm Duy Nhất</strong> (Tự động gộp tất cả ảnh trên slide vào 1 sản phẩm)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* UPLOADING PROGRESS BAR */}
              {uploading && (
                <div className="bg-white p-6 rounded-xl border border-emerald-300 shadow-md space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-2 text-emerald-800">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang bóc tách slide PowerPoint & xử lý hình ảnh sản phẩm ({slideMode === 'SINGLE_PRODUCT' ? 'Chế độ 1 Slide = 1 Sản phẩm gộp ảnh' : 'Chế độ 1 Slide = Nhiều sản phẩm'})...</span>
                    </span>
                    <span>{uploadProgress || 50}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress || 50}%` }}
                    />
                  </div>
                </div>
              )}

              {/* RECENT JOBS SELECTOR (IF MULTIPLE JOBS EXIST) */}
              {importJobs.length > 1 && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 overflow-x-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Các file đã upload:</span>
                  {importJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        setSelectedItemIds([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        selectedJob?.id === job.id
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      📄 {job.fileName} ({job.items.length} máy)
                    </button>
                  ))}
                </div>
              )}

              {/* SELECTED JOB DETAILS & REVIEW TABLE */}
              {selectedJob ? (
                <div className="space-y-4">
                  
                  {/* JOB SUMMARY BANNER WITH BIG IMPORT BUTTON */}
                  <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 border-l-4 border-emerald-500 shadow-lg">
                    <div className="space-y-1 max-w-xl">
                      <div className="text-xs font-bold text-yellow-400 flex items-center gap-2">
                        <span>📄 File đang chọn: {selectedJob.fileName}</span>
                      </div>
                      <div className="text-sm font-black text-white">
                        Đã bóc tách được {selectedJob.items.length} sản phẩm từ slide catalog ({selectedJob.items.filter(i => i.status === 'IMPORTED').length} đã lên website)
                      </div>
                      <p className="text-xs text-slate-300">{selectedJob.currentStepMessage}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        disabled={isBatchProcessing || isCommitting}
                        onClick={handleApproveAllItems}
                        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs uppercase px-4 py-3 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {isBatchProcessing ? (
                          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                        ) : (
                          <CheckCheck className="w-4 h-4 text-emerald-400" />
                        )}
                        <span>DUYỆT TẤT CẢ CHỜ IMPORT ({selectedJob.items.filter(i => i.status !== 'IMPORTED').length})</span>
                      </button>

                      <button
                        disabled={isCommitting || isBatchProcessing}
                        onClick={() => handleCommitJob(selectedJob.id, true)}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase px-6 py-3 rounded-lg shadow-xl hover:shadow-emerald-900/50 transition-all flex items-center gap-2 active:scale-95 cursor-pointer ring-2 ring-emerald-400"
                      >
                        {isCommitting ? (
                          <>
                            <RefreshCw className="w-5 h-5 text-yellow-300 animate-spin" />
                            <span>ĐANG IMPORT LÊN WEBSITE...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                            <span>IMPORT SẢN PHẨM VÀO WEBSITE CỬA HÀNG</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PRIMARY SHEET SEPARATION TABS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSheetTab('pending')}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                          sheetTab === 'pending' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>📋 SHEET CHỜ IMPORT (XỬ LÝ & CẦN DUYỆT)</span>
                        <span className="bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black">
                          {selectedJob.items.filter((i) => i.status !== 'IMPORTED').length}
                        </span>
                      </button>

                      <button
                        onClick={() => setSheetTab('imported')}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                          sheetTab === 'imported' ? 'bg-emerald-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>✅ SHEET ĐÃ DUYỆT IMPORT (ĐÃ LÊN WEBSITE)</span>
                        <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-black">
                          {selectedJob.items.filter((i) => i.status === 'IMPORTED').length}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={handleClearSheet}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                      title="Xóa danh sách để có Sheet Trắng sẵn sàng cho đợt import tiếp theo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Làm Sạch Sheet Trắng (Dọn Lượt Tiếp)</span>
                    </button>
                  </div>

                  {/* BATCH ACTION TOOLBAR (WHEN CHECKBOXES ARE SELECTED) */}
                  {selectedItemIds.length > 0 && (
                    <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-700 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="bg-yellow-400 text-slate-900 px-2.5 py-1 rounded font-black text-xs">
                          ĐÃ CHỌN {selectedItemIds.length} SẢN PHẨM
                        </span>
                        <span>Thao tác hàng loạt:</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
                          <select
                            value={batchCategory}
                            onChange={(e) => setBatchCategory(e.target.value)}
                            className="bg-slate-900 text-white text-xs font-bold p-1.5 rounded border border-slate-700 focus:outline-none"
                          >
                            <option value="">-- Chọn danh mục gán nhanh --</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleApplyBatchCategory}
                            disabled={!batchCategory}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded ml-1 disabled:opacity-40"
                          >
                            Gán Danh Mục
                          </button>
                        </div>

                        <button
                          onClick={handleApplyBatchApprove}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 shadow-xs"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Duyệt Đã Chọn ({selectedItemIds.length})
                        </button>

                        <button
                          onClick={handleApplyBatchDelete}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa Đã Chọn ({selectedItemIds.length})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ITEMS PREVIEW TABLE */}
                  {(() => {
                    const visibleItems = selectedJob.items.filter((item) => {
                      if (sheetTab === 'pending') return item.status !== 'IMPORTED';
                      if (sheetTab === 'imported') return item.status === 'IMPORTED';
                      return true;
                    });

                    const isAllVisibleSelected =
                      visibleItems.length > 0 && visibleItems.every((i) => selectedItemIds.includes(i.id));

                    if (visibleItems.length === 0) {
                      const importedCountInJob = selectedJob.items.filter((i) => i.status === 'IMPORTED').length;
                      if (sheetTab === 'pending' && importedCountInJob > 0) {
                        return (
                          <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-200 text-center space-y-3.5 shadow-sm">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                              ✓
                            </div>
                            <h4 className="font-extrabold text-emerald-950 text-base">
                              🎉 Tất Cả {importedCountInJob} Sản Phẩm Trong File Này Đã Được Import Lên Website Thành Công!
                            </h4>
                            <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed font-medium">
                              Danh sách chờ import hiện đang trống vì toàn bộ sản phẩm đã xuất xưởng thành công lên trang web chính. Dữ liệu của bạn hoàn toàn an toàn và đã hiển thị công khai cho khách hàng.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                              <button
                                onClick={() => setSheetTab('imported')}
                                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                                <span>Xem Sheet Đã Import ({importedCountInJob} Máy)</span>
                              </button>
                              <button
                                onClick={() => setActiveSubTab('products')}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                <Package className="w-4 h-4 text-emerald-400" />
                                <span>Chuyển Sang Tab Sản Phẩm Cửa Hàng</span>
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                          <div className="text-4xl">✨</div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            {sheetTab === 'pending'
                              ? 'SHEET TRẮNG SẴN SÀNG!'
                              : 'Chưa có sản phẩm nào trong sheet đã import'}
                          </h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            {sheetTab === 'pending'
                              ? 'Chưa có danh sách chờ mới. Bạn có thể upload file .PPTX tiếp theo để tiếp tục bóc tách sản phẩm!'
                              : 'Hãy chuyển sang "Sheet Chờ Import" và bấm nút "IMPORT SẢN PHẨM VÀO WEBSITE CỬA HÀNG".'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                              <tr>
                                <th className="p-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isAllVisibleSelected}
                                    onChange={() => handleToggleSelectAll(visibleItems)}
                                    className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                                  />
                                </th>
                                <th className="p-3">Hình ảnh (Click phóng to)</th>
                                <th className="p-3">Slide</th>
                                <th className="p-3">Tên sản phẩm</th>
                                <th className="p-3">Model</th>
                                <th className="p-3">Giá bán</th>
                                <th className="p-3">Danh mục</th>
                                <th className="p-3">Thương hiệu</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3 text-right">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {visibleItems.map((item) => (
                                <tr
                                  key={item.id}
                                  className={`hover:bg-slate-50 transition-colors ${
                                    selectedItemIds.includes(item.id) ? 'bg-emerald-50/60' : ''
                                  }`}
                                >
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedItemIds.includes(item.id)}
                                      onChange={() => handleToggleSelect(item.id)}
                                      className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <div
                                      onClick={() =>
                                        setLightboxModal({
                                          isOpen: true,
                                          imgUrl: item.imageUrl,
                                          title: item.extractedName,
                                          images: item.images && item.images.length > 0 ? item.images : [item.imageUrl],
                                          currentIndex: 0,
                                        })
                                      }
                                      className="relative group cursor-pointer inline-block"
                                      title="Bấm để xem ảnh phóng to đối chiếu"
                                    >
                                      <img
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=400&auto=format&fit=crop&q=80'}
                                        alt=""
                                        className="w-12 h-12 object-contain bg-slate-50 border rounded p-0.5 shadow-2xs group-hover:border-emerald-500 transition-all"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center transition-opacity text-white">
                                        <Eye className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 font-bold text-slate-500">Slide {item.slideNumber}</td>
                                  <td className="p-3 font-bold text-slate-900 max-w-xs">{item.extractedName}</td>
                                  <td className="p-3 font-bold text-slate-700">{item.extractedModel}</td>
                                  <td className="p-3 font-black text-red-600">
                                    {item.extractedPrice ? new Intl.NumberFormat('vi-VN').format(item.extractedPrice) + 'đ' : 'Liên hệ'}
                                  </td>
                                  <td className="p-3 font-semibold text-slate-700">
                                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800">
                                      {item.extractedCategory || 'Chưa chọn'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-semibold text-slate-700">{item.extractedBrand}</td>
                                  <td className="p-3">
                                    {item.status === 'AUTO_APPROVED' && (
                                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                        ✓ TỰ ĐỘNG OK
                                      </span>
                                    )}
                                    {item.status === 'NEEDS_REVIEW' && (
                                      <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                        ⚠ CẦN REVIEW
                                      </span>
                                    )}
                                    {item.status === 'DUPLICATE' && (
                                      <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                        ✖ TRÙNG LẮP
                                      </span>
                                    )}
                                    {item.status === 'IMPORTED' && (
                                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                        ✓ ĐÃ LÊN WEBSITE
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right space-x-1.5">
                                    <button
                                      onClick={() => setReviewItem(item)}
                                      className="bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded text-[11px] font-bold"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => handleDeleteImportItem(item.id)}
                                      className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded text-[11px] font-bold"
                                      title="Xóa khỏi danh sách import"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              ) : (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
                  <div className="text-4xl">📄</div>
                  <h4 className="font-bold text-slate-800 text-sm">Chưa có file catalog PowerPoint nào được chọn</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Vui lòng bấm nút <strong>"TẢI UPLOAD FILE .PPTX CỦA BẠN"</strong> hoặc bấm <strong>"⚡ NẠP CATALOG MẪU PPTX"</strong> để trải nghiệm tính năng bóc tách sản phẩm tự động.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: SITE SETTINGS / CUSTOMIZE DISPLAY INFO */}
          {activeSubTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-emerald-700" />
                    <span>TÙY CHỈNH THÔNG TIN HIỂN THỊ WEBSITE</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Chỉnh sửa tên công ty, hotline, số hỗ trợ kỹ thuật, địa chỉ, giờ làm việc và nội dung Hero Banner.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="space-y-6">
                
                {/* GENERAL INFORMATION */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b pb-1">
                    1. THÔNG TIN THƯƠNG HIỆU & LIÊN HỆ
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên Công Ty / Cửa Hàng</label>
                      <input
                        type="text"
                        required
                        value={siteSettings.companyName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, companyName: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu Đăng nhập Quản trị (Admin Password)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={siteSettings.adminPassword || 'admin123'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, adminPassword: e.target.value })}
                          className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-yellow-50"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Dùng để đăng nhập vào trang quản trị Admin này.</p>
                    </div>

                    {/* BẢO MẬT KHÁCH HÀNG SỈ & ĐẠI LÝ */}
                    <div className="col-span-1 sm:col-span-2 bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
                            🔒
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-emerald-950 uppercase">
                              Cấu Hình Khóa Bảo Mật Khách Hàng Sỉ (Wholesale Lock)
                            </h4>
                            <p className="text-[11px] text-emerald-800 font-medium">
                              Bắt buộc khách hàng nhập Mã PIN Khách Sỉ mới được truy cập xem báo giá & sản phẩm.
                            </p>
                          </div>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={siteSettings.isWholesaleLockEnabled !== false}
                            onChange={(e) =>
                              setSiteSettings({ ...siteSettings, isWholesaleLockEnabled: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                        </label>
                      </div>

                      {siteSettings.isWholesaleLockEnabled !== false && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60">
                          <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-1">
                              Mã Truy Cập Khách Sỉ (PIN / Mật khẩu):
                            </label>
                            <input
                              type="text"
                              value={siteSettings.wholesalePasscode || '123456'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, wholesalePasscode: e.target.value })}
                              placeholder="Ví dụ: 123456 hoặc KHANGSI2026"
                              className="w-full p-2.5 text-xs font-mono font-bold text-emerald-950 border border-emerald-300 rounded-lg bg-white"
                            />
                            <p className="text-[10px] text-emerald-700 mt-0.5">
                              Cung cấp mã này cho khách hàng sỉ của bạn để họ truy cập website.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-1">
                              Thông báo hướng dẫn khách sỉ:
                            </label>
                            <input
                              type="text"
                              value={siteSettings.wholesaleNoticeText || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, wholesaleNoticeText: e.target.value })}
                              placeholder="Trang web dành riêng cho Đại Lý & Khách Hàng Sỉ..."
                              className="w-full p-2.5 text-xs border border-emerald-300 rounded-lg bg-white text-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DÒNG CHỮ CHẠY NGANG TRÊN WEBSITE (MARQUEE BANNER) */}
                    <div className="col-span-1 sm:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500 text-emerald-950 flex items-center justify-center font-black text-sm">
                            📢
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                              Dòng Chữ Chạy Ngang Thông Báo Nổi Bật (Marquee Banner)
                            </h4>
                            <p className="text-[11px] text-amber-800 font-medium">
                              Tạo dòng chữ thông báo khuyến mãi / hot tin chạy cuộn liên tục ở đầu trang web.
                            </p>
                          </div>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={siteSettings.isMarqueeEnabled !== false}
                            onChange={(e) =>
                              setSiteSettings({ ...siteSettings, isMarqueeEnabled: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>

                      {siteSettings.isMarqueeEnabled !== false && (
                        <div className="pt-2 border-t border-amber-200/80">
                          <label className="block text-xs font-bold text-amber-950 mb-1">
                            Nội dung dòng chữ chạy ngang:
                          </label>
                          <textarea
                            rows={2}
                            value={siteSettings.marqueeText || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, marqueeText: e.target.value })}
                            placeholder="🔥 KHUYẾN MÃI ĐẶC BIỆT: HỖ TRỢ TRẢ GÓP 0% LÃI SUẤT KHI MUA MÁY GẶT ĐẬP..."
                            className="w-full p-2.5 text-xs font-medium text-slate-900 border border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500 shadow-2xs"
                          />
                          <p className="text-[10px] text-amber-800 mt-1">
                            Mẹo: Có thể nhập các icon như 🔥 🚜 📞 🌟 để làm nổi bật thông báo.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* KẾT NỐI LƯU TRỮ ĐỔI ẢNH SUPABASE (LƯU ẢNH VĨNH VIỄN) */}
                    <div className="col-span-1 sm:col-span-2 bg-emerald-900 text-white p-4 rounded-xl space-y-3 shadow-md">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-extrabold text-sm">
                            ⚡
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                              Lưu Trữ Ảnh Vĩnh Viễn Với Supabase Storage
                            </h4>
                            <p className="text-[11px] text-emerald-200 font-medium">
                              Giúp tất cả ảnh sản phẩm & banner không bao giờ bị mất khi triển khai website lên Vercel.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-800">
                        <div>
                          <label className="block text-xs font-bold text-emerald-200 mb-1">
                            Supabase Project URL:
                          </label>
                          <input
                            type="text"
                            value={siteSettings.supabaseUrl || ''}
                            onChange={(e) => {
                              let val = e.target.value.trim();
                              // Clean /rest/v1 or /storage/v1 if present
                              val = val.replace(/\/rest\/v1\/?.*$/i, '').replace(/\/storage\/v1\/?.*$/i, '');
                              setSiteSettings({ ...siteSettings, supabaseUrl: val });
                            }}
                            onBlur={(e) => {
                              let val = (siteSettings.supabaseUrl || '').trim();
                              if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                                val = `https://${val.includes('.') ? val : val + '.supabase.co'}`;
                                setSiteSettings({ ...siteSettings, supabaseUrl: val });
                              }
                            }}
                            placeholder="https://xyz.supabase.co hoặc dán Project ID zqufilzcwciznfutqhth"
                            className="w-full p-2.5 text-xs font-mono border border-emerald-700 rounded-lg bg-emerald-950 text-emerald-100 placeholder:text-emerald-600 outline-none focus:border-amber-400"
                          />
                          <p className="text-[10px] text-emerald-300 mt-1">
                            Lấy tại Supabase: <b>Project Settings → API → Project URL</b> (chỉ lấy dạng <code className="bg-emerald-950 px-1 rounded text-amber-300">https://xyz.supabase.co</code>, không kèm <s>/rest/v1/</s>)
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-emerald-200 mb-1">
                            Khóa API Anon Key (Project API key - anon public):
                          </label>
                          <input
                            type="text"
                            value={siteSettings.supabaseAnonKey || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, supabaseAnonKey: e.target.value.trim() })}
                            placeholder="Dán mã eyJhbGci... từ Supabase Dashboard"
                            className="w-full p-2.5 text-xs font-mono border border-emerald-700 rounded-lg bg-emerald-950 text-emerald-100 placeholder:text-emerald-600 outline-none focus:border-amber-400"
                          />
                          <p className="text-[10px] text-amber-300 mt-1">
                            ⚠️ Dán khóa <b>"anon public"</b> (bắt đầu bằng <code className="bg-emerald-950 px-1 rounded">eyJ...</code>) lấy tại Supabase Dashboard → <b>Project Settings → API → Project API keys</b>.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="text-xs text-emerald-200">
                          {siteSettings.isSupabaseStorageEnabled ? (
                            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              Đang bật lưu trữ ảnh vĩnh viễn trên Supabase Storage
                            </span>
                          ) : (
                            <span className="text-amber-300 italic">Chưa xác nhận kết nối Supabase</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleTestSupabaseConnection}
                          disabled={isTestingSupabase}
                          className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
                        >
                          {isTestingSupabase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>🔍 CHẠY KIỂM TRA KẾT NỐI SUPABASE</span>}
                        </button>
                      </div>

                      {supabaseTestMsg && (
                        <div
                          className={`mt-3 p-3.5 rounded-xl text-xs font-sans whitespace-pre-line leading-relaxed shadow-sm border ${
                            supabaseTestMsg.success
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-100'
                              : 'bg-amber-950 border-amber-500 text-amber-100'
                          }`}
                        >
                          {supabaseTestMsg.text}
                          {supabaseTestMsg.isPaused && (
                            <div className="mt-3 pt-2 border-t border-amber-800/60 flex items-center justify-between">
                              <span className="text-[11px] text-amber-200 font-medium">Bấm mở Supabase Dashboard để Restore dự án:</span>
                              <a
                                href="https://supabase.com/dashboard"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 text-[11px] font-black px-3 py-1.5 rounded-md transition-all shadow-xs"
                              >
                                🔗 Mở Supabase Dashboard ↗
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Khẩu hiệu</label>
                      <input
                        type="text"
                        value={siteSettings.slogan}
                        onChange={(e) => setSiteSettings({ ...siteSettings, slogan: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Logo Cửa Hàng / Trang Web (Chọn tệp ảnh từ máy tính)
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Dán đường dẫn ảnh https://... hoặc chọn tệp bên dưới"
                          value={siteSettings.logoUrl || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
                          className="flex-1 p-2.5 text-xs border border-slate-300 rounded-lg font-mono bg-white"
                        />
                        <label className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-xs active:scale-95 transition-all">
                          {uploadingLogoImg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <span>CHỌN TỆP LOGO</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLogoFileUpload(file);
                            }}
                          />
                        </label>
                      </div>
                      {siteSettings.logoUrl && (
                        <div className="flex items-center gap-3 pt-1">
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                            <img
                              src={siteSettings.logoUrl}
                              alt="Logo Preview"
                              className="max-h-full max-w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="text-[11px] text-slate-600">
                            <span className="text-emerald-700 font-bold block">✓ Đã chọn Logo website</span>
                            Logo này sẽ hiển thị ngay ở góc trái thanh Tiêu đề / Header của website.
                          </div>
                          <button
                            type="button"
                            onClick={() => setSiteSettings({ ...siteSettings, logoUrl: '' })}
                            className="ml-auto text-xs text-red-600 hover:underline font-bold"
                          >
                            Xóa logo
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hotline Bán Hàng</label>
                      <input
                        type="text"
                        required
                        value={siteSettings.hotline}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hotline: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-bold text-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SĐT Tư Vấn Kỹ Thuật</label>
                      <input
                        type="text"
                        value={siteSettings.techSupportPhone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, techSupportPhone: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-bold text-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Liên Hệ</label>
                      <input
                        type="email"
                        value={siteSettings.email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">SĐT Zalo Chat Floating</label>
                      <input
                        type="text"
                        value={siteSettings.zaloPhone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, zaloPhone: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Trụ Sở / Showroom</label>
                    <input
                      type="text"
                      value={siteSettings.address}
                      onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Giờ Làm Việc</label>
                      <input
                        type="text"
                        value={siteSettings.workingHours}
                        onChange={(e) => setSiteSettings({ ...siteSettings, workingHours: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Chính Sách Bảo Hành Cam Kết</label>
                      <input
                        type="text"
                        value={siteSettings.warrantyPolicy}
                        onChange={(e) => setSiteSettings({ ...siteSettings, warrantyPolicy: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* HERO BANNER SLIDE MANAGER */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                        <Image className="w-4 h-4 text-emerald-700" />
                        <span>2. QUẢN LÝ BỘ SLIDE BANNER TRANG CHỦ (TÙY Ý THÊM SỐ LƯỢNG)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Thêm mới, sửa, xóa, tải ảnh từ máy tính và thay đổi thứ tự các Slide Banner hiển thị ở đầu trang chủ.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingBanner({
                          titleLine1: siteSettings.heroTitleLine1 || 'GIẢI PHÁP TOÀN DIỆN',
                          titleLine2: siteSettings.heroTitleLine2 || 'CHO NÔNG NGHIỆP HIỆN ĐẠI',
                          description: siteSettings.heroDescription || 'Cung cấp đa dạng các dòng máy nông nghiệp chất lượng cao.',
                          bgImageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80',
                          machineImageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=1000&auto=format&fit=crop&q=80',
                        })
                      }
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>THÊM SLIDE BANNER MỚI</span>
                    </button>
                  </div>

                  {/* SLIDE CARDS LIST */}
                  {banners.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-xs text-slate-500 font-medium">Chưa có slide banner nào được cấu hình.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {banners.map((slide, idx) => (
                        <div key={slide.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-3 relative group hover:shadow-md transition-all">
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              SLIDE BANNER #{idx + 1}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveBanner(idx, 'up')}
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                title="Lên trên"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === banners.length - 1}
                                onClick={() => handleMoveBanner(idx, 'down')}
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                title="Xuống dưới"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBanner(slide)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                                title="Chỉnh sửa slide"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBanner(slide.id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                                title="Xóa slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {/* Background Image Preview */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Ảnh nền (Background)</span>
                              <div className="h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 relative">
                                {slide.bgImageUrl ? (
                                  <img src={slide.bgImageUrl} alt="" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">Không có ảnh nền</div>
                                )}
                              </div>
                            </div>

                            {/* Machine Image Preview */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Ảnh máy / Sản phẩm</span>
                              <div className="h-20 rounded-lg overflow-hidden border border-slate-300 bg-white p-1 flex items-center justify-center">
                                {slide.machineImageUrl ? (
                                  <img src={slide.machineImageUrl} alt="" className="max-h-full object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="text-slate-400 text-[10px]">Không có ảnh máy</div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-0.5 text-xs">
                            <div className="font-extrabold text-emerald-800 line-clamp-1">{slide.titleLine1 || siteSettings.heroTitleLine1}</div>
                            <div className="font-extrabold text-red-600 line-clamp-1">{slide.titleLine2 || siteSettings.heroTitleLine2}</div>
                            <div className="text-[11px] text-slate-600 line-clamp-2">{slide.description || siteSettings.heroDescription}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* GLOBAL DEFAULTS */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tiêu Đề Dòng 1 Mặc Định</label>
                      <input
                        type="text"
                        value={siteSettings.heroTitleLine1}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitleLine1: e.target.value })}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tiêu Đề Dòng 2 Mặc Định</label>
                      <input
                        type="text"
                        value={siteSettings.heroTitleLine2}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitleLine2: e.target.value })}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg font-bold text-yellow-600"
                      />
                    </div>
                  </div>
                </div>

                {/* ABOUT & FOOTER EXTRA DETAILS */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b pb-1">
                    3. BÀI GIỚI THIỆU & THÔNG TIN CHÂN TRANG / TÀI KHOẢN
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả Chi Tiết Về Doanh Nghiệp (Hiển thị trang Giới thiệu & Footer)</label>
                    <textarea
                      rows={3}
                      value={siteSettings.aboutText || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, aboutText: e.target.value })}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Thông Tin Tài Khoản Ngân Hàng (Chuyển khoản)</label>
                      <input
                        type="text"
                        value={siteSettings.bankAccountInfo || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, bankAccountInfo: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                        placeholder="MB Bank - STK: 0968123456 - CTTNHH Nông Cơ"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bản Quyền Dưới Chân Trang (Copyright)</label>
                      <input
                        type="text"
                        value={siteSettings.footerCopyright || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, footerCopyright: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                        placeholder="© 2026 NÔNG CƠ MACHINERY. Tất cả quyền được bảo lưu."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Link Trang Facebook / Fanpage</label>
                      <input
                        type="text"
                        value={siteSettings.facebookUrl || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Link Kênh Youtube</label>
                      <input
                        type="text"
                        value={siteSettings.youtubeUrl || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, youtubeUrl: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase px-8 py-3 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                    <span>{isSavingSettings ? 'Đang lưu...' : 'LƯU CẤU HÌNH THÔNG TIN HIỂN THỊ'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 3: DASHBOARD OVERVIEW */}
          {activeSubTab === 'dashboard' && stats && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <h3 className="text-lg font-black text-slate-900 uppercase">TỔNG QUAN HỆ THỐNG</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 text-xs font-bold uppercase">Tổng Sản Phẩm</div>
                  <div className="text-3xl font-black text-emerald-800 mt-2">{stats.totalProducts}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 text-xs font-bold uppercase">Tổng Danh Mục</div>
                  <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalCategories}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 text-xs font-bold uppercase">Thương Hiệu</div>
                  <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalBrands}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 text-xs font-bold uppercase">Yêu Cầu Báo Giá Mới</div>
                  <div className="text-3xl font-black text-red-600 mt-2">{stats.pendingQuotes}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS CRUD */}
          {activeSubTab === 'products' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên hoặc model sản phẩm..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteAllProducts}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs uppercase px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>XÓA TẤT CẢ ({products.length})</span>
                  </button>

                  <button
                    onClick={() =>
                      setEditingProduct({
                        name: '',
                        model: '',
                        price: null,
                        brandId: brands[0]?.id || '',
                        categoryId: categories[0]?.id || '',
                        description: '',
                        specifications: [],
                      })
                    }
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>THÊM SẢN PHẨM MỚI</span>
                  </button>
                </div>
              </div>

              {/* BATCH OPERATION BAR FOR MAIN PRODUCTS */}
              {selectedProductIds.length > 0 && (
                <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-700 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="bg-yellow-400 text-slate-900 px-2.5 py-1 rounded font-black text-xs">
                      ĐÃ CHỌN {selectedProductIds.length} SẢN PHẨM
                    </span>
                    <span>Thao tác hàng loạt:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
                      <select
                        value={mainBatchCategoryId}
                        onChange={(e) => setMainBatchCategoryId(e.target.value)}
                        className="bg-slate-900 text-white text-xs font-bold p-1.5 rounded border border-slate-700 focus:outline-none"
                      >
                        <option value="">-- Chọn danh mục gán nhanh --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={async () => {
                          if (!mainBatchCategoryId || selectedProductIds.length === 0) return;
                          const catObj = (categories || []).find((c) => c.id === mainBatchCategoryId);
                          if (!catObj) return;
                          try {
                            const res = await fetch('/api/products/batch-category', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                productIds: selectedProductIds,
                                categoryId: catObj.id,
                                categoryName: catObj.name,
                              }),
                            });
                            const json = await res.json();
                            if (json.success) {
                              showToast('✓ ' + json.message);
                              setSelectedProductIds([]);
                              setMainBatchCategoryId('');
                              await fetchAdminData();
                              onRefreshData();
                            } else {
                              showToast('Lỗi gán danh mục: ' + json.message);
                            }
                          } catch (err: any) {
                            showToast('Lỗi: ' + err.message);
                          }
                        }}
                        disabled={!mainBatchCategoryId}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded ml-1 disabled:opacity-40"
                      >
                        Gán Danh Mục
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="text-xs text-slate-400 hover:text-white underline ml-2"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                </div>
              )}

              {/* PRODUCTS TABLE */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.includes(p.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(filteredProducts.map((p) => p.id));
                            } else {
                              setSelectedProductIds([]);
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-800"
                        />
                      </th>
                      <th className="p-3">Ảnh</th>
                      <th className="p-3">Tên sản phẩm</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">Giá bán</th>
                      <th className="p-3">Danh mục</th>
                      <th className="p-3">Thương hiệu</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className={`hover:bg-slate-50 ${selectedProductIds.includes(p.id) ? 'bg-amber-50/60' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds((prev) => [...prev, p.id]);
                              } else {
                                setSelectedProductIds((prev) => prev.filter((id) => id !== p.id));
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-800"
                          />
                        </td>
                        <td className="p-3">
                          <img src={(p.images || []).find(img => img.url)?.url || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=200&auto=format&fit=crop&q=80'} alt="" className="w-10 h-10 object-contain bg-slate-50 border rounded p-0.5" />
                        </td>
                        <td className="p-3 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3 font-semibold text-slate-700">{p.model}</td>
                        <td className="p-3 font-black text-red-600">
                          {p.price ? new Intl.NumberFormat('vi-VN').format(p.price) + 'đ' : 'Liên hệ'}
                        </td>
                        <td className="p-3 font-medium text-slate-700">{p.categoryName}</td>
                        <td className="p-3 font-medium text-slate-700">{p.brandName}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-600"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CATEGORIES CRUD */}
          {activeSubTab === 'categories' && (
            <div className="space-y-4 max-w-5xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-black text-base uppercase text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-700" />
                    <span>QUẢN LÝ DANH MỤC SẢN PHẨM ({categories.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thêm mới, chỉnh sửa thông tin hoặc xóa danh mục máy nông cơ trên hệ thống.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingCategory({
                      name: '',
                      slug: '',
                      description: '',
                      imageUrl: '',
                      sortOrder: categories.length + 1,
                    })
                  }
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>THÊM DANH MỤC MỚI</span>
                </button>
              </div>

              {/* CATEGORIES TABLE */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Hình ảnh</th>
                      <th className="p-3">Tên danh mục</th>
                      <th className="p-3">Mã Slug</th>
                      <th className="p-3">Số sản phẩm</th>
                      <th className="p-3">Thứ tự</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt="" className="w-10 h-10 object-cover bg-slate-100 border rounded-lg p-0.5" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-xs">
                              📂
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          {c.description && <div className="text-[10px] text-slate-500 line-clamp-1">{c.description}</div>}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">{c.slug}</td>
                        <td className="p-3">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            {c.productCount} sản phẩm
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{c.sortOrder || 0}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => setEditingCategory(c)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                            title="Sửa danh mục"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-600 transition-colors"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BRANDS */}
          {activeSubTab === 'brands' && (
            <div className="space-y-4 max-w-4xl mx-auto bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-black text-base uppercase text-slate-900">THƯƠNG HIỆU MÁY NÔNG CƠ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brands.map((b) => (
                  <div key={b.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{b.name}</div>
                      <div className="text-[10px] text-slate-500">Xuất xứ: {b.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: QUOTE REQUESTS INBOX */}
          {activeSubTab === 'quotes' && (
            <div className="space-y-4 max-w-5xl mx-auto bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-black text-base uppercase text-slate-900">YÊU CẦU BÁO GIÁ TỪ KHÁCH HÀNG</h3>
              <div className="divide-y divide-slate-200">
                {quotes.map((q) => (
                  <div key={q.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {q.customerName} - SĐT: <strong className="text-red-600">{q.phone}</strong>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">Sản phẩm: {q.productName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Ngày yêu cầu: {q.createdAt}</div>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded text-[10px]">
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* EDIT IMPORT ITEM MODAL */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900">REVIEW & CHỈNH SỬA SẢN PHẨM BÓC TÁCH</h3>
              <button onClick={() => setReviewItem(null)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* IMAGE PREVIEW */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">
                📸 Hình ảnh sản phẩm bóc tách từ Slide {reviewItem.slideNumber}
              </label>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {(reviewItem.images && reviewItem.images.length > 0 ? reviewItem.images : [reviewItem.imageUrl]).filter(url => url && url.trim() !== '').map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt=""
                      className={`w-20 h-20 object-contain rounded-lg border bg-white p-1 cursor-pointer transition-all shadow-xs ${
                        reviewItem.imageUrl === img ? 'ring-2 ring-emerald-600 border-emerald-600 scale-105' : 'opacity-70 hover:opacity-100 hover:scale-102'
                      }`}
                      onClick={() => setReviewItem({ ...reviewItem, imageUrl: img })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  value={reviewItem.extractedName}
                  onChange={(e) => setReviewItem({ ...reviewItem, extractedName: e.target.value })}
                  className="w-full p-2 text-xs border rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  value={reviewItem.extractedModel}
                  onChange={(e) => setReviewItem({ ...reviewItem, extractedModel: e.target.value })}
                  className="w-full p-2 text-xs border rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giá (VNĐ - Điền số)</label>
                <input
                  type="number"
                  value={reviewItem.extractedPrice || ''}
                  onChange={(e) =>
                    setReviewItem({
                      ...reviewItem,
                      extractedPrice: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  className="w-full p-2 text-xs border rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục</label>
                <input
                  type="text"
                  value={reviewItem.extractedCategory}
                  onChange={(e) => setReviewItem({ ...reviewItem, extractedCategory: e.target.value })}
                  className="w-full p-2 text-xs border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button onClick={() => setReviewItem(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Hủy
              </button>
              <button
                onClick={() => handleSaveReviewItem(reviewItem)}
                className="px-5 py-2 text-xs font-black uppercase bg-emerald-700 text-white rounded hover:bg-emerald-800"
              >
                Xác nhận & Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT/ADD PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900">
                {editingProduct.id ? 'SỬA SẢN PHẨM MÁY NÔNG CƠ' : 'THÊM SẢN PHẨM MỚI'}
              </h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 text-xs border rounded-lg font-bold"
                  placeholder="VD: Máy Cày Kubota L5018VN 50HP 4WD"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model / Mã sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.model || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                    className="w-full p-2.5 text-xs border rounded-lg"
                    placeholder="VD: L5018VN"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá bán (VNĐ - Để trống nếu GIÁ LIÊN HỆ)</label>
                  <input
                    type="number"
                    value={editingProduct.price || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: e.target.value ? parseInt(e.target.value, 10) : null })
                    }
                    className="w-full p-2.5 text-xs border rounded-lg font-bold text-red-600"
                    placeholder="Nhập số tiền..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục sản phẩm *</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full p-2.5 text-xs border rounded-lg font-medium"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thương hiệu *</label>
                  <select
                    value={editingProduct.brandId || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brandId: e.target.value })}
                    className="w-full p-2.5 text-xs border rounded-lg font-medium"
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Ảnh chính sản phẩm</label>
                <input
                  type="text"
                  value={editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images[0].url : ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    const imgs = editingProduct.images ? [...editingProduct.images] : [];
                    if (imgs.length > 0) {
                      imgs[0] = { ...imgs[0], url };
                    } else {
                      imgs.push({ id: 'img_1', productId: editingProduct.id || '', url, isPrimary: true, sortOrder: 1 });
                    }
                    setEditingProduct({ ...editingProduct, images: imgs });
                  }}
                  className="w-full p-2.5 text-xs border rounded-lg font-mono"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn sản phẩm</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 text-xs border rounded-lg"
                  placeholder="Nhập tóm tắt ưu điểm, công suất, tính năng nổi bật..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Sản phẩm Nổi bật (Hiển thị Trang chủ)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.status === 'ACTIVE'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.checked ? 'ACTIVE' : 'HIDDEN' })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Còn hàng sẵn tại xưởng</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Hủy
              </button>
              <button type="submit" className="px-6 py-2.5 text-xs font-black uppercase bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 shadow-md">
                Lưu Sản Phẩm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT/ADD CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900">
                {editingCategory.id ? 'SỬA DANH MỤC MÁY NÔNG CƠ' : 'THÊM DANH MỤC MỚI'}
              </h3>
              <button type="button" onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    // Auto generate slug if empty or new
                    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');
                    setEditingCategory({
                      ...editingCategory,
                      name,
                      slug: editingCategory.id ? (editingCategory.slug || slug) : slug,
                    });
                  }}
                  className="w-full p-2.5 text-xs border rounded-lg font-bold"
                  placeholder="VD: Máy Cày & Máy Kéo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full p-2.5 text-xs border rounded-lg font-mono"
                    placeholder="vd: may-cay-may-keo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={editingCategory.sortOrder || 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sortOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 text-xs border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hình ảnh / Biểu tượng danh mục</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCategory.imageUrl || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                    className="flex-1 p-2.5 text-xs border border-slate-300 rounded-lg font-mono"
                    placeholder="https://... hoặc bấm Chọn tệp ảnh từ máy tính"
                  />
                  <label className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all">
                    {uploadingCategoryImg ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>CHỌN TỆP ẤNH</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCategoryFileUpload(file);
                      }}
                    />
                  </label>
                </div>
                {editingCategory.imageUrl && (
                  <div className="mt-2.5 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0">
                      <img
                        src={editingCategory.imageUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      <span className="text-emerald-700 font-bold block">✓ Đã chọn ảnh danh mục</span>
                      Xem trước ảnh sẽ hiển thị trên thẻ danh mục trang chủ và thanh lọc sản phẩm.
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn danh mục</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full p-2.5 text-xs border rounded-lg"
                  placeholder="Mô tả tóm tắt chủng loại máy nông cơ trong danh mục này..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 text-xs font-bold text-slate-600">
                Hủy
              </button>
              <button type="submit" className="px-6 py-2.5 text-xs font-black uppercase bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 shadow-md">
                Lưu Danh Mục
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT/ADD BANNER SLIDE MODAL */}
      {editingBanner && (
        <div className="fixed inset-0 z-[160] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBanner}
            className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                <Image className="w-4 h-4 text-emerald-700" />
                <span>{editingBanner.id ? 'CHỈNH SỬA SLIDE BANNER' : 'THÊM SLIDE BANNER MỚI'}</span>
              </h3>
              <button type="button" onClick={() => setEditingBanner(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Dòng 1 (VD: MÁY CÀY NHẬT BẢN KUBOTA)</label>
                <input
                  type="text"
                  required
                  value={editingBanner.titleLine1 || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, titleLine1: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold"
                  placeholder="GIẢI PHÁP TOÀN DIỆN"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Dòng 2 (VD: GIÁ SỈ TẠI KHO - BẢO HÀNH CHÍNH HÃNG)</label>
                <input
                  type="text"
                  required
                  value={editingBanner.titleLine2 || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, titleLine2: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-red-600"
                  placeholder="CHO NÔNG NGHIỆP HIỆN ĐẠI"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Ngắn Giới Thiệu Slide</label>
                <textarea
                  rows={2}
                  value={editingBanner.description || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  placeholder="Mô tả sản phẩm, dịch vụ hoặc chính sách khuyến mãi..."
                />
              </div>

              {/* BACKGROUND IMAGE UPLOAD & URL */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block font-black text-slate-800 uppercase text-[11px]">
                  1. Ảnh Nền Slide (Background Image)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingBanner.bgImageUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, bgImageUrl: e.target.value })}
                    className="flex-1 p-2 text-xs border border-slate-300 rounded-lg font-mono"
                    placeholder="https://... hoặc bấm nút Chọn ảnh từ máy tính"
                  />
                  <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 shrink-0 active:scale-95 transition-all">
                    {uploadingSlideImg === 'bgImageUrl' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Chọn ảnh...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUploadForSlide(f, 'bgImageUrl');
                      }}
                    />
                  </label>
                </div>
                {editingBanner.bgImageUrl && (
                  <div className="h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 mt-1 relative">
                    <img src={editingBanner.bgImageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* MACHINE IMAGE UPLOAD & URL */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block font-black text-slate-800 uppercase text-[11px]">
                  2. Ảnh Máy / Sản Phẩm Nổi Bật (Machine Overlay Photo)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingBanner.machineImageUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, machineImageUrl: e.target.value })}
                    className="flex-1 p-2 text-xs border border-slate-300 rounded-lg font-mono"
                    placeholder="https://... hoặc bấm nút Chọn ảnh từ máy tính"
                  />
                  <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 shrink-0 active:scale-95 transition-all">
                    {uploadingSlideImg === 'machineImageUrl' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Chọn ảnh...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUploadForSlide(f, 'machineImageUrl');
                      }}
                    />
                  </label>
                </div>
                {editingBanner.machineImageUrl && (
                  <div className="h-20 rounded-lg overflow-hidden border border-slate-300 bg-white p-1 flex items-center justify-center mt-1">
                    <img src={editingBanner.machineImageUrl} alt="Preview" className="max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase px-5 py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
              >
                LƯU SLIDE BANNER
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* CONFIRMATION MODAL OVERLAY */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-black text-sm uppercase">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                HỦY BỎ
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>XÁC NHẬN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE LIGHTBOX ZOOM MODAL OVERLAY */}
      {lightboxModal && lightboxModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxModal(null)}
              className="absolute -top-10 right-0 text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-white text-center font-black text-sm uppercase tracking-wide bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
              🔍 ĐỐI CHIẾU ẢNH SẢN PHẨM: {lightboxModal.title}
            </div>

            <div className="relative group bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={lightboxModal.imgUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=800&auto=format&fit=crop&q=80'}
                alt={lightboxModal.title}
                className="max-h-[65vh] object-contain rounded-lg transition-transform hover:scale-105 duration-300"
              />
            </div>

            {/* Gallery thumbnails if multiple photos exist */}
            {lightboxModal.images && lightboxModal.images.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto p-2 max-w-full">
                {lightboxModal.images.filter(img => img && img.trim() !== '').map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxModal({ ...lightboxModal, imgUrl: img, currentIndex: idx })}
                    className={`w-14 h-14 rounded-lg border-2 overflow-hidden bg-slate-900 transition-all cursor-pointer ${
                      lightboxModal.imgUrl === img
                        ? 'border-yellow-400 scale-105 ring-2 ring-yellow-400'
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            <div className="text-slate-400 text-xs font-semibold">
              💡 Click bên ngoài hoặc bấm nút [X] để đóng cửa sổ xem ảnh phóng to.
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING OVERLAY MODAL WHEN COMMITTING OR BATCH PROCESSING */}
      {(isCommitting || isBatchProcessing) && (
        <div className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-lg">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black uppercase text-white tracking-wide">
                {isCommitting ? '🚀 ĐANG IMPORT SẢN PHẨM VÀO CỬA HÀNG' : '⚡ ĐANG XỬ LÝ DUYỆT SẢN PHẨM'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {isCommitting
                  ? 'Hệ thống đang lưu trữ sản phẩm, phân loại danh mục, gán thương hiệu và công khai lên cửa hàng. Vui lòng đợi trong giây lát...'
                  : 'Hệ thống đang xử lý hàng loạt sản phẩm. Vui lòng không đóng trình duyệt...'}
              </p>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 h-full w-full animate-pulse rounded-full" />
            </div>

            <div className="text-[11px] font-bold text-yellow-400 bg-yellow-500/10 py-2 px-3 rounded-lg border border-yellow-500/20">
              ✨ Dữ liệu sẽ cập nhật trực tiếp trên giao diện cửa hàng ngay sau khi hoàn tất!
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
