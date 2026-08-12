/**
 * Category CRUD routes.
 */
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireApiKey } from '../middleware/auth.js';
import { validate } from '../validation/middleware.js';
import { categoryInputSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getCategories() });
});

router.post('/', requireApiKey, validate(categoryInputSchema), (req: Request, res: Response) => {
  const cat = db.saveCategory(req.body);
  res.status(201).json({ success: true, data: cat });
});

router.put('/:id', requireApiKey, validate(categoryInputSchema), (req: Request, res: Response) => {
  try {
    const cat = db.saveCategory({ ...req.body, id: req.params.id });
    res.json({ success: true, data: cat });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', requireApiKey, (req: Request, res: Response) => {
  try {
    const ok = db.deleteCategory(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
