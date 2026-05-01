import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { addFabric, deleteFabric } from '@/lib/actions/admin'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Image from 'next/image'
import { ColorPicker } from '@/components/admin/ColorPicker'

export const dynamic = 'force-dynamic'

export default async function AdminFabricsPage() {
  const supabase = await createClient()
  const { data: fabrics, error } = await supabase
    .from('fabrics')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('Fabrics fetch error:', error)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-primary">Manage Fabrics</h1>
      </div>

      {/* Add Fabric Form */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
          <Plus size={20} /> Add New Fabric
        </h2>
        <form action={addFabric} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (English)</label>
            <input name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (Bengali)</label>
            <input name="name_bn" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fabric Type</label>
            <select name="fabric_type" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
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
            <input name="price_per_yard" type="number" step="0.01" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <ColorPicker name="color_hex" label="Color Hex" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">YouTube URL (optional)</label>
            <input name="youtube_url" type="text" placeholder="YouTube fabric demo video URL" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <ImageUpload label="Fabric Image" name="image_url" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input name="in_stock" type="checkbox" value="true" defaultChecked className="w-5 h-5 text-primary" />
            <label className="text-sm font-medium text-gray-700">In Stock</label>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#8B2222] transition-colors">
              Add Fabric
            </button>
          </div>
        </form>
      </div>

      {/* Fabrics Table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <th className="px-6 py-4">Image/Color</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Color Hex</th>
                <th className="px-6 py-4">Price/Yard</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(fabrics || []).map((fabric) => (
                <tr key={fabric.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ background: fabric.color_hex || '#ccc' }}
                      />
                      {fabric.image_url && (
                        <Image
                          src={fabric.image_url}
                          alt={fabric.name}
                          width={40}
                          height={40}
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{fabric.name}</div>
                    <div className="text-xs text-muted-foreground">{fabric.name_bn}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{fabric.fabric_type}</td>
                  <td className="px-6 py-4 text-sm font-mono">{fabric.color_hex || 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-sm">৳{fabric.price_per_yard}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      fabric.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {fabric.in_stock ? 'in stock' : 'out of stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <a href={`/admin/fabrics/edit/${fabric.id}`} className="p-2 hover:bg-blue-50 rounded-lg transition-colors inline-block">
                        <Pencil size={16} className="text-blue-600" />
                      </a>
                      <form action={deleteFabric.bind(null, fabric.id)}>
                        <button type="submit" className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!fabrics || fabrics.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No fabrics found. Add one above.
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
