import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://guzihaueaifsikuihysr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1emloYXVlYWlmc2lrdWloeXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMDk4NTUsImV4cCI6MjA5OTc4NTg1NX0.OOaSlzuj1zJia005ePwi9t_-W4Qz5qylbUchfHpC22w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
