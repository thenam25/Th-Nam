/**
 * PPTX Import pipeline routes.
 *
 * Handles: file upload (single + chunked), sample data, review/approve/commit,
 * batch operations on import items.
 */
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { requireApiKey } from '../middleware/auth.js';
import { processPPTXFile, isGeminiAvailable } from '../import/pptxEngine.js';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const CHUNK_CLEANUP_TTL_MS = 5 * 60 * 1000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

interface ChunkEntry {
  chunks: Buffer[];
  fileName: string;
  totalChunks: number;
  slideMode: string;
  fileSize: number;
  createdAt: number;
}

const chunkStore = new Map<string, ChunkEntry>();

// Periodic cleanup of stale chunk uploads
const chunkCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of chunkStore) {
    if (now - entry.createdAt > CHUNK_CLEANUP_TTL_MS) {
      chunkStore.delete(key);
    }
  }
}, CHUNK_CLEANUP_TTL_MS);
if (chunkCleanupInterval.unref) chunkCleanupInterval.unref();

const router = Router();

// ── POST /import/pptx (single file upload) ───────────────────────────────

router.post('/import/pptx', requireApiKey, (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Dung lượng file PPTX vượt quá giới hạn cho phép (tối đa 100MB)',
        });
      }
      return res.status(400).json({ success: false, message: `Lỗi upload file: ${err.message}` });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file PPTX để upload. Kéo thả file .pptx vào khung upload.',
      });
    }

    // Warn if Gemini is not available (will use rule-based fallback)
    if (!isGeminiAvailable()) {
      console.warn('[Import] GEMINI_API_KEY not configured — using manual XML extraction without AI.');
    }

    const job = await processPPTXFile(
      req.file.buffer,
      req.file.originalname,
      req.file.size,
      (req.body.slideMode as 'MULTI_PRODUCT' | 'SINGLE_PRODUCT') || 'MULTI_PRODUCT'
    );

    const aiWarning = !isGeminiAvailable()
      ? ' (⚠️ Gemini AI chưa được cấu hình — kết quả bóc tách thủ công, có thể cần chỉnh sửa thêm)'
      : '';

    res.json({
      success: true,
      data: job,
      message: `Đã bóc tách ${job.totalProductsDetected} sản phẩm từ ${job.totalSlides} slide${aiWarning}.`,
    });
  } catch (err: any) {
    console.error('[Import] PPTX processing error:', err?.message || err);
    res.status(500).json({
      success: false,
      message: err?.message
        ? `Lỗi xử lý file PPTX: ${err.message}`
        : 'Lỗi không xác định khi xử lý file PPTX. Vui lòng kiểm tra file và thử lại.',
    });
  }
});

// ── POST /import/pptx-chunk (chunked upload for large files) ─────────────

router.post('/import/pptx-chunk', requireApiKey, upload.single('chunk'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu phân đoạn' });
    }

    const { uploadId, chunkIndex, totalChunks, fileName, slideMode, fileSize } = req.body;
    const cIdx = parseInt(chunkIndex, 10);
    const tChunks = parseInt(totalChunks, 10);
    const totalSize = parseInt(fileSize, 10) || req.file.size;

    if (!uploadId || isNaN(cIdx) || isNaN(tChunks)) {
      return res.status(400).json({ success: false, message: 'Thông tin phân đoạn không hợp lệ' });
    }

    if (!chunkStore.has(uploadId)) {
      chunkStore.set(uploadId, {
        chunks: new Array(tChunks),
        fileName: fileName || 'presentation.pptx',
        totalChunks: tChunks,
        slideMode: slideMode || 'MULTI_PRODUCT',
        fileSize: totalSize,
        createdAt: Date.now(),
      });
    }

    const entry = chunkStore.get(uploadId)!;
    entry.chunks[cIdx] = req.file.buffer;

    const receivedCount = entry.chunks.filter(Boolean).length;
    if (receivedCount < tChunks) {
      return res.json({
        success: true,
        completed: false,
        progress: Math.round((receivedCount / tChunks) * 100),
        message: `Đã nhận phân đoạn ${cIdx + 1}/${tChunks}`,
      });
    }

    // All chunks received — combine and process
    const fullBuffer = Buffer.concat(entry.chunks);
    chunkStore.delete(uploadId);

    const job = await processPPTXFile(fullBuffer, entry.fileName, fullBuffer.length, entry.slideMode as any);
    return res.json({ success: true, completed: true, data: job });
  } catch (err: any) {
    console.error('Error in chunked PPTX upload:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Lỗi xử lý file PPTX phân đoạn' });
  }
});

// ── POST /import/sample ──────────────────────────────────────────────────

