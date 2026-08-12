/**
 * Cloudinary image upload integration.
 *
 * Cloudinary free tier: 25GB storage + 25GB bandwidth/month.
 * Perfect for ~6000 product images at optimal WebP compression.
 *
 * Setup:
 *   1. Sign up at https://cloudinary.com (free)
 *   2. Get Cloud Name, API Key, API Secret from Dashboard
 *   3. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars
 */

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from '../config.js';

const isConfigured = Boolean(
  config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    secure: true,
  });
  console.log('[Cloudinary] Đã cấu hình thành công.');
}

export function isCloudinaryAvailable(): boolean {
  return isConfigured;
}

/**
 * Upload an image buffer to Cloudinary.
 *
 * @param buffer   Image file buffer
 * @param fileName Original filename (used for public_id sanitization)
 * @param folder   Cloudinary folder name (default: "nong-co-machinery")
 * @returns        Success status + secure HTTPS URL, or error message
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  folder: string = 'nong-co-machinery'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isConfigured) {
    return { success: false, error: 'Cloudinary chưa được cấu hình. Vui lòng set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.' };
  }

  // Sanitize filename for public_id
  const safeName = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${folder}/${Date.now()}_${safeName}`;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: 'Upload lên Cloudinary bị timeout sau 30 giây.' });
    }, 30_000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        // Auto-optimize: best quality at smallest size
        quality: 'auto:good',
        fetch_format: 'auto', // Serves WebP to browsers that support it
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      },
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        clearTimeout(timeout);
        if (error) {
          console.error('[Cloudinary] Upload error:', error.message);
          resolve({ success: false, error: `Lỗi Cloudinary: ${error.message}` });
        } else if (result?.secure_url) {
          resolve({ success: true, url: result.secure_url });
        } else {
          resolve({ success: false, error: 'Cloudinary không trả về URL.' });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generate a transformed (resized/optimized) Cloudinary URL.
 * Use for responsive images without modifying the original.
 *
 * @param baseUrl The original Cloudinary secure_url
 * @param width   Desired width in pixels
 * @returns       URL with transformation parameters injected
 */
export function getOptimizedUrl(baseUrl: string, width: number = 800): string {
  if (!baseUrl.includes('cloudinary.com')) return baseUrl;

  // Inject transformation: f_auto (auto format), q_auto (auto quality), w_<width> (resize)
  return baseUrl.replace(
    '/upload/',
    `/upload/f_auto,q_auto:good,w_${width}/`
  );
}
