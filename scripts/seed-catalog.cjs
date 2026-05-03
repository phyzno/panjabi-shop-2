/**
 * Seeds products (and fabrics if empty) using the service role key.
 * Run: node --env-file=.env.local scripts/seed-catalog.cjs
 *
 * First apply DB columns (if your project predates the full schema):
 *   supabase/migrations/0001_add_missing_product_columns.sql
 * in Supabase → SQL Editor, or `supabase db push`.
 *
 * Dummy images: paths under /public → stored as /assets/punjabi/<file>.webp.
 * Admin uploads: full https://...supabase.co/storage/... URLs in image_urls.
 *
 * The anon key cannot insert past RLS; use the service role only on your machine / CI, never in the browser.
 */

const { createClient } = require('@supabase/supabase-js')

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
        type: 'panjabi',
        category: 'casual',
        name: 'Classic Casual Panjabi',
        name_bn: 'ক্লাসিক পাঞ্জাবি',
        base_price: 800,
        stitching_charge: 450,
        image_urls: ['/assets/punjabi/1-2.webp', '/assets/punjabi/1-1.webp'],
        is_active: true,
      },
      {
        type: 'panjabi',
        category: 'premium',
        name: 'Premium Navy Panjabi',
        name_bn: 'প্রিমিয়াম নেভি পাঞ্জাবি',
        base_price: 1200,
        stitching_charge: 450,
        image_urls: ['/assets/punjabi/1-1.webp', '/assets/punjabi/Blue-1-1.webp'],
        is_active: true,
      },
      {
        type: 'panjabi',
        category: 'wedding',
        name: 'Wedding Embroidered',
        name_bn: 'ওয়েডিং পাঞ্জাবি',
        base_price: 2500,
        stitching_charge: 550,
        image_urls: ['/assets/punjabi/Merun-KC-2.webp', '/assets/punjabi/1-34.webp'],
        is_active: true,
      },
      {
        type: 'panjabi',
        category: 'casual',
        name: 'Off White Summer',
        name_bn: 'অফ হোয়াইট পাঞ্জাবি',
        base_price: 900,
        stitching_charge: 450,
        image_urls: ['/assets/punjabi/Off-White-1.webp'],
        is_active: true,
      },
    ])

    if (insErr) {
      console.error('Product seed failed:', insErr.message)
      if (String(insErr.message).includes('image_urls')) {
        console.error(
          '\nAdd the missing column: open supabase/migrations/0001_add_missing_product_columns.sql in the Supabase SQL Editor and run it, then try again.\n'
        )
      }
      process.exit(1)
    }
    console.log('Inserted 4 sample products.')
  }

  const { count: fabricCount } = await sb
    .from('fabrics')
    .select('*', { count: 'exact', head: true })

  if (!fabricCount) {
    const { error: fErr } = await sb.from('fabrics').insert([
      { name: 'Premium Cotton', name_bn: 'প্রিমিয়াম কটন', fabric_type: 'plain', price_per_yard: 180, description: 'Soft breathable cotton' },
      { name: 'Linen Blend', name_bn: 'লিনেন ব্লেন্ড', fabric_type: 'linen', price_per_yard: 220, description: 'Cool and lightweight' },
      { name: 'Silk Blend', name_bn: 'সিল্ক মিশ্রণ', fabric_type: 'silk', price_per_yard: 350, description: 'Lustrous premium fabric' },
      { name: 'Cotton Check', name_bn: 'চেক কটন', fabric_type: 'check', price_per_yard: 200, description: 'Classic check pattern' },
      { name: 'Striped Cotton', name_bn: 'স্ট্রাইপ কটন', fabric_type: 'stripe', price_per_yard: 190, description: 'Elegant vertical stripes' },
      { name: 'Embroidered Muslin', name_bn: 'এমব্রয়ডারি মসলিন', fabric_type: 'embroidery', price_per_yard: 420, description: 'Traditional embroidered' },
    ])
    if (fErr) console.warn('Fabric seed skipped:', fErr.message)
    else console.log('Inserted sample fabrics.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
