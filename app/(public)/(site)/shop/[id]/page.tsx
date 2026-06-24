// app/public/site/shop/[id]/page.tsx
import type { Metadata } from 'next';
import { getCachedProductById, getCachedAllProducts, getProductVariants } from '@/lib/actions/product.actions';
import ProductDetailsClient from './ProductDetailsClient';
import { notFound } from 'next/navigation';

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await getCachedProductById(id);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at Panjabi Shop.`,
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  
  if (!productId) {
    notFound();
  }

  const { data: product } = await getCachedProductById(productId);

  if (!product) {
    notFound();
  }

  // group_id থাকলে Sibling ভেরিয়েন্টগুলো ফেচ করা হচ্ছে
  let colorVariants: any[] = [];
  if (product.group_id) {
    const variantsRes = await getProductVariants(product.group_id, product.id);
    if (variantsRes.success && variantsRes.data) {
      colorVariants = variantsRes.data;
    }
  }

  const { data: allProducts } = await getCachedAllProducts();
  const related = (allProducts || [])
    .filter(p => p.id !== productId && p.categoryName === product.categoryName)
    .slice(0, 3) 
    .map(p => ({
      id: p.id.toString(),
      name: p.name,
      category: p.categoryName || 'Uncategorized',
      price: `৳ ${p.price}`,
      discount_percentage: p.discount_percentage || 0, // যুক্ত করা হয়েছে
      images: (p.images as string[]) || [],
      description: p.description || '',
    }));

  const formattedProduct = {
    id: product.id.toString(),
    name: product.name,
    category: product.categoryName || 'Uncategorized',
    price: `৳ ${product.price}`,
    discount_percentage: product.discount_percentage || 0, // যুক্ত করা হয়েছে
    images: (product.images as string[]) || [],
    description: product.description || '',
    sizes: (product.sizes as string[]) || [],
    stock: product.stock as Record<string, any> || {},
    video_url: product.video_url || null,
    group_id: product.group_id || null,
    color_name: product.color_name || null,
    color_hex: product.color_hex || null,
    additional_details: (product.additional_details as { title: string; content: string }[]) || [],
    rating: product.rating || 4.8,
    review_count: product.review_count || 24,
    has_size_guide: product.has_size_guide ?? true,
  };

  return (
    <ProductDetailsClient 
      product={formattedProduct} 
      relatedProducts={related} 
      colorVariants={colorVariants} 
    />
  );
}
