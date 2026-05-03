import { CATALOG_PLACEHOLDER_IMAGES } from '@/lib/catalogPlaceholders'

/** Matches scripts/seed-catalog.cjs sample rows; used when `products` is empty. */
export interface DemoCatalogProduct {
  id: string
  type: string
  category: string
  name: string
  name_bn: string | null
  description: string | null
  base_price: number
  stitching_charge: number
  image_urls: string[]
  is_active: boolean
  created_at: string
}

const DEMO_TS = '2024-01-01T00:00:00.000Z'

export function getDemoCatalog(): DemoCatalogProduct[] {
  return [
    {
      id: 'a1000000-0000-4000-8000-000000000001',
      type: 'panjabi',
      category: 'casual',
      name: 'Classic Casual Panjabi',
      name_bn: 'ক্লাসিক পাঞ্জাবি',
      description: null,
      base_price: 800,
      stitching_charge: 450,
      image_urls: [
        CATALOG_PLACEHOLDER_IMAGES.productCasualSecondary,
        CATALOG_PLACEHOLDER_IMAGES.productCasual,
      ],
      is_active: true,
      created_at: DEMO_TS,
    },
    {
      id: 'a1000000-0000-4000-8000-000000000002',
      type: 'panjabi',
      category: 'premium',
      name: 'Premium Navy Panjabi',
      name_bn: 'প্রিমিয়াম নেভি পাঞ্জাবি',
      description: null,
      base_price: 1200,
      stitching_charge: 450,
      image_urls: [
        CATALOG_PLACEHOLDER_IMAGES.productCasual,
        CATALOG_PLACEHOLDER_IMAGES.productPremium,
      ],
      is_active: true,
      created_at: DEMO_TS,
    },
    {
      id: 'a1000000-0000-4000-8000-000000000003',
      type: 'panjabi',
      category: 'wedding',
      name: 'Wedding Embroidered',
      name_bn: 'ওয়েডিং পাঞ্জাবি',
      description: null,
      base_price: 2500,
      stitching_charge: 550,
      image_urls: [
        CATALOG_PLACEHOLDER_IMAGES.productWedding,
        CATALOG_PLACEHOLDER_IMAGES.productWeddingSecondary,
      ],
      is_active: true,
      created_at: DEMO_TS,
    },
    {
      id: 'a1000000-0000-4000-8000-000000000004',
      type: 'panjabi',
      category: 'casual',
      name: 'Off White Summer',
      name_bn: 'অফ হোয়াইট পাঞ্জাবি',
      description: null,
      base_price: 900,
      stitching_charge: 450,
      image_urls: [CATALOG_PLACEHOLDER_IMAGES.productSummer],
      is_active: true,
      created_at: DEMO_TS,
    },
  ]
}

export function getDemoCategoryList(): string[] {
  return Array.from(new Set(getDemoCatalog().map((p) => p.category)))
}
