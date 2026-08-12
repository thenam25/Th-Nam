import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  // Priority: 1) explicit custom params, 2) env vars via config, 3) null (no hardcoded fallbacks)
  let url = (customUrl && customUrl.trim()) || config.supabaseUrl;
  const key = (customKey && customKey.trim()) || config.supabaseAnonKey;

  if (!url || !key) {
    return null;
  }

  // Auto clean URL if user pasted with /rest/v1/ or /storage/v1/ or trailing slashes
  url = url.replace(/\/rest\/v1\/?.*$/i, '').replace(/\/storage\/v1\/?.*$/i, '').replace(/\/+$/, '');

  try {
    return createClient(url, key);
  } catch (err) {
    console.error('Supabase initialization error:', err);
    return null;
  }
}

export async function uploadToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg',
  bucketName: string = 'images',
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = getSupabaseClient(customUrl, customKey);
  
  if (!supabase) {
    return {
      success: false,
      error: 'Chưa cấu hình SUPABASE_URL và SUPABASE_ANON_KEY',
    };
  }

  try {
    // Sanitize filename
    const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Ensure bucket exists or attempt upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(cleanFileName, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      let errMsg = error.message;
      if (errMsg.includes('Unexpected token') || errMsg.includes('is not valid JSON')) {
        errMsg = 'URL Supabase hoặc Khóa API Anon Key không đúng khiến máy chủ Supabase trả về trang lỗi. Vui lòng kiểm tra lại cấu hình Supabase.';
      }
      return { success: false, error: errMsg };
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(cleanFileName);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('Exception during Supabase upload:', err);
    let errMsg = err?.message || 'Lỗi tải ảnh lên Supabase';
    if (errMsg.includes('Unexpected token') || errMsg.includes('is not valid JSON')) {
      errMsg = 'URL Supabase hoặc Khóa API Anon Key không đúng (máy chủ Supabase trả về trang lỗi). Vui lòng kiểm tra lại URL (https://xyz.supabase.co) và khóa anon public.';
    }
    return { success: false, error: errMsg };
  }
}
