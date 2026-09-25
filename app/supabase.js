import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usbqnkkzkuuqykwtabgq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYnFua2t6a3V1cXlrd3RhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMTUxOTcsImV4cCI6MjEwNTg5MTE5N30.5r_5V-KjBhzgHNsz6RmKgGSzoxRHji2ujuCuLvNbtyU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);