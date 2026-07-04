import { getCachedAllProducts, getCachedCategories } from '@/lib/actions/product.actions';
import ShopClient from './ShopClient';

export const metadata = {
  title: 'Shop',
};

export default async function ShopPage() {
  const [{ data: dbProducts }, { data: dbCategories }] = await Promise.all([
    getCachedAllProducts(),
    getCachedCategories()
  ]);

  const formattedProducts = (dbProducts || []).map(p => ({
    id: p.id.toString(),
    name: p.name,
    categoryId: p.categoryId ?? undefined,
    category: p.categoryName || 'Uncategorized',
    price: `৳ ${p.price}`,
    has_price_variation: p.has_price_variation || false,
    size_prices: (p.size_prices || {}) as Record<string, number>,
    discount_percentage: p.discount_percentage || 0,
    images: (p.images as string[]) || [],
    description: p.description || '',
    sizes: (p.sizes as string[]) || [],
    stock: p.stock as Record<string, any> || {},
    video_url: p.video_url || null,
    group_id: p.group_id || null,
    color_name: p.color_name || null,
    color_hex: p.color_hex || null,
  }));

  const formattedCategories = dbCategories || [];

  return (
    <ShopClient
      initialProducts={formattedProducts}
      initialCategories={formattedCategories}
    />
  );
}
