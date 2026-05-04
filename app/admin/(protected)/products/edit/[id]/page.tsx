import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProduct } from '@/lib/actions/admin'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { SubmitButton } from '@/components/admin/SubmitButton'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { error: urlError } = await searchParams
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

      {urlError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <strong>Error:</strong> {urlError}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
        <form action={updateProductWithId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
            <select name="type" required defaultValue={product.type} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
              <option value="panjabi">Panjabi</option>
              <option value="payjama">Payjama</option>
              <option value="set">Set</option>
              <option value="readymade">Readymade</option>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageUpload label="Main Image" name="image_url" currentImageUrl={product.image_url} />
              <ImageUpload label="Image 2 (optional)" name="image_url" />
              <ImageUpload label="Image 3 (optional)" name="image_url" />
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input name="is_active" type="checkbox" value="true" defaultChecked={product.is_active} className="w-5 h-5 text-primary" />
            <label className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="md:col-span-2 flex gap-4">
            <SubmitButton label="Update Product" />
            <a href="/admin/products" className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors inline-block">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
