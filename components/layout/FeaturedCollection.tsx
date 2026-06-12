import { getCachedFeaturedProducts, getCachedCategories } from '@/lib/actions/product.actions';
import FeaturedCollectionClient from './FeaturedCollectionClient';
import type { CollectionProduct } from '@/components/shop/ProductCard';

export default async function FeaturedCollection() {
  const [{ data: dbProducts }, { data: allCategories }] = await Promise.all([
    getCachedFeaturedProducts(),
    getCachedCategories()
  ]);

  if (!dbProducts || dbProducts.length === 0) {
    return null;
  }

  const categoryMap = new Map(allCategories?.map((c) => [c.id, c]) || []);
  const motherCategoriesSet = new Set<string>();

  const featuredProducts = dbProducts.map((p) => {
    let current = allCategories?.find((c) => {
      if (p.category_id && c.id === p.category_id) return true;
      if (p.categoryName && c.name.toLowerCase() === p.categoryName.toLowerCase()) return true;
      return false;
    });

    const path = [];
    while (current) {
      path.unshift(current);
      current = current.parent_id ? categoryMap.get(current.parent_id) : null;
    }

    const motherCategoryName = path[0] ? path[0].name : 'Uncategorized';

    const directCategoryName = path.length > 0
      ? path[path.length - 1].name
      : (p.categoryName || 'Uncategorized');

    if (motherCategoryName !== 'Uncategorized') {
      motherCategoriesSet.add(motherCategoryName);
    }

    return {
      id: p.id.toString(),
      name: p.name,
      category: directCategoryName,
      motherCategory: motherCategoryName,
      price: `৳ ${p.price}`,
      discount_percentage: p.discount_percentage || 0, // যুক্ত করা হয়েছে
      images: p.images || [],
      description: p.description || '',
      sizes: (p.sizes as string[]) || [],
      stock: p.stock as Record<string, any> || {},
      video_url: p.video_url || null,
      group_id: p.group_id || null,
      color_name: p.color_name || null,
      color_hex: p.color_hex || null,
    };
  });

  const uniqueCategories = Array.from(motherCategoriesSet);

  if (uniqueCategories.length === 0 && featuredProducts.length > 0) {
    uniqueCategories.push('Uncategorized');
  }

  return (
    <FeaturedCollectionClient
      products={featuredProducts}
      categories={uniqueCategories}
    />
  );
}
