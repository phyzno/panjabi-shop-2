import { createClient } from '@/utils/supabase/server';
import { CustomizeClient } from '@/components/customizer/CustomizeClient';

export default async function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient();
  
  // Fetch active fabrics
  const { data: dbFabrics } = await supabase
    .from('fabrics')
    .select('*')
    .eq('in_stock', true)
    .order('sort_order', { ascending: true });

  // Fetch active collars
  const { data: dbCollars } = await supabase
    .from('design_options')
    .select('*')
    .eq('type', 'collar')
    .order('sort_order', { ascending: true });

  const fabrics = dbFabrics || [];
  const collars = dbCollars || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomizeClient 
        productId={id} 
        fabrics={fabrics} 
        collars={collars} 
      />
    </div>
  );
}
