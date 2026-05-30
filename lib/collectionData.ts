import type { CollectionProduct } from '@/components/shop/ProductCard';

export const collectionSafeImages = [
  'https://images.unsplash.com/photo-1774527929835-282b1b85cd3a?auto=format&fit=crop&q=80&w=800',
  'https://plus.unsplash.com/premium_photo-1691030256214-dc57034ec935?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1734418044295-9be3b4766d52?auto=format&fit=crop&q=80&w=800',
] as const;

export const collectionCategories = [
  'Wedding',
  'Casual',
  'Party',
  'Exclusive',
  'Summer Edition',
] as const;

export const collectionProducts: CollectionProduct[] = [
  {
    id: 'w1',
    name: 'Royal Zardosi Silk',
    category: 'Wedding',
    price: '৳ 12,500',
    images: [...collectionSafeImages],
    description:
      'Experience true royalty with our handcrafted Zardosi Silk Panjabi. Intricate detailing meets premium fabric for your special day.',
  },
  {
    id: 'w2',
    name: 'Emerald Brocade',
    category: 'Wedding',
    price: '৳ 14,200',
    images: [collectionSafeImages[1], collectionSafeImages[0], collectionSafeImages[2]],
    description:
      'A masterpiece in rich emerald green. The heavy brocade work ensures you stand out with unmatched elegance and tradition.',
  },
  {
    id: 'w3',
    name: 'Crimson Velvet Suit',
    category: 'Wedding',
    price: '৳ 16,500',
    images: [collectionSafeImages[2], collectionSafeImages[1], collectionSafeImages[0]],
    description:
      'Deep crimson velvet tailored to perfection. A bold and majestic choice for the modern groom.',
  },
  {
    id: 'w4',
    name: 'Golden Embroidery Silk',
    category: 'Wedding',
    price: '৳ 18,000',
    images: [...collectionSafeImages],
    description:
      'Luxurious silk embellished with fine golden thread work. Radiate elegance on your most important day.',
  },
  {
    id: 'w5',
    name: 'Pearl White Sherwani',
    category: 'Wedding',
    price: '৳ 22,000',
    images: [collectionSafeImages[1], collectionSafeImages[2], collectionSafeImages[0]],
    description:
      'Classic pearl white sherwani with subtle self-design. Minimalist yet profoundly royal.',
  },
  {
    id: 'w6',
    name: 'Sapphire Groom Suit',
    category: 'Wedding',
    price: '৳ 15,800',
    images: [collectionSafeImages[0], collectionSafeImages[2], collectionSafeImages[1]],
    description:
      'Stand out in deep sapphire. Precision cut and premium fabric blend for maximum comfort and style.',
  },
  {
    id: 'c1',
    name: 'Linen Breeze Olive',
    category: 'Casual',
    price: '৳ 3,500',
    images: [collectionSafeImages[2], collectionSafeImages[1], collectionSafeImages[0]],
    description:
      'Breathable pure linen for everyday elegance. Designed for comfort without compromising on that sharp, tailored look.',
  },
  {
    id: 'c2',
    name: 'Cotton Slub Beige',
    category: 'Casual',
    price: '৳ 2,800',
    images: [...collectionSafeImages],
    description:
      'Your go-to casual wear. The textured cotton slub offers a relaxed fit and a highly refined aesthetic.',
  },
  {
    id: 'p1',
    name: 'Midnight Velvet Noir',
    category: 'Party',
    price: '৳ 7,500',
    images: [collectionSafeImages[1], collectionSafeImages[2], collectionSafeImages[0]],
    description:
      'Make a statement at evening events. Premium dark velvet paired with subtle metallic accents.',
  },
  {
    id: 'p2',
    name: 'Sapphire Georgette',
    category: 'Party',
    price: '৳ 6,800',
    images: [...collectionSafeImages],
    description:
      'Flowy, lightweight georgette in deep sapphire blue, perfectly crafted for party nights.',
  },
];
