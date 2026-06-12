import { getFabricById } from "@/lib/actions/fabric.actions";
import { getCachedSiteSettings } from "@/lib/actions/settings.actions"; // সেটিংস ইমপোর্ট
import FabricForm from "@/components/admin/fabric/FabricForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Edit Fabric',
};

export default async function EditFabricPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [{ data: fabric }, settingsRes] = await Promise.all([
    getFabricById(id),
    getCachedSiteSettings()
  ]);

  if (!fabric) {
    notFound();
  }

  const settings = settingsRes?.data;
  const siteColors = (settings?.fabric_colors as string[]) || [];
  const sitePatterns = (settings?.fabric_patterns as string[]) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-2">
        <Link href="/admin/fabrics" className="text-sm font-sans text-muted-foreground hover:text-primary transition-colors">
          &larr; Back to Fabrics
        </Link>
        <h1 className="text-2xl font-heading font-bold text-primary mt-2">Edit Fabric: {fabric.name}</h1>
      </div>

      <FabricForm 
        initialData={fabric} 
        isEditMode={true} 
        availableColors={siteColors} 
        availablePatterns={sitePatterns} 
      />
    </div>
  );
}
