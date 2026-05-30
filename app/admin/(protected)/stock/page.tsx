import { getProducts } from "@/lib/actions/product.actions";
import { getFabrics } from "@/lib/actions/fabric.actions";
import StockClient from "@/components/admin/stock/StockClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Admin Stock',
};

export default async function StockManagementPage() {
  const [{ data: products }, { data: fabrics }] = await Promise.all([
    getProducts(),
    getFabrics()
  ]);

  return <StockClient initialProducts={products || []} initialFabrics={fabrics || []} />;
}
