import { getCachedFeaturedProducts } from '@/lib/actions/product.actions';
import FeaturedCollectionClient from './FeaturedCollectionClient';
import type { CollectionProduct } from '@/components/shop/ProductCard';

export default async function FeaturedCollection() {
  const { data: dbProducts } = await getCachedFeaturedProducts();

  if (!dbProducts || dbProducts.length === 0) {
    return null; 
  }

  const featuredProducts: CollectionProduct[] = dbProducts.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    category: p.categoryName || 'Uncategorized',
    price: `৳ ${p.price}`,
    images: p.images || [],
    description: p.description || '',
    sizes: (p.sizes as string[]) || [],
    stock: p.stock as Record<string, any> || {},
  }));

  const uniqueCategories = Array.from(
    new Set(featuredProducts.map((p) => p.category))
  );

  return (
    <FeaturedCollectionClient 
      products={featuredProducts} 
      categories={uniqueCategories} 
    />
  );
}