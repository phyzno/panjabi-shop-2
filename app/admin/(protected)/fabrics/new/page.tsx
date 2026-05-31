import FabricForm from "@/components/admin/fabric/FabricForm";
import Link from "next/link";
import { getCachedSiteSettings } from "@/lib/actions/settings.actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Add Fabric',
};

export default async function AddFabricPage() {
  const settingsRes = await getCachedSiteSettings();
  const settings = settingsRes?.data;
  
  const siteColors = (settings?.fabric_colors as string[]) || [];
  const sitePatterns = (settings?.fabric_patterns as string[]) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-2">
        <Link href="/admin/fabrics" className="text-sm font-sans text-muted-foreground hover:text-primary transition-colors">
          &larr; Back to Fabrics
        </Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Add New Fabric</h1>
      </div>

      <FabricForm 
        availableColors={siteColors} 
        availablePatterns={sitePatterns} 
      />
    </div>
  );
}
