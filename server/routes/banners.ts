/**
 * Banner & News routes.
 */
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireApiKey } from '../middleware/auth.js';
import { validate } from '../validation/middleware.js';
import { bannerInputSchema, bannerSaveAllSchema } from '../validation/schemas.js';

const router = Router();

// ── Banners ──────────────────────────────────────────────────────────────

router.get('/banners', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getBanners() });
});

router.post('/banners', requireApiKey, validate(bannerInputSchema), (req: Request, res: Response) => {
  try {
    const banner = db.saveBanner(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/banners/save-all', requireApiKey, validate(bannerSaveAllSchema), (req: Request, res: Response) => {
  try {
    const banners = db.saveBanners(req.body.banners || []);
    res.json({ success: true, data: banners });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/banners/:id', requireApiKey, (req: Request, res: Response) => {
  try {
    const success = db.deleteBanner(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── News ─────────────────────────────────────────────────────────────────

router.get('/news', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getNews() });
});

export default router;
