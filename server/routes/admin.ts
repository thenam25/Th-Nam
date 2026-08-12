/**
 * Admin routes: login, dashboard stats, reset data, backup/restore.
 */
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { config } from '../config.js';
import { requireApiKey, createAdminSessionToken } from '../middleware/auth.js';
import { validate } from '../validation/middleware.js';
import { adminLoginSchema, backupImportSchema } from '../validation/schemas.js';

const router = Router();

// ── Admin Login ──────────────────────────────────────────────────────────

router.post('/admin/login', validate(adminLoginSchema), (req: Request, res: Response) => {
  const { password } = req.body;
  const settings = db.getSettings();
  const correctPassword = settings.adminPassword || config.adminPassword;

  if (!correctPassword) {
    return res.status(500).json({
      success: false,
      message: 'Admin password chưa được cấu hình. Vui lòng set ADMIN_PASSWORD trong biến môi trường.',
    });
  }

  if (password === correctPassword) {
    const token = createAdminSessionToken();
    return res.json({ success: true, token });
  }

  res.status(401).json({ success: false, message: 'Mật khẩu không chính xác.' });
});

// ── Health Check ─────────────────────────────────────────────────────────

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Dashboard Stats ──────────────────────────────────────────────────────

router.get('/stats', (_req: Request, res: Response) => {
  const products = db.getProducts();
  const categories = db.getCategories();
  const brands = db.getBrands();
  const quotes = db.getQuoteRequests();
  const importJobs = db.getImportJobs();

  let pendingReviewCount = 0;
  importJobs.forEach((job) => {
    pendingReviewCount += job.items.filter(
      (it) => it.status === 'NEEDS_REVIEW' || it.status === 'DUPLICATE'
    ).length;
  });

  res.json({
    success: true,
    data: {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalBrands: brands.length,
      totalQuoteRequests: quotes.length,
      pendingQuotes: quotes.filter((q) => q.status === 'PENDING').length,
      totalImportJobs: importJobs.length,
      pendingReviewItems: pendingReviewCount,
      geminiAvailable: Boolean(config.geminiApiKey),
    },
  });
});

// ── Reset Data to Seed ───────────────────────────────────────────────────

router.post('/reset-data', requireApiKey, (_req: Request, res: Response) => {
  try {
    db.resetToSeed();
    res.json({ success: true, message: 'Đã khôi phục dữ liệu gốc thành công!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Backup Export ────────────────────────────────────────────────────────

router.get('/backup/export', (_req: Request, res: Response) => {
  try {
    const data = db.exportFullDatabase();
    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="BaoNamTanPhu_Backup_${dateStr}.json"`
    );
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Backup Import ────────────────────────────────────────────────────────

router.post('/backup/import', requireApiKey, (req: Request, res: Response) => {
  try {
    const payload = req.body.data || req.body;
    const updatedDb = db.importFullDatabase(payload);
    res.json({
      success: true,
      data: updatedDb,
      message: '🎉 Đã khôi phục toàn bộ dữ liệu hệ thống thành công!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
