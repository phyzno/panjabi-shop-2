import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateFabric } from '@/lib/actions/admin'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { ColorPicker } from '@/components/admin/ColorPicker'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditFabricPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: fabric } = await supabase
    .from('fabrics')
    .select('*')
    .eq('id', id)
    .single()

  if (!fabric) {
    redirect('/admin/fabrics')
  }

  const updateFabricWithId = updateFabric.bind(null, id)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <a href="/admin/fabrics" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
          &larr; Back to Fabrics
        </a>
        <h1 className="text-3xl font-heading font-bold text-primary">Edit Fabric</h1>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
        <form action={updateFabricWithId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (English)</label>
            <input name="name" type="text" required defaultValue={fabric.name} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (Bengali)</label>
            <input name="name_bn" type="text" defaultValue={fabric.name_bn || ''} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fabric Type</label>
            <select name="fabric_type" required defaultValue={fabric.fabric_type} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
              <option value="plain">Plain</option>
              <option value="linen">Linen</option>
              <option value="silk">Silk</option>
              <option value="check">Check</option>
              <option value="stripe">Stripe</option>
              <option value="embroidery">Embroidery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Price per Yard (৳)</label>
            <input name="price_per_yard" type="number" step="0.01" required defaultValue={fabric.price_per_yard} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <ColorPicker name="color_hex" value={fabric.color_hex || '#000000'} label="Color Hex" />
          </div>
          <div>
            <ImageUpload label="Fabric Image" name="image_url" currentImageUrl={fabric.image_url || undefined} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">YouTube URL (optional)</label>
            <input name="youtube_url" type="text" defaultValue={fabric.youtube_url || ''} placeholder="YouTube fabric demo video URL" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={2} defaultValue={fabric.description || ''} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input name="in_stock" type="checkbox" value="true" defaultChecked={fabric.in_stock} className="w-5 h-5 text-primary" />
            <label className="text-sm font-medium text-gray-700">In Stock</label>
          </div>
          <div className="md:col-span-2 flex gap-4">
            <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#8B2222] transition-colors">
              Update Fabric
            </button>
            <a href="/admin/fabrics" className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors inline-block">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
