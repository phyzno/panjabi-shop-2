import { createClient } from '@/utils/supabase/server'
import { ShoppingBag, BarChart3, Users, Trash2, CheckCircle } from 'lucide-react'
import { updateOrderStatus, deleteOrder } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

interface Order {
  id: string
  order_number: string
  guest_name?: string
  guest_phone?: string
  status: string
  total: number
}

export default async function AdminPanelPage() {
  let orders: Order[] = []
  let totalRevenue = 0
  let pendingOrders = 0
  let error: string | null = null

  try {
    const supabase = await createClient()

    const { data, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      error = dbError.message
    } else if (data) {
      orders = data as Order[]
      totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0)
      pendingOrders = orders.filter(o => o.status === 'pending').length
    }
  } catch (e) {
    error = (e instanceof Error ? e.message : String(e)) || 'Failed to load orders'
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          Error loading data: {error}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm mb-6">
        ⚠️ Setup Required: Create a &quot;product-images&quot; bucket in Supabase Storage Dashboard and set it to Public for image uploads to work.
      </div>

      <div className="mb-12">
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Admin Control Panel</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          System Status: Operational | Logged in as admin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-amber-600 font-bold">{pendingOrders}</span> pending fulfillment
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Lifetime sales data</div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">From database profiles</div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold">Manage Orders</h2>
          <button className="text-sm font-medium text-primary hover:underline">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-primary">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{order.guest_name || 'Registered User'}</div>
                    <div className="text-xs text-muted-foreground">{order.guest_phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">৳{order.total}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <form action={updateOrderStatus.bind(null, order.id, 'delivered')}>
                        <button type="submit" title="Mark Delivered" className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle size={16} className="text-green-600" />
                        </button>
                      </form>
                      <form action={deleteOrder.bind(null, order.id)}>
                        <button type="submit" title="Delete Order" className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found in the database.
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
