/**
 * Validation middleware factory.
 *
 * Usage:
 *   import { validate } from '../validation/middleware.js';
 *   import { productInputSchema } from '../validation/schemas.js';
 *
 *   router.post('/products', requireApiKey, validate(productInputSchema), handler);
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Creates an Express middleware that validates `req.body` against a Zod schema.
 * On validation failure, returns 400 with structured field-level error messages.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and replace — strips unknown fields + coerces types
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors = err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: fieldErrors,
        });
        return;
      }
      next(err);
    }
  };
}
