"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ShoppingBag, Users, BarChart3, ChevronRight } from 'lucide-react'

export default function AdminPanelPage() {
  const router = useRouter()
  // Define minimal user and order types to satisfy TypeScript and ESLint
  interface User {
    id: string
    email?: string  // Made optional to match Supabase User type
    // add other fields if needed
  }
  interface Order {
    id: string
    order_number: string
    guest_name?: string
    guest_phone?: string
    status: string
    total: number | string
    // other fields can be added as needed
  }

  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setUser(user)
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      setOrders(allOrders || [])
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) return <div className="container mx-auto px-4 py-12">Loading…</div>

  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Admin Control Panel</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          System Status: Operational | Logged in as {user?.email}
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
              <tr className="bg-gray-50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-primary">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{order.guest_name || 'Registered User'}</div>
                    <div className="text-xs text-muted-foreground">{order.guest_phone || user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">৳{order.total}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white rounded-lg transition-colors group">
                      <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary" />
                    </button>
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
