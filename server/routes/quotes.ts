/**
 * Quote request routes.
 */
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { validate } from '../validation/middleware.js';
import { quoteInputSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getQuoteRequests() });
});

router.post('/', validate(quoteInputSchema), (req: Request, res: Response) => {
  try {
    const quote = db.createQuoteRequest(req.body);
    res.status(201).json({ success: true, data: quote });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
