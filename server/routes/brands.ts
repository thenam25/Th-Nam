/**
 * Brand routes.
 */
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireApiKey } from '../middleware/auth.js';
import { validate } from '../validation/middleware.js';
import { brandInputSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getBrands() });
});

router.post('/', requireApiKey, validate(brandInputSchema), (req: Request, res: Response) => {
  const brand = db.saveBrand(req.body);
  res.status(201).json({ success: true, data: brand });
});

export default router;