router.post('/import/sample', requireApiKey, (_req: Request, res: Response) => {
  try {
    const sampleJob = db.createSampleImportJob();
    res.json({ success: true, data: sampleJob, message: 'Đã nạp catalog PPTX mẫu thành công!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Import Job CRUD ──────────────────────────────────────────────────────

router.get('/import/jobs', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getImportJobs() });
});

router.get('/import/jobs/:id', (req: Request, res: Response) => {
  const job = db.getImportJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Import job not found' });
  }
  res.json({ success: true, data: job });
});

router.post('/import/save-job', requireApiKey, (req: Request, res: Response) => {
  try {
    const job = req.body.job || req.body;
    if (!job || !job.id) {
      return res.status(400).json({ success: false, message: 'Dữ liệu job import không hợp lệ' });
    }
    const savedJob = db.saveImportJob(job);
    res.json({ success: true, data: savedJob, message: 'Đã lưu kết quả bóc tách sản phẩm thành công!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Import Item Operations ───────────────────────────────────────────────

router.post('/import/jobs/:id/append-items', requireApiKey, (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    let job = db.getImportJobById(req.params.id);
    if (!job) {
      job = {
        id: req.params.id,
        fileName: 'Catalog PowerPoint',
        fileSize: 0,
        status: 'READY_FOR_REVIEW',
        progressPercent: 100,
        currentStepMessage: 'Đã bóc tách sản phẩm từ client',
        totalSlides: 1,
        totalProductsDetected: 0,
        totalProductsImported: 0,
        totalProductsNeedReview: 0,
        createdAt: new Date().toISOString(),
        items: [],
      };
    }

    if (Array.isArray(items) && items.length > 0) {
      const existingMap = new Map(job.items.map((i) => [i.id, i]));
      for (const item of items) {
        existingMap.set(item.id, item);
      }
      job.items = Array.from(existingMap.values());
      job.totalProductsDetected = job.items.length;
      job.totalProductsNeedReview = job.items.filter(
        (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
      ).length;
      db.saveImportJob(job);
    }
    res.json({ success: true, data: job });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/import/items/batch-category', requireApiKey, (req: Request, res: Response) => {
  const { jobId, itemIds, categoryName, job: clientJob } = req.body;
  let job = db.getImportJobById(jobId);
  if (!job && clientJob && Array.isArray(clientJob.items)) {
    db.saveImportJob(clientJob);
    job = clientJob;
  }
  if (!job) {
    return res.status(404).json({ success: false, message: 'Import job không tồn tại' });
  }
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Không có sản phẩm nào được chọn' });
  }

  job.items = job.items.map((it) => {
    if (itemIds.includes(it.id)) {
      return { ...it, extractedCategory: categoryName, isEditedByAdmin: true, status: 'AUTO_APPROVED' as const };
    }
    return it;
  });

  job.totalProductsNeedReview = job.items.filter(
    (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
  ).length;
  db.saveImportJob(job);
  res.json({ success: true, data: job, message: `Đã gán danh mục "${categoryName}" cho ${itemIds.length} sản phẩm!` });
});

router.post('/import/items/batch-approve', requireApiKey, (req: Request, res: Response) => {
  const { jobId, itemIds } = req.body;
  const job = db.getImportJobById(jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job không tồn tại' });
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Không có sản phẩm nào được chọn' });
  }

  job.items = job.items.map((it) =>
    itemIds.includes(it.id) ? { ...it, status: 'AUTO_APPROVED' as const } : it
  );
  job.totalProductsNeedReview = job.items.filter(
    (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
  ).length;
  db.saveImportJob(job);
  res.json({ success: true, data: job, message: `Đã duyệt ${itemIds.length} sản phẩm thành công!` });
});

router.post('/import/items/batch-delete', requireApiKey, (req: Request, res: Response) => {
  const { jobId, itemIds } = req.body;
  const job = db.getImportJobById(jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job không tồn tại' });
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Không có sản phẩm nào được chọn' });
  }

  job.items = job.items.filter((it) => !itemIds.includes(it.id));
  job.totalProductsDetected = job.items.length;
  job.totalProductsNeedReview = job.items.filter(
    (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
  ).length;
  db.saveImportJob(job);
  res.json({ success: true, data: job, message: `Đã xóa ${itemIds.length} sản phẩm khỏi danh sách!` });
});

router.delete('/import/jobs/:id/clear', requireApiKey, (req: Request, res: Response) => {
  const job = db.getImportJobById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job không tồn tại' });

  job.items = job.items.filter((it) => it.status === 'IMPORTED');
  job.totalProductsDetected = job.items.length;
  job.totalProductsNeedReview = 0;
  db.saveImportJob(job);
  res.json({ success: true, data: job, message: 'Đã làm sạch sheet import thành công!' });
});

router.post('/import/items/:id/review', requireApiKey, (req: Request, res: Response) => {
  const { jobId, itemData } = req.body;
  const job = db.getImportJobById(jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  const itemIdx = (job.items || []).findIndex((it) => it.id === req.params.id);
  if (itemIdx < 0) return res.status(404).json({ success: false, message: 'Item not found' });

  job.items[itemIdx] = {
    ...job.items[itemIdx],
    ...itemData,
    isEditedByAdmin: true,
    status: 'AUTO_APPROVED',
  };
  job.totalProductsNeedReview = job.items.filter(
    (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
  ).length;
  db.saveImportJob(job);
  res.json({ success: true, data: job.items[itemIdx] });
});

router.delete('/import/items/:jobId/:itemId', requireApiKey, (req: Request, res: Response) => {
  const updatedJob = db.deleteImportItem(req.params.jobId, req.params.itemId);
  if (!updatedJob) return res.status(404).json({ success: false, message: 'Job or Item not found' });
  res.json({ success: true, data: updatedJob, message: 'Đã xóa sản phẩm khỏi danh sách import' });
});

// ── POST /import/jobs/:id/commit (batch commit to main catalog) ──────────

router.post('/import/jobs/:id/commit', requireApiKey, (req: Request, res: Response) => {
  let job = db.getImportJobById(req.params.id);
  const { importAll, job: bodyJob, items: bodyItems } = req.body || {};

  if (!job && bodyJob && Array.isArray(bodyJob.items)) {
    db.saveImportJob(bodyJob);
    job = bodyJob;
  } else if (!job && Array.isArray(bodyItems)) {
    job = {
      id: req.params.id,
      fileName: 'Catalog Import',
      fileSize: 0,
      status: 'READY_FOR_REVIEW',
      progressPercent: 100,
      currentStepMessage: 'Đã tạo từ client',
      totalSlides: 1,
      totalProductsDetected: bodyItems.length,
      totalProductsImported: 0,
      totalProductsNeedReview: 0,
      createdAt: new Date().toISOString(),
      items: bodyItems,
    };
    db.saveImportJob(job);
  }

  if (!job || !Array.isArray(job.items) || job.items.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Danh sách sản phẩm import không tồn tại hoặc trống',
    });
  }

  let validItems = job.items.filter(
    (it) => it.status !== 'IMPORTED' && it.status !== 'REJECTED'
  );

  if (!importAll) {
    const approvedOnly = validItems.filter(
      (it) => it.status === 'AUTO_APPROVED' || it.isEditedByAdmin
    );
    if (approvedOnly.length > 0) {
      validItems = approvedOnly;
    }
  }

  if (validItems.length === 0) {
    return res.json({
      success: true,
      message: 'Tất cả sản phẩm trong file này đã được import vào hệ thống trước đó!',
      data: { importedCount: 0 },
    });
  }

  let importedCount = 0;
  const categories = db.getCategories();
  const brands = db.getBrands();

  for (const item of validItems) {
    const catName = item.extractedCategory || 'MÁY NÔNG CƠ';
    const brandName = item.extractedBrand || 'KHÁC';

    let matchedCat = categories.find(
      (c) => c.name.toLowerCase() === catName.toLowerCase()
    );
    if (!matchedCat) {
      matchedCat = db.saveCategory({
        name: catName.toUpperCase(),
        slug: catName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      });
      categories.push(matchedCat);
    }

    let matchedBrand = brands.find(
      (b) => b.name.toLowerCase() === brandName.toLowerCase()
    );
    if (!matchedBrand) {
      matchedBrand = db.saveBrand({
        name: brandName,
        slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      });
      brands.push(matchedBrand);
    }

    db.saveProduct({
      name: item.extractedName || `Sản phẩm PPTX Slide ${item.slideNumber}`,
      model: item.extractedModel || `MODEL-${item.slideNumber}`,
      sku: item.extractedSku || `SKU-${Date.now()}-${importedCount}`,
      brandId: matchedBrand.id,
      brandName: matchedBrand.name,
      categoryId: matchedCat.id,
      categoryName: matchedCat.name,
      price: item.extractedPrice,
      priceType: item.priceType || (item.extractedPrice ? 'FIXED' : 'CONTACT'),
      currency: 'VND',
      description: item.extractedDescription || `Sản phẩm bóc tách từ catalog PowerPoint slide ${item.slideNumber}.`,
      status: 'ACTIVE',
      featured: true,
      isNew: true,
      images: (item.images && item.images.length > 0 ? item.images : [item.imageUrl]).map(
        (imgUrl: string, imgIdx: number) => ({
          id: `img-imp-${Date.now()}-${importedCount}-${imgIdx}`,
          productId: '',
          url: imgUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=800&auto=format&fit=crop&q=80',
          isPrimary: imgIdx === 0,
          sortOrder: imgIdx + 1,
        })
      ),
    });

    item.status = 'IMPORTED';
    importedCount++;
  }

  job.totalProductsImported += importedCount;
  job.totalProductsNeedReview = job.items.filter(
    (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
  ).length;
  job.status = 'COMPLETED';
  db.saveImportJob(job);

  res.json({
    success: true,
    message: `🎉 Đã import thành công ${importedCount} sản phẩm vào website!`,
    data: { importedCount },
  });
});

export default router;
