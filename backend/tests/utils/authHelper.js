const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oajdvgnposlxdzhieaqx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hamR2Z25wb3NseGR6aGllYXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODUwNDEsImV4cCI6MjA5MzI2MTA0MX0.-Xxxmpsn1-j1_ISqnKkQuIXIlcZhHLtiilsOAAVrTSk'
);

async function getToken() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'edgarcia9@espe.edu.ec',
    password: '12345678'
  });

  if (error) {
    throw new Error('Error obteniendo token');
  }

  return data.session.access_token;
}

module.exports = { getToken };