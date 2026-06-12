import { getProducts } from "@/lib/actions/product.actions";
import { getFabrics } from "@/lib/actions/fabric.actions";
import { getCategoryTree } from "@/lib/actions/category.actions";
import StockClient from "@/components/admin/stock/StockClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Admin Stock',
};

export default async function StockManagementPage() {
  const [{ data: products }, { data: fabrics }, { data: categories }] = await Promise.all([
    getProducts(),
    getFabrics(),
    getCategoryTree()
  ]);

  return (
    <StockClient 
      initialProducts={products || []} 
      initialFabrics={fabrics || []} 
      categories={categories || []} 
    />
  );
}