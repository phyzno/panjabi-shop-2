import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { addCollar, deleteCollar } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminCollarsPage() {
  const supabase = await createClient()
  const { data: collars } = await supabase
    .from('design_options')
    .select('*')
    .eq('type', 'collar')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-primary">Manage Collars</h1>
      </div>

      {/* Add Collar Form */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
          <Plus size={20} /> Add New Collar
        </h2>
        <form action={addCollar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (English)</label>
            <input name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name (Bengali)</label>
            <input name="name_bn" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
            <input name="image_url" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Price Addition (৳)</label>
            <input name="price_addition" type="number" step="0.01" defaultValue="0" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#8B2222] transition-colors">
              Add Collar
            </button>
          </div>
        </form>
      </div>

      {/* Collars Table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Price Addition</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(collars || []).map((collar) => (
                <tr key={collar.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{collar.name}</div>
                    <div className="text-xs text-muted-foreground">{collar.name_bn}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    {collar.price_addition > 0 ? `৳${collar.price_addition}` : 'Free'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={16} className="text-blue-600" />
                      </button>
                      <form action={deleteCollar.bind(null, collar.id)}>
                        <button type="submit" className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!collars || collars.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    No collars found. Add one above.
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
