import type { Metadata } from 'next';
import { getCachedProductById, getCachedAllProducts } from '@/lib/actions/product.actions';
import ProductDetailsClient from './ProductDetailsClient';
import { notFound } from 'next/navigation';

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return { title: 'Product Not Found' };
  }

  const { data: product } = await getCachedProductById(productId);

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
  const productId = Number(resolvedParams.id);
  
  if (isNaN(productId)) {
    notFound();
  }

  const { data: product } = await getCachedProductById(productId);

  if (!product) {
    notFound();
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
      images: (p.images as string[]) || [],
      description: p.description || '',
    }));

  const formattedProduct = {
    id: product.id.toString(),
    name: product.name,
    category: product.categoryName || 'Uncategorized',
    price: `৳ ${product.price}`,
    images: (product.images as string[]) || [],
    description: product.description || '',
    sizes: (product.sizes as string[]) || [],
    stock: product.stock as Record<string, any> || {},
  };

  return <ProductDetailsClient product={formattedProduct} relatedProducts={related} />;
}
