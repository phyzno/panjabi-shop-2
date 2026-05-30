import { getFabrics } from "@/lib/actions/fabric.actions";
import FabricTableClient from "@/components/admin/fabric/FabricTableClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Admin Fabrics',
};

export default async function AdminFabricsPage() {
  const { data: fabrics } = await getFabrics();

  return <FabricTableClient fabrics={fabrics || []} />;
}
