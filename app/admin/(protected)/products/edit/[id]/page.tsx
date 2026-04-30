import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProduct } from '@/lib/actions/admin'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    redirect('/admin/products')
  }

  const updateProductWithId = updateProduct.bind(null, id)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <a href="/admin/products" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
          &larr; Back to Products
        </a>
        <h1 className="text-3xl font-heading font-bold text-primary">Edit Product</h1>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
        <form action={updateProductWithId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
            <select name="type" required defaultValue={product.type} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
              <option value="panjabi">Panjabi</option>
              <option value="shirt">Shirt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <input name="category" type="text" defaultValue={product.category || ''} placeholder="casual, premium, wedding" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (English)</label>
            <input name="name" type="text" required defaultValue={product.name} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (Bengali)</label>
            <input name="name_bn" type="text" defaultValue={product.name_bn || ''} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={2} defaultValue={product.description || ''} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (৳)</label>
            <input name="base_price" type="number" step="0.01" required defaultValue={product.base_price} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Stitching Charge (৳)</label>
            <input name="stitching_charge" type="number" step="0.01" defaultValue={product.stitching_charge || 450} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Image URLs (comma-separated)</label>
            <input name="image_urls" type="text" defaultValue={(product.image_urls || []).join(', ')} placeholder="url1, url2, url3" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input name="is_active" type="checkbox" value="true" defaultChecked={product.is_active} className="w-5 h-5 text-primary" />
            <label className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="md:col-span-2 flex gap-4">
            <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#8B2222] transition-colors">
              Update Product
            </button>
            <a href="/admin/products" className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors inline-block">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
