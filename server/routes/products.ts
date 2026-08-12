/**
 * Product CRUD routes.
 */
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireApiKey } from '../middleware/auth.js';
import { validate } from '../validation/middleware.js';
import {
  productInputSchema,
  productBatchInputSchema,
  batchCategorySchema,
} from '../validation/schemas.js';

const router = Router();

// ── GET /products ────────────────────────────────────────────────────────

router.get('/', (req: Request, res: Response) => {
  try {
    const { search, categoryId, brandId, featured, isHot, isNew, limit } = req.query;
    const products = db.getProducts({
      search: search as string,
      categoryId: categoryId as string,
      brandId: brandId as string,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      isHot: isHot === 'true' ? true : isHot === 'false' ? false : undefined,
      isNew: isNew === 'true' ? true : isNew === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /products/:id ────────────────────────────────────────────────────

router.get('/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
  }
  res.json({ success: true, data: product });
});

// ── POST /products ───────────────────────────────────────────────────────

router.post('/', requireApiKey, validate(productInputSchema), (req: Request, res: Response) => {
  try {
    const product = db.saveProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /products/batch ─────────────────────────────────────────────────

router.post('/batch', requireApiKey, (req: Request, res: Response) => {
  try {
    const items = req.body.products || req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách sản phẩm trống' });
    }
    const savedProducts = items.map((item: any) => db.saveProduct(item));
    res.json({ success: true, data: savedProducts, message: `Đã thêm thành công ${savedProducts.length} sản phẩm!` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /products/batch-category ────────────────────────────────────────

router.post('/batch-category', requireApiKey, validate(batchCategorySchema), (req: Request, res: Response) => {
  try {
    const { productIds, categoryId, categoryName } = req.body;
    const products = db.getProducts();
    let updatedCount = 0;

    for (const p of products) {
      if (productIds.includes(p.id)) {
        db.saveProduct({
          ...p,
          categoryId: categoryId || p.categoryId,
          categoryName: categoryName || p.categoryName,
        });
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Đã gán danh mục "${categoryName}" cho ${updatedCount} sản phẩm!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /products/:id ───────────────────────────────────────────────────

router.put('/:id', requireApiKey, validate(productInputSchema), (req: Request, res: Response) => {
  try {
    const product = db.saveProduct({ ...req.body, id: req.params.id });
    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /products/all ─────────────────────────────────────────────────

router.delete('/all', requireApiKey, (_req: Request, res: Response) => {
  try {
    db.clearAllProducts();
    res.json({ success: true, message: 'Đã xóa tất cả sản phẩm thành công' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /products/:id ─────────────────────────────────────────────────

router.delete('/:id', requireApiKey, (req: Request, res: Response) => {
  try {
    const ok = db.deleteProduct(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
