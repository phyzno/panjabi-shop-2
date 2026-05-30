import { getFabrics } from "@/lib/actions/fabric.actions";
import FabricTableClient from "@/components/admin/fabric/FabricTableClient";

export const dynamic = "force-dynamic";

export default async function AdminFabricsPage() {
  const { data: fabrics } = await getFabrics();

  return <FabricTableClient fabrics={fabrics || []} />;
}