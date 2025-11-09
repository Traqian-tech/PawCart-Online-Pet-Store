import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side use
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  // Debug logging to check environment variables
  console.log('🔍 Checking Supabase configuration:');
  console.log('  - VITE_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('  - VITE_SUPABASE_URL length:', supabaseUrl.length);
  console.log('  - VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  console.log('  - VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey.length);
  
  if (supabaseUrl) {
    console.log('  - URL starts with:', supabaseUrl.substring(0, 30) + '...');
  }
  
  if (supabaseAnonKey) {
    console.log('  - Key starts with:', supabaseAnonKey.substring(0, 20) + '...');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not configured. Password change via email will not work.');
    console.warn('   Please check your .env file contains:');
    console.warn('   VITE_SUPABASE_URL=...');
    console.warn('   VITE_SUPABASE_ANON_KEY=...');
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized for server-side use');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    return null;
  }
}



