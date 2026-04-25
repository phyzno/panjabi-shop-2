import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import Link from 'next/link'
import { ShoppingBag, Ruler, User as UserIcon, LogOut, BarChart3 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors border border-primary/20">
            <BarChart3 size={18} />
            Manage Store
          </Link>
          <form action={signOut}>
            <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-2xl font-heading font-bold">Recent Orders</h2>
          </div>

          {!orders || orders.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
              <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-medium shadow-md">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-mono text-sm text-primary font-bold mb-1">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold mb-1">৳{order.total}</p>
                    <Link href={`/order-confirmation/${order.order_number}`} className="text-sm text-primary hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-heading font-bold mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Link href="/shop" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                <ShoppingBag size={20} className="text-primary" />
                <span className="text-sm font-medium">Browse Shop</span>
              </Link>
              <Link href="/dashboard/measurements" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                <Ruler size={20} className="text-primary" />
                <span className="text-sm font-medium">My Measurements</span>
              </Link>
              <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-border">
                <UserIcon size={20} className="text-primary" />
                <span className="text-sm font-medium">Account Settings</span>
              </Link>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[#6B1E2E] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-heading font-bold mb-3 text-[#C9A84C]">Need Help?</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Our support team is available 24/7 for any questions regarding your custom orders.
              </p>
              <a href="https://wa.me/8801XXXXXXXXX" className="inline-block bg-[#C9A84C] text-[#1A1A1A] px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md">
                Contact Support
              </a>
            </div>
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
