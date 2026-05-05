const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://mnqlpolzsbbtzkkjsldx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucWxwb2x6c2JidHpra2pzbGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY2Mjc4NSwiZXhwIjoyMDkyMjM4Nzg1fQ.lp6Xoop-21iQVQFxbGLMvYfM-xNDZqnEgWkji503Lno'
);

async function run() {
  const fabricData = {
    name: 'Test Fabric',
    name_bn: 'টেস্ট ফেব্রিক',
    fabric_type: 'plain',
    description: 'Test',
    price_per_yard: 100,
    color_hex: '#ffffff',
    image_url: 'https://example.com/test.png',
    youtube_url: null,
    in_stock: true,
  };
  const { data, error } = await supabase.from('fabrics').insert(fabricData).select();
  console.log('Fabric insert:', data, error);
  
  const collarData = {
    type: 'collar',
    name: 'Test Collar',
    name_bn: null,
    image_url: null,
    price_addition: 0,
    for_product: 'panjabi',
    sort_order: 0,
  }
  const { data: cData, error: cError } = await supabase.from('design_options').insert(collarData).select()
  console.log('Collar insert:', cData, cError);
}
run();
