// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
const supabaseKey = "YOUR_ANON_PUBLIC_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);
