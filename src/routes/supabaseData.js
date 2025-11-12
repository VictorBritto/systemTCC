// supabaseData.js
import { createClient } from '@supabase/supabase-js';

// URL e API Key do seu banco de dados de sensores
const supabaseUrl = "https://mxrpublkedbpliiylpqx.supabase.co";
const supabaseApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cnB1YmxrZWRicGxpaXlscHF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjYxMzMxNywiZXhwIjoyMDU4MTg5MzE3fQ.FuEd_zLa3TsFff06fNNABPvBWCn17uDmXxxWpRE54qE";

export const supabaseData = createClient(supabaseUrl, supabaseApiKey);
