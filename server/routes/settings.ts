/**
 * Site settings routes.
 */
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireApiKey } from '../middleware/auth.js';
import { validate } from '../validation/middleware.js';
import { settingsSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: db.getSettings() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', requireApiKey, validate(settingsSchema), (req: Request, res: Response) => {
  try {
    const updated = db.saveSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
