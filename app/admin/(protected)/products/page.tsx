import { getProducts } from "@/lib/actions/product.actions";
import { getCategoryTree } from "@/lib/actions/category.actions";
import ProductTableClient from "@/components/admin/product/ProductTableClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Admin Products',
};

export default async function AdminProductsPage() {
  const { data: products } = await getProducts();
  const { data: categories } = await getCategoryTree();

  return <ProductTableClient products={products || []} categories={categories || []} />;
}