// TICKET-004
'use strict';

const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || 'http://localhost';
const key = process.env.SUPABASE_ANON_KEY || 'placeholder';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('[Supabase] SUPABASE_URL o SUPABASE_ANON_KEY no configurados');
}

const supabase = createClient(url, key);

module.exports = { supabase };
