const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://mnqlpolzsbbtzkkjsldx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucWxwb2x6c2JidHpra2pzbGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY2Mjc4NSwiZXhwIjoyMDkyMjM4Nzg1fQ.lp6Xoop-21iQVQFxbGLMvYfM-xNDZqnEgWkji503Lno'
);

async function run() {
  const fabricData = {
    name: 'Test Fabric',
    price_per_yard: 100
  };
  const { data, error } = await supabase.from('fabrics').insert(fabricData).select();
  console.log('Fabric insert minimal:', data, error);
}
run();
