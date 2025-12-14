import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Server-side Supabase client
export function createServerSupabaseClient() {
  return createServerComponentClient({ cookies });
}

// Client-side Supabase client
export function createClientSupabaseClient() {
  return createClientComponentClient();
}

// Direct Supabase client (for use in API routes or server actions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

