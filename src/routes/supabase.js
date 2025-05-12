// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ejhzykrpxqdtkngmuxqv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaHp5a3JweHFkdGtuZ211eHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0ODkwNTYsImV4cCI6MjA2MjA2NTA1Nn0.63yUncBc4v2RncYxiQwqGwqK1a8H1x9YX_omcNYlHzA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
