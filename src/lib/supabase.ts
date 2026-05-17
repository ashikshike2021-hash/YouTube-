import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://afyrgubuigjmykzguoyh.supabase.co';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_x7Vl_b9sKahgcbRgaj-6gQ_9B8goorH';

export const supabase = createClient(supabaseUrl, supabaseKey);
