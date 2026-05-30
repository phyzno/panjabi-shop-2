import { getCachedFeaturedProducts } from '@/lib/actions/product.actions';
import FeaturedCollectionClient from './FeaturedCollectionClient';
import type { CollectionProduct } from '@/components/shop/ProductCard';

export default async function FeaturedCollection() {
  const { data: dbProducts } = await getCachedFeaturedProducts();

  if (!dbProducts || dbProducts.length === 0) {
    return null; 
  }

  // ডেটা ম্যাপ করার সময় categoryName ব্যবহার করবো
  const featuredProducts: CollectionProduct[] = dbProducts.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    category: p.categoryName || 'Uncategorized',
    price: `৳ ${p.price}`,
    images: p.images || [],
    description: p.description || '',
    sizes: (p.sizes as string[]) || [], // <-- এই লাইনটি যুক্ত করুন
    stock: p.stock as Record<string, any> || {}, // <-- এই লাইনটি যুক্ত করুন
  }));

  // ক্যাটাগরির নামগুলো দিয়ে ইউনিক লিস্ট তৈরি
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