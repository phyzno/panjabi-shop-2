import { getUserOrders } from '@/lib/actions/orders'
import { Package, Truck, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardHeader, 
} from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface OrderItem {
  id: string;
  product_name: string;
  preview_image_url?: string;
  fabric_name?: string;
  collar_style?: string;
  size_type?: string;
  standard_size?: string;
  quantity?: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  order_items: OrderItem[];
}

export default async function OrdersPage() {
  const orders = await getUserOrders() as unknown as Order[]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-[#6B1E2E] transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">My Orders</span>
        </div>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-[#6B1E2E]" />
            Order History
          </h1>
          <p className="text-gray-600 mt-1">Track and manage your recent orders</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden border-none shadow-sm">
                <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order Number</p>
                      <p className="font-bold text-gray-900">#{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date Placed</p>
                      <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Amount</p>
                      <p className="font-bold text-[#6B1E2E]">৳{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="p-6 flex gap-6">
                        <div className="relative size-20 sm:size-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {item.preview_image_url ? (
                            <Image 
                              src={item.preview_image_url} 
                              alt={item.product_name} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-1 truncate">{item.product_name}</h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.fabric_name} • {item.collar_style} • {item.size_type === 'standard' ? `Size: ${item.standard_size}` : 'Custom Fit'}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-sm font-medium text-gray-900">Qty: {item.quantity || 1}</p>
                            <p className="font-bold text-gray-900">৳{item.total_price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck size={16} />
                    <span>Est. Delivery: {new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" render={<Link href={`/track-order?order=${order.order_number}`} />}>
                      Track Order
                    </Button>
                    <Button className="bg-[#6B1E2E] hover:bg-[#5a1826] text-white" size="sm">
                      Reorder
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Looks like you haven&apos;t placed any orders yet. Start your customization journey today!
            </p>
            <Button className="bg-[#6B1E2E] hover:bg-[#5a1826]" render={<Link href="/shop" />}>
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
