import { getSiteSettings } from "@/lib/actions/settings.actions";
import { getCategories } from "@/lib/actions/category.actions";
import SettingsFormClient from "@/components/admin/SettingsFormClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // ডাটাবেস থেকে গ্লোবাল সেটিংস এবং শপ ক্যাটাগরি প্যারালালি ফেচ করা হচ্ছে
  const [settingsRes, categoriesRes] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  const settings = settingsRes.data;
  const categories = categoriesRes.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-heading font-bold text-primary">Control Center & Settings</h1>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Configure live header announcements, product categories, and canvas customizer options.
        </p>
      </div>

      {/* ক্লায়েন্ট ইন্টারঅ্যাক্টিভিটি হ্যান্ডেল করার জন্য ইন্টারফেস */}
      <SettingsFormClient 
        initialSettings={settings} 
        initialCategories={categories} 
      />

    </div>
  );
}