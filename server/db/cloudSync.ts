/**
 * Supabase PostgreSQL cloud synchronization for the local database.
 * Syncs the full db.json state to/from a single row in Supabase PostgreSQL
 * for persistence across Vercel serverless cold starts.
 *
 * Replaces the old Firestore cloud sync. Uses the Supabase JS client
 * (already installed for image storage) to avoid raw REST API complexity.
 *
 * Required Supabase table (run once in Supabase SQL Editor):
 *
 *   CREATE TABLE IF NOT EXISTS app_state (
 *     id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
 *     json_data JSONB NOT NULL DEFAULT '{}'::jsonb,
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 *   INSERT INTO app_state (id, json_data) VALUES (1, '{}'::jsonb)
 *   ON CONFLICT (id) DO NOTHING;
 *
 *   ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Allow anon read"  ON app_state FOR SELECT USING (true);
 *   CREATE POLICY "Allow anon insert" ON app_state FOR INSERT WITH CHECK (id = 1);
 *   CREATE POLICY "Allow anon update" ON app_state FOR UPDATE USING (id = 1);
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseSchema } from './schema.js';
import { config } from '../config.js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = config.supabaseUrl;
  const key = config.supabaseAnonKey;

  if (!url || !key) return null;

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

/**
 * Fetch database state from Supabase PostgreSQL (app_state table).
 * Returns null if Supabase is not configured, the table doesn't exist,
 * or the fetch fails for any reason — callers should fall back to
 * locally-available data.
 */
export async function fetchCloudDb(): Promise<DatabaseSchema | null> {
  try {
    const client = getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('app_state')
      .select('json_data, updated_at')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      // PGRST116 = row not found (table exists but empty)
      // 42P01   = table doesn't exist
      if (error.code === 'PGRST116') {
        console.log('[Cloud Sync] Supabase connected but app_state table is empty.');
        return null;
      }
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn(
          '[Cloud Sync] Table "app_state" chưa tồn tại trong Supabase.\n' +
          '  Vào Supabase SQL Editor và chạy lệnh CREATE TABLE trong file server/db/cloudSync.ts.'
        );
        return null;
      }
      console.warn('[Cloud Sync] Fetch error:', error.message);
      return null;
    }

    if (data && data.json_data && typeof data.json_data === 'object') {
      const db = data.json_data as DatabaseSchema;
      // Basic structural validation
      if (Array.isArray(db.products) || Array.isArray(db.categories)) {
        console.log(
          `[Cloud Sync] Loaded from Supabase — ${db.products?.length || 0} products, ` +
          `updated ${data.updated_at || 'unknown'}.`
        );
        return db;
      }
    }

    return null;
  } catch (err: any) {
    console.warn('[Cloud Sync] Fetch error:', err.message || err);
    return null;
  }
}

/**
 * Push database state to Supabase PostgreSQL (app_state table).
 * Fire-and-forget — failures are logged but never crash the server.
 *
 * @param data     The full database state to persist
 * @param _dataDir Ignored (kept for API compatibility with old Firestore sync)
 */
export function pushCloudDb(data: DatabaseSchema, _dataDir?: string): void {
  try {
    const client = getClient();
    if (!client) return;

    // The Supabase client serializes the JS object as JSONB automatically
    // Wrap in Promise.resolve() because Supabase returns PromiseLike (no .catch)
    Promise.resolve(
      client
        .from('app_state')
        .upsert(
          {
            id: 1,
            json_data: data as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
    )
      .then(({ error }) => {
        if (error) {
          if (error.message?.includes('does not exist')) {
            console.warn(
              '[Cloud Sync] Push failed — table "app_state" chưa tồn tại. Xem hướng dẫn SQL trong server/db/cloudSync.ts.'
            );
          } else {
            console.warn('[Cloud Sync] Push error:', error.message);
          }
        } else {
          console.log('[Cloud Sync] Pushed to Supabase successfully.');
        }
      })
      .catch((err: any) => {
        console.warn('[Cloud Sync] Push failed:', err.message || err);
      });
  } catch (err: any) {
    console.warn('[Cloud Sync] Push error:', err.message || err);
  }
}
