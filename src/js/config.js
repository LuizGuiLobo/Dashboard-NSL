// ══════════════════════════════════════════════════
// MÓDULO: CONFIG
// Credenciais Supabase — URL e ANON KEY
// Claude Code: claude src/js/config.js
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════
// SUPABASE CONFIG
// ══════════════════════════════════════════
const SUPABASE_URL = 'https://yfnfcdxmirvfhzphuigy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbmZjZHhtaXJ2Zmh6cGh1aWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTI1MzAsImV4cCI6MjA4ODk4ODUzMH0.RsZrKMsXtPuih_jyP_Q3eXX9yIuI_qGcY7U9QFqo2aI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);