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
    category: p.categoryName || 'Uncategorized',
    price: `৳ ${p.price}`,
    images: (p.images as string[]) || [],
    description: p.description || '',
    sizes: (p.sizes as string[]) || [],
    stock: p.stock as Record<string, any> || {},
  }));

  const formattedCategories = (dbCategories || []).map(c => c.name);

  return (
    <ShopClient 
      initialProducts={formattedProducts} 
      initialCategories={formattedCategories} 
    />
  );
}
