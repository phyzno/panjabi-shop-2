import { getProducts } from "@/lib/actions/product.actions";
import ProductTableClient from "@/components/admin/product/ProductTableClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Admin Products',
};

export default async function AdminProductsPage() {
  const { data: products } = await getProducts();

  return <ProductTableClient products={products || []} />;
}
