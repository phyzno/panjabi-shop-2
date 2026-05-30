import { getCachedAllFabrics } from '@/lib/actions/fabric.actions';
import { getCachedSiteSettings } from '@/lib/actions/settings.actions';
import { CustomizeClient } from '@/components/customizer/CustomizeClient';
import { createClient } from '@/utils/supabase/server'; // 👈 যুক্ত করা হলো
import { getUserMeasurements } from '@/lib/actions/user.actions'; // 👈 যুক্ত করা হলো

export const metadata = {
  title: 'Customize Panjabi',
};

export default async function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ১. Supabase থেকে ইউজারের সেশন চেক করা
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ২. Promise.all ব্যবহার করে একসাথে ফ্যাব্রিক, সেটিংস এবং মেজারমেন্ট ফেচ করা হচ্ছে
  const [
    { data: dbFabrics }, 
    settingsRes,
    measurementsRes // 👈 মেজারমেন্ট ফেচ করা হচ্ছে
  ] = await Promise.all([
    getCachedAllFabrics(),
    getCachedSiteSettings(),
    user ? getUserMeasurements(user.id) : Promise.resolve({ success: false, data: [] })
  ]);

  const fabrics = dbFabrics || [];
  const settings = settingsRes?.data;
  const savedMeasurements = measurementsRes.success ? measurementsRes.data : [];
  
  const siteColors = (settings?.fabric_colors as string[]) || [];
  const sitePatterns = (settings?.fabric_patterns as string[]) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomizeClient 
        productId={id} 
        fabrics={fabrics} 
        filterColors={siteColors}
        filterPatterns={sitePatterns}
        // 👈 নিচে এই দুটি প্রপস পাস করা অত্যন্ত জরুরি
        userId={user?.id || null} 
        savedMeasurements={savedMeasurements || []}
      />
    </div>
  );
}
