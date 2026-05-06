const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mnqlpolzsbbtzkkjsldx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucWxwb2x6c2JidHpra2pzbGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY2Mjc4NSwiZXhwIjoyMDkyMjM4Nzg1fQ.lp6Xoop-21iQVQFxbGLMvYfM-xNDZqnEgWkji503Lno';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('products').select('*');
  console.log('Products in DB:', data ? data.map(p => ({ id: p.id, name: p.name, image_url: p.image_url, image_urls: p.image_urls })) : error);
}
run();
