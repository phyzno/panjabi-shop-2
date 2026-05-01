import { getProducts, getProductCategories } from '@/lib/actions/products';
import { ShopContent } from '@/components/shop/ShopContent';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getProductCategories()
  ]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Collection
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our premium range of Panjabis, crafted with the finest fabrics and meticulous attention to detail.
          </p>
        </div>
        
        <ShopContent initialProducts={products} categories={categories} />
      </div>
    </div>
  );
}
