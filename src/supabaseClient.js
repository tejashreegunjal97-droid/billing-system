import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://begzzsgnniwzoxtrcfrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZ3p6c2dubml3em94dHJjZnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjMxMDUsImV4cCI6MjA3MDAzOTEwNX0.TC8eDVxP-RKpv-hZanPMZySzfmMXrRnlaLqZlKRFPnY';

export const supabase = createClient(supabaseUrl, supabaseKey);
