import { getProducts } from "@/lib/actions/product.actions";
import { getFabrics } from "@/lib/actions/fabric.actions";
import FeaturedClient from "@/components/admin/featured/FeaturedClient";

export const dynamic = "force-dynamic";

export default async function FeaturedManagementPage() {
  // Promise.all ব্যবহার করে একই সাথে প্রোডাক্ট এবং ফ্যাব্রিক ফেচ করা হচ্ছে (পারফরম্যান্সের জন্য)
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