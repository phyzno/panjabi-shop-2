import { createClient } from '@/utils/supabase/server'
import { getUserProfile, getCurrentUser } from '@/lib/actions/auth'
import Link from 'next/link'
import { Package, Ruler, Gift, ShoppingBag, Scissors, Truck } from 'lucide-react'
import { WishlistStat } from '@/components/dashboard/WishlistStat'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const profile = await getUserProfile()

  const supabase = await createClient()

  // Get order count
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id || '')

  // Get measurement count
  const { count: measurementCount } = await supabase
    .from('measurements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id || '')

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, created_at, status, total')
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false })
    .limit(5)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold text-gray-900">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here&apos;s your account overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/orders" className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 text-[#6B1E2E]" />
              <span className="text-sm text-gray-500">My Orders</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{orderCount || 0}</p>
          </Link>

          <Link href="/dashboard/measurements" className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Ruler className="w-6 h-6 text-[#6B1E2E]" />
              <span className="text-sm text-gray-500">Saved Measurements</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{measurementCount || 0}</p>
          </Link>

          <WishlistStat />

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-[#6B1E2E]" />
              <span className="text-sm text-gray-500">Loyalty Points</span>
            </div>
            <p className="text-sm font-medium text-gray-500">Coming Soon</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-sm text-[#6B1E2E] hover:underline">
                View All
              </Link>
            </div>

            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                      <p className="font-medium">৳{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No orders yet. Start customizing!</p>
                <Link href="/shop" className="inline-block bg-[#6B1E2E] text-white px-6 py-2 rounded-xl text-sm hover:bg-[#5a1826] transition-colors">
                  Browse Shop
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-heading text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/shop" className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <ShoppingBag className="w-6 h-6 text-[#6B1E2E]" />
                <span className="text-sm font-medium">Browse Shop</span>
              </Link>
              <Link href="/customize/new" className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <Scissors className="w-6 h-6 text-[#6B1E2E]" />
                <span className="text-sm font-medium">Customize</span>
              </Link>
              <Link href="/dashboard/measurements" className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <Ruler className="w-6 h-6 text-[#6B1E2E]" />
                <span className="text-sm font-medium">Measurements</span>
              </Link>
              <Link href="/dashboard/orders" className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <Truck className="w-6 h-6 text-[#6B1E2E]" />
                <span className="text-sm font-medium">Track Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
