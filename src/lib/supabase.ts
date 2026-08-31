import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://shqmmrwamvnwsgxmwres.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7h8LukgY5QprffRik088NA_fxDES06N';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  }
});
