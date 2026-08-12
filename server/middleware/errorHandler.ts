/**
 * Global error handling middleware.
 *
 * Ensures all errors are returned as structured JSON, never as HTML.
 * In production, stack traces and internal details are stripped.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config.js';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Không có quyền truy cập') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

/**
 * Express global error handler.
 * Must have 4 parameters to be recognized as an error handler by Express.
 */
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod validation errors
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

  // Handle custom AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Handle multer file size errors
  if (err instanceof Error && err.name === 'MulterError') {
    const multerErr = err as Error & { code?: string };
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'Dung lượng file vượt quá giới hạn cho phép (tối đa 100MB)',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Lỗi upload file: ${err.message}`,
    });
    return;
  }

  // Unknown/unexpected errors
  console.error('Unhandled error:', err instanceof Error ? err.message : String(err));

  const message = config.isProduction
    ? 'Lỗi hệ thống máy chủ. Vui lòng thử lại sau.'
    : err instanceof Error
      ? err.message
      : 'Lỗi không xác định';

  res.status(500).json({
    success: false,
    message,
  });
}
