/**
 * Seeds products (and fabrics if empty) using the service role key.
 * Run: node --env-file=.env.local scripts/seed-catalog.cjs
 *
 * This seed targets the current app schema:
 *   products.id and fabrics.id are text IDs/SKUs.
 *
 * Local placeholder images live under public/assets.
 *
 * The anon key cannot insert past RLS; use the service role only on your machine / CI, never in the browser.
 */

const { createClient } = require('@supabase/supabase-js')

const P = '/assets/punjabi'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then run:\n  node --env-file=.env.local scripts/seed-catalog.cjs'
    )
    process.exit(1)
  }

  const sb = createClient(url, key, { auth: { persistSession: false } })

  const { count: productCount, error: countErr } = await sb
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (countErr) {
    console.error('Failed to count products:', countErr.message)
    process.exit(1)
  }

  if (productCount && productCount > 0) {
    console.log('Products already seeded:', productCount)
  } else {
    const { error: insErr } = await sb.from('products').insert([
      {
        id: 'PNJ-001',
        name: 'Classic Casual Panjabi',
        description: 'A comfortable everyday panjabi for regular wear.',
        price: 800,
        discount_percentage: 0,
        sizes: ['S', 'M', 'L', 'XL'],
        stock: { S: 12, M: 18, L: 14, XL: 8 },
        images: ['/assets/customizable-punjabi.png'],
      },
      {
        id: 'PNJ-002',
        name: 'Premium Navy Panjabi',
        description: 'A richer option with a polished look.',
        price: 1200,
        discount_percentage: 10,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: { S: 6, M: 10, L: 10, XL: 5, XXL: 3 },
        images: ['/assets/customizable-punjabi.png'],
      },
      {
        id: 'PNJ-003',
        name: 'Wedding Embroidered',
        description: 'Statement piece for wedding and festive wear.',
        price: 2500,
        discount_percentage: 0,
        sizes: ['38', '40', '42', '44', '46'],
        stock: { '38': 4, '40': 6, '42': 5, '44': 3, '46': 2 },
        images: ['/assets/customizable-punjabi.png'],
      },
      {
        id: 'PNJ-004',
        name: 'Off White Summer',
        description: 'Lightweight option for warmer days.',
        price: 900,
        discount_percentage: 0,
        sizes: ['S', 'M', 'L'],
        stock: { S: 10, M: 10, L: 7 },
        images: ['/assets/customizable-punjabi.png'],
      },
    ])

    if (insErr) {
      console.error('Product seed failed:', insErr.message)
      process.exit(1)
    }
    console.log('Inserted 4 sample products.')
  }

  const { count: fabricCount } = await sb
    .from('fabrics')
    .select('*', { count: 'exact', head: true })

  if (!fabricCount) {
    const { error: fErr } = await sb.from('fabrics').insert([
      {
        id: 'FAB-001',
        name: 'Premium Cotton',
        description: 'Soft breathable cotton',
        price: 180,
        discount_percentage: 0,
        colors: ['White', 'Ivory'],
        patterns: ['Plain'],
        yards: 120,
        texture_url: '/assets/customizable-punjabi.png',
        raw_image_url: '/assets/customizable-punjabi.png',
        preview_images: ['/assets/customizable-punjabi.png'],
        allowed_products: ['Panjabi', 'Shirt'],
        is_active: true,
      },
      {
        id: 'FAB-002',
        name: 'Linen Blend',
        description: 'Cool and lightweight',
        price: 220,
        discount_percentage: 0,
        colors: ['Sand', 'Beige'],
        patterns: ['Plain'],
        yards: 90,
        texture_url: '/assets/customizable-punjabi.png',
        raw_image_url: '/assets/customizable-punjabi.png',
        preview_images: ['/assets/customizable-punjabi.png'],
        allowed_products: ['Panjabi', 'Jubba'],
        is_active: true,
      },
      {
        id: 'FAB-003',
        name: 'Silk Blend',
        description: 'Lustrous premium fabric',
        price: 350,
        discount_percentage: 0,
        colors: ['Navy', 'Black'],
        patterns: ['Solid'],
        yards: 70,
        texture_url: '/assets/customizable-punjabi.png',
        raw_image_url: '/assets/customizable-punjabi.png',
        preview_images: ['/assets/customizable-punjabi.png'],
        allowed_products: ['Panjabi'],
        is_active: true,
      },
      {
        id: 'FAB-004',
        name: 'Cotton Check',
        description: 'Classic check pattern',
        price: 200,
        discount_percentage: 0,
        colors: ['Blue', 'White'],
        patterns: ['Check'],
        yards: 100,
        texture_url: '/assets/customizable-punjabi.png',
        raw_image_url: '/assets/customizable-punjabi.png',
        preview_images: ['/assets/customizable-punjabi.png'],
        allowed_products: ['Panjabi', 'Shirt'],
        is_active: true,
      },
      {
        id: 'FAB-005',
        name: 'Striped Cotton',
        description: 'Elegant vertical stripes',
        price: 190,
        discount_percentage: 0,
        colors: ['Blue', 'White'],
        patterns: ['Stripe'],
        yards: 110,
        texture_url: '/assets/customizable-punjabi.png',
        raw_image_url: '/assets/customizable-punjabi.png',
        preview_images: ['/assets/customizable-punjabi.png'],
        allowed_products: ['Panjabi', 'Jubba'],
        is_active: true,
      },
      {
        id: 'FAB-006',
        name: 'Embroidered Muslin',
        description: 'Traditional embroidered',
        price: 420,
        discount_percentage: 0,
        colors: ['Cream', 'Gold'],
        patterns: ['Embroidery'],
        yards: 45,
        texture_url: '/assets/customizable-punjabi.png',
        raw_image_url: '/assets/customizable-punjabi.png',
        preview_images: ['/assets/customizable-punjabi.png'],
        allowed_products: ['Panjabi'],
        is_active: true,
      },
    ])
    if (fErr) console.warn('Fabric seed skipped:', fErr.message)
    else console.log('Inserted sample fabrics.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
