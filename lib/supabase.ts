import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxcrswziszmzpgphyujo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('[Supabase] Gagal menginisialisasi client Supabase:', err);
  }
}

export const supabase = client;

export const isSupabaseConfigured = Boolean(client);
