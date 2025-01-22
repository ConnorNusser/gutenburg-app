import { createClient } from '@supabase/supabase-js';

console.log('ENV vars:', {
  url: process.env.NEXT_PUBLIC_PROJECT_URL,
  key: process.env.NEXT_PUBLIC_API_KEY
});

if (!process.env.NEXT_PUBLIC_PROJECT_URL) {
  throw new Error('Missing NEXT_PUBLIC_PROJECT_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_API_KEY environment variable');
}

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_PROJECT_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabaseClient;