
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rujhawbwhunbrrcinoif.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1amhhd2J3aHVuYnJyY2lub2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzMxMDgsImV4cCI6MjA1NzM0OTEwOH0.Lm0_YYmjGxdb91twTv2VZzN1zjgUEHFa5BQlU7-I1bA";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Log any auth changes - helpful for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session);
});
