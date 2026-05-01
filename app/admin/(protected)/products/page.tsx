import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { addProduct, deleteProduct } from '@/lib/actions/admin'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Products fetch error:', error)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-primary">Manage Products</h1>
      </div>

      {/* Add Product Form */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
          <Plus size={20} /> Add New Product
        </h2>
        <form action={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
            <select name="type" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
              <option value="panjabi">Panjabi</option>
              <option value="payjama">Payjama</option>
              <option value="set">Set</option>
              <option value="readymade">Readymade</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <input name="category" type="text" placeholder="casual, premium, wedding" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (English)</label>
            <input name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (Bengali)</label>
            <input name="name_bn" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (৳)</label>
            <input name="base_price" type="number" step="0.01" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Stitching Charge (৳)</label>
            <input name="stitching_charge" type="number" step="0.01" defaultValue="450" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageUpload label="Main Image" name="image_url" />
              <ImageUpload label="Image 2 (optional)" name="image_url" />
              <ImageUpload label="Image 3 (optional)" name="image_url" />
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input name="is_active" type="checkbox" value="true" defaultChecked className="w-5 h-5 text-primary" />
            <label className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#8B2222] transition-colors">
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Stitching Charge</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products || []).map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {product.image_urls?.[0] ? (
                      <Image
                        src={product.image_urls[0]}
                        alt={product.name}
                        width={48}
                        height={64}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.name_bn}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.type}</td>
                  <td className="px-6 py-4 text-sm">{product.category || 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-sm">৳{product.base_price}</td>
                  <td className="px-6 py-4 font-bold text-sm">৳{product.stitching_charge || 450}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <a href={`/admin/products/edit/${product.id}`} className="p-2 hover:bg-blue-50 rounded-lg transition-colors inline-block">
                        <Pencil size={16} className="text-blue-600" />
                      </a>
                      <form action={deleteProduct.bind(null, product.id)}>
                        <button type="submit" className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    No products found. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
