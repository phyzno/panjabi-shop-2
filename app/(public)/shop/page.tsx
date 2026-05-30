import { getCachedAllProducts, getCachedCategories } from '@/lib/actions/product.actions';
import ShopClient from './ShopClient';

export default async function ShopPage() {
  // একই সাথে প্রোডাক্ট এবং ক্যাটাগরি ফেচ করা হচ্ছে
  const [{ data: dbProducts }, { data: dbCategories }] = await Promise.all([
    getCachedAllProducts(),
    getCachedCategories()
  ]);

  // প্রোডাক্ট ফরম্যাটিং
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

  // ডাটাবেস থেকে আসা ক্যাটাগরির নামের অ্যারে তৈরি
  const formattedCategories = (dbCategories || []).map(c => c.name);

  return (
    <ShopClient 
      initialProducts={formattedProducts} 
      initialCategories={formattedCategories} 
    />
  );
}