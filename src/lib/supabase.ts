// ============================================================
// Supabase Client Configuration
// ============================================================
// To connect to a real Supabase instance, set these env vars:
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If no Supabase creds, we run in local-only mode
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export default supabase;
