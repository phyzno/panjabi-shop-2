import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateCollar } from '@/lib/actions/admin'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Collar',
}

export default async function EditCollarPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: collar } = await supabase
    .from('design_options')
    .select('*')
    .eq('id', id)
    .single()

  if (!collar) {
    redirect('/admin/collars')
  }

  const updateCollarWithId = updateCollar.bind(null, id)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <a href="/admin/collars" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
          &larr; Back to Collars
        </a>
        <h1 className="text-3xl font-heading font-bold text-primary">Edit Collar</h1>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
        <form action={updateCollarWithId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (English)</label>
            <input name="name" type="text" required defaultValue={collar.name} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (Bengali)</label>
            <input name="name_bn" type="text" defaultValue={collar.name_bn || ''} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <ImageUpload label="Collar Image" name="image_url" currentImageUrl={collar.image_url || undefined} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">For Product</label>
            <select name="for_product" required defaultValue={collar.for_product || 'panjabi'} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
              <option value="panjabi">Panjabi</option>
              <option value="payjama">Payjama</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Price Addition (৳)</label>
            <input name="price_addition" type="number" step="0.01" defaultValue={collar.price_addition || 0} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={collar.sort_order || 0} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2 flex gap-4">
            <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#8B2222] transition-colors">
              Update Collar
            </button>
            <a href="/admin/collars" className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors inline-block">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
