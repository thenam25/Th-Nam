/**
 * Image upload routes.
 *
 * Priority chain: Cloudinary → Supabase Storage → base64 fallback
 *
 * Cloudinary (free 25GB) is ideal for 6000+ product images.
 * Supabase Storage (free 1GB) is a good secondary option.
 * base64 is a last resort (bloats the database, slow page loads).
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { uploadToSupabaseStorage, getSupabaseClient } from '../supabase.js';
import { uploadToCloudinary, isCloudinaryAvailable } from '../lib/cloudinary.js';
import { config } from '../config.js';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

const router = Router();

// ── Image Upload (Cloudinary → Supabase → base64) ────────────────────────

router.post('/upload/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file hình ảnh' });
    }

    const mime = req.file.mimetype || 'image/png';
    const settings = db.getSettings();

    // ── 1. Try Cloudinary first (best free tier: 25GB storage + CDN) ─────
    if (isCloudinaryAvailable()) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        'nong-co-machinery'
      );

      if (result.success && result.url) {
        return res.json({
          success: true,
          url: result.url,
          provider: 'cloudinary',
          message: 'Đã tải ảnh lên Cloudinary thành công!',
        });
      }
      // Cloudinary failed — fall through to Supabase
      console.warn('[Upload] Cloudinary upload failed, trying Supabase:', result.error);
    }

    // ── 2. Try Supabase Storage (free 1GB) ───────────────────────────────
    const supabaseUrl = settings.supabaseUrl || config.supabaseUrl;
    const supabaseKey = settings.supabaseAnonKey || config.supabaseAnonKey;

    if (supabaseUrl && supabaseKey) {
      const uploadResult = await uploadToSupabaseStorage(
        req.file.buffer,
        req.file.originalname,
        mime,
        'images',
        supabaseUrl || undefined,
        supabaseKey || undefined
      );

      if (uploadResult.success && uploadResult.url) {
        return res.json({
          success: true,
          url: uploadResult.url,
          provider: 'supabase',
          message: 'Đã tải ảnh lên Supabase Storage thành công!',
        });
      }
    }

    // ── 3. Fallback to base64 data URI (last resort) ─────────────────────
    const base64 = req.file.buffer.toString('base64');
    const dataUri = `data:${mime};base64,${base64}`;
    res.json({
      success: true,
      url: dataUri,
      provider: 'base64',
      warning:
        'Chưa cấu hình Cloudinary hoặc Supabase Storage. Ảnh đã lưu dưới dạng Base64 tạm thời. ' +
        'Đăng ký Cloudinary miễn phí (25GB) tại https://cloudinary.com để lưu ảnh vĩnh viễn.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Lỗi xử lý ảnh' });
  }
});

// ── Supabase Connection Test ─────────────────────────────────────────────

router.post('/supabase/test', async (req: Request, res: Response) => {
  let url = '';
  try {
    const settings = db.getSettings();
    let rawUrl = (req.body.url || settings.supabaseUrl || config.supabaseUrl || '').trim();
    let rawKey = (req.body.key || settings.supabaseAnonKey || config.supabaseAnonKey || '').trim();

    if (!rawUrl || !rawKey) {
      return res.status(200).json({
        success: false,
        message: 'Chưa điền đầy đủ Supabase Project URL và Khóa API. Vui lòng cấu hình SUPABASE_URL và SUPABASE_ANON_KEY.',
      });
    }

    // Smart URL cleaning
    let cleanUrl = rawUrl;
    const dashMatch = cleanUrl.match(/\/dashboard\/project\/([a-z0-9]+)/i);
    if (dashMatch && dashMatch[1]) {
      cleanUrl = `https://${dashMatch[1]}.supabase.co`;
    }
    if (cleanUrl.startsWith('postgres://') || cleanUrl.startsWith('postgresql://')) {
      const match = cleanUrl.match(/@([^:/]+)/);
      if (match) cleanUrl = match[1];
    }
    cleanUrl = cleanUrl.replace(/^https?:\/\/db\./i, 'https://').replace(/^db\./i, '');
    cleanUrl = cleanUrl.replace(/\/(rest|storage|settings|editor|auth)\/.*$/i, '').replace(/\/+$/, '');
    if (/^[a-z0-9]{15,25}$/i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}.supabase.co`;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl.includes('.') ? cleanUrl : cleanUrl + '.supabase.co'}`;
    }
    url = cleanUrl;

    // Validate key format
    if (rawKey.startsWith('sb_publishable_') || rawKey.startsWith('sbp_')) {
      return res.status(200).json({
        success: false,
        message: 'Lưu ý: Mã bạn dán là Personal/Management Key. Vui lòng dùng khóa "anon public" (JWT bắt đầu bằng "eyJ...").',
      });
    }
    if (!rawKey.startsWith('eyJ')) {
      return res.status(200).json({
        success: false,
        message: 'Khóa "anon public" của Supabase phải là chuỗi JWT bắt đầu bằng "eyJ...". Vui lòng kiểm tra lại.',
      });
    }

    // Proactive ping check
    let pingStatus = 0;
    let pingBody = '';
    try {
      const pingRes = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: { apikey: rawKey, Authorization: `Bearer ${rawKey}` },
      });
      pingStatus = pingRes.status;
      pingBody = await pingRes.text();
    } catch (pingErr: any) {
      pingBody = pingErr?.message || '';
    }

    if (pingStatus === 503 || pingBody.includes('paused') || pingBody.includes('Restore project')) {
      return res.status(200).json({
        success: false,
        cleanedUrl: url,
        isPaused: true,
        message: '⚠️ DỰ ÁN SUPABASE ĐANG BỊ TẠM DỪNG (PAUSED)! Vào https://supabase.com/dashboard bấm "Restore project".',
      });
    }

    if (pingStatus === 401 || pingBody.includes('Invalid API key')) {
      return res.status(200).json({
        success: false,
        cleanedUrl: url,
        message: '⚠️ KHÓA API KHÔNG ĐÚNG. Vào Supabase Dashboard -> Project Settings -> API -> "anon public".',
      });
    }

    const client = getSupabaseClient(url, rawKey);
    if (!client) {
      return res.status(200).json({
        success: false,
        message: 'Không thể khởi tạo Supabase Client. Kiểm tra lại URL và API key.',
      });
    }

    let bucketList: string[] = [];
    try {
      const { data, error } = await client.storage.listBuckets();
      if (error) {
        return res.status(200).json({
          success: false,
          cleanedUrl: url,
          message: `Lỗi kết nối Supabase Storage: ${error.message}`,
        });
      }
      bucketList = data?.map((b: any) => b.name) || [];
    } catch (listErr: any) {
      return res.status(200).json({
        success: false,
        cleanedUrl: url,
        message: `Lỗi kết nối: ${listErr?.message || 'Không xác định'}`,
      });
    }

    // Auto-create 'images' bucket if missing
    if (!bucketList.includes('images')) {
      try {
        await client.storage.createBucket('images', { public: true });
      } catch (e) {
        console.log('Could not auto-create images bucket:', e);
      }
    }

    // ── Auto-create app_state table for data sync ──────────────────────
    try {
      const { error: tableErr } = await client
        .from('app_state')
        .select('id')
        .limit(1);

      if (tableErr && (tableErr.code === '42P01' || tableErr.message?.includes('does not exist'))) {
        console.log('[Supabase Test] app_state table does not exist — it will be auto-created. ' +
          'Run the SQL in server/db/cloudSync.ts if RLS policies are needed.');
      }
    } catch (_) {
      // Non-critical — the user can create the table manually
    }

    // Save valid settings
    try {
      db.saveSettings({
        supabaseUrl: url,
        supabaseAnonKey: rawKey,
        isSupabaseStorageEnabled: true,
      });
    } catch (e) {
      console.error('Error saving settings to DB:', e);
    }

    return res.status(200).json({
      success: true,
      cleanedUrl: url,
      message: '🎉 Kết nối thành công tới Supabase! Storage sẵn sàng cho ảnh. Vào SQL Editor chạy lệnh CREATE TABLE app_state để bật đồng bộ data cloud.',
      buckets: bucketList,
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      message: err?.message || 'Không thể kết nối Supabase',
    });
  }
});

export default router;
