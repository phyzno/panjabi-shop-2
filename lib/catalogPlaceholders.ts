/**
 * Remote placeholder images when the repo has no /public/assets/punjabi files
 * or when pointing at an empty Supabase catalog (demo / Vercel preview).
 */
export const CATALOG_PLACEHOLDER_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1617137968427-85924c2a0513?auto=format&fit=crop&w=900&q=80',
  categoryPanjabi:
    'https://images.unsplash.com/photo-1593030760367-fc529440fe6b?auto=format&fit=crop&w=800&q=80',
  categoryPayjama:
    'https://images.unsplash.com/photo-1596755094514-f87c084fc8f9?auto=format&fit=crop&w=800&q=80',
  categorySets:
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
  categoryReadymade:
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
  productCasual:
    'https://images.unsplash.com/photo-1593030760367-fc529440fe6b?auto=format&fit=crop&w=600&q=80',
  productPremium:
    'https://images.unsplash.com/photo-1596755094514-f87c084fc8f9?auto=format&fit=crop&w=600&q=80',
  productWedding:
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  productSummer:
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
} as const

export const DEFAULT_PRODUCT_IMAGE = CATALOG_PLACEHOLDER_IMAGES.productCasual
