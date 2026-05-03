/**
 * Local dummy catalog art under `public/assets/punjabi/` (original filenames).
 * Source photos: Unsplash License — cream/blue/white kurtas & wedding sherwani poses
 * (ethnic-wear search; bundled as WebP for reliable Next/Image + offline deploys).
 */
import { LOCAL_PUNJABI_ASSETS } from '@/lib/productImages'

const p = (name: string) => `${LOCAL_PUNJABI_ASSETS}/${name}`

export const CATALOG_PLACEHOLDER_IMAGES = {
  hero: p('1-1.webp'),
  categoryPanjabi: p('1-1.webp'),
  categoryPayjama: p('1-2.webp'),
  categorySets: p('1-29.webp'),
  categoryReadymade: p('1-31.webp'),
  productCasual: p('1-1.webp'),
  productCasualSecondary: p('1-2.webp'),
  productPremium: p('Blue-1-1.webp'),
  productWedding: p('Merun-KC-2.webp'),
  productWeddingSecondary: p('1-34.webp'),
  productSummer: p('Off-White-1.webp'),
} as const
