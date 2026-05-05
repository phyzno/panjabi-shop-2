const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://mnqlpolzsbbtzkkjsldx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucWxwb2x6c2JidHpra2pzbGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY2Mjc4NSwiZXhwIjoyMDkyMjM4Nzg1fQ.lp6Xoop-21iQVQFxbGLMvYfM-xNDZqnEgWkji503Lno'
);

async function run() {
  const { data, error } = await supabase.from('fabrics').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Fabrics columns:', Object.keys(data[0]));
  } else {
    console.log('No fabrics found or error:', error);
  }

  const { data: cData, error: cError } = await supabase.from('design_options').select('*').limit(1);
  if (cData && cData.length > 0) {
    console.log('Design Options columns:', Object.keys(cData[0]));
  } else {
    console.log('No collars found or error:', cError);
  }
}
run();
