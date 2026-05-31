import { getProducts } from "@/lib/actions/product.actions";
import { getFabrics } from "@/lib/actions/fabric.actions";
import FeaturedClient from "@/components/admin/featured/FeaturedClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Admin Featured',
};

export default async function FeaturedManagementPage() {
  const [{ data: products }, { data: fabrics }] = await Promise.all([
    getProducts(),
    getFabrics()
  ]);

  return (
    <FeaturedClient 
      initialProducts={products || []} 
      initialFabrics={fabrics || []} 
    />
  );
}
