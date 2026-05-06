const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mnqlpolzsbbtzkkjsldx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucWxwb2x6c2JidHpra2pzbGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY2Mjc4NSwiZXhwIjoyMDkyMjM4Nzg1fQ.lp6Xoop-21iQVQFxbGLMvYfM-xNDZqnEgWkji503Lno';

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_TS = '2024-01-01T00:00:00.000Z';
const p = (name) => `/assets/punjabi/${name}`;

const CATALOG_PLACEHOLDER_IMAGES = {
  productCasual: p('1-1.webp'),
  productCasualSecondary: p('1-2.webp'),
  productPremium: p('Blue-1-1.webp'),
  productWedding: p('Merun-KC-2.webp'),
  productWeddingSecondary: p('1-34.webp'),
  productSummer: p('Off-White-1.webp'),
};

const products = [
  {
    type: 'panjabi',
    category: 'casual',
    name: 'Classic Casual Panjabi',
    name_bn: 'ক্লাসিক পাঞ্জাবি',
    base_price: 800,
    stitching_charge: 450,
    image_urls: [
      CATALOG_PLACEHOLDER_IMAGES.productCasualSecondary,
      CATALOG_PLACEHOLDER_IMAGES.productCasual,
    ],
    is_active: true,
  },
  {
    type: 'panjabi',
    category: 'premium',
    name: 'Premium Navy Panjabi',
    name_bn: 'প্রিমিয়াম নেভি পাঞ্জাবি',
    base_price: 1200,
    stitching_charge: 450,
    image_urls: [
      CATALOG_PLACEHOLDER_IMAGES.productCasual,
      CATALOG_PLACEHOLDER_IMAGES.productPremium,
    ],
    is_active: true,
  },
  {
    type: 'panjabi',
    category: 'wedding',
    name: 'Wedding Embroidered',
    name_bn: 'ওয়েডিং পাঞ্জাবি',
    base_price: 2500,
    stitching_charge: 550,
    image_urls: [
      CATALOG_PLACEHOLDER_IMAGES.productWedding,
      CATALOG_PLACEHOLDER_IMAGES.productWeddingSecondary,
    ],
    is_active: true,
  },
  {
    type: 'panjabi',
    category: 'casual',
    name: 'Off White Summer',
    name_bn: 'অফ হোয়াইট পাঞ্জাবি',
    base_price: 900,
    stitching_charge: 450,
    image_urls: [CATALOG_PLACEHOLDER_IMAGES.productSummer],
    is_active: true,
  },
];

const fabrics = [
  { 
    name: 'Premium Cotton',
    fabric_type: 'plain', 
    description: 'Soft & breathable',
    price_per_yard: 180,
    in_stock: true
  },
  { 
    name: 'Linen Blend',
    fabric_type: 'linen', 
    description: 'Cool & lightweight',
    price_per_yard: 220,
    in_stock: true
  },
  { 
    name: 'Silk Blend',
    fabric_type: 'silk', 
    description: 'Lustrous premium',
    price_per_yard: 350,
    in_stock: true
  },
  { 
    name: 'Cotton Check',
    fabric_type: 'check', 
    description: 'Classic pattern',
    price_per_yard: 200,
    in_stock: true
  },
  { 
    name: 'Striped Cotton',
    fabric_type: 'stripe', 
    description: 'Elegant stripes',
    price_per_yard: 190,
    in_stock: true
  },
  { 
    name: 'Embroidered Muslin',
    fabric_type: 'embroidery', 
    description: 'Traditional craft',
    price_per_yard: 420,
    in_stock: true
  },
  { 
    name: 'Jacquard Weave',
    fabric_type: 'jacquard', 
    description: 'Rich textured motif',
    price_per_yard: 550,
    in_stock: true
  },
  { 
    name: 'Polka Dot',
    fabric_type: 'dots', 
    description: 'Playful dotted pattern',
    price_per_yard: 210,
    in_stock: true
  },
  { 
    name: 'Wavy Texture',
    fabric_type: 'wave', 
    description: 'Modern abstract design',
    price_per_yard: 280,
    in_stock: true
  },
];

const collars = [
  { name: 'Band Collar', type: 'collar', price_addition: 0, sort_order: 1 },
  { name: 'V-Neck', type: 'collar', price_addition: 0, sort_order: 2 },
  { name: 'Round Neck', type: 'collar', price_addition: 0, sort_order: 3 },
  { name: 'Mandarin', type: 'collar', price_addition: 0, sort_order: 4 }
];

async function migrate() {
  console.log('Migrating products...');
  for (const p of products) {
    const { data: existing } = await supabase.from('products').select('id').eq('name', p.name);
    if (!existing || existing.length === 0) {
      await supabase.from('products').insert(p);
      console.log(`Inserted product: ${p.name}`);
    } else {
      console.log(`Product already exists: ${p.name}`);
    }
  }

  console.log('Migrating fabrics...');
  for (const f of fabrics) {
    const { data: existing } = await supabase.from('fabrics').select('id').eq('name', f.name);
    if (!existing || existing.length === 0) {
      await supabase.from('fabrics').insert(f);
      console.log(`Inserted fabric: ${f.name}`);
    } else {
      console.log(`Fabric already exists: ${f.name}`);
    }
  }

  console.log('Migrating collars...');
  for (const c of collars) {
    const { data: existing } = await supabase.from('design_options').select('id').eq('name', c.name).eq('type', 'collar');
    if (!existing || existing.length === 0) {
      await supabase.from('design_options').insert(c);
      console.log(`Inserted collar: ${c.name}`);
    } else {
      console.log(`Collar already exists: ${c.name}`);
    }
  }
  
  console.log('Done!');
}

migrate();
