import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/lib/actions/auth';
import { getUserOrders, getUserMeasurements } from '@/lib/actions/user.actions'; // আপনার তৈরি সার্ভার অ্যাকশন
import { getUserWishlist } from '@/lib/actions/wishlist.actions';
import { ShoppingBag, Ruler, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  const profile = await getUserProfile();

  // প্যারালাল ডেটা ফেচিং
  const [ordersResponse, measurementsResponse, wishlistResponse] = await Promise.all([
    getUserOrders(user.id),
    getUserMeasurements(user.id),
    getUserWishlist(user.id),
  ]);

  const recentOrders = ordersResponse.success && ordersResponse.data ? ordersResponse.data.slice(0, 3) : [];
  const totalOrders = ordersResponse.success && ordersResponse.data ? ordersResponse.data.length : 0;
  const measurementCount = measurementsResponse.success && measurementsResponse.data ? measurementsResponse.data.length : 0;
  const wishlistCount = wishlistResponse.success && wishlistResponse.data ? wishlistResponse.data.length : 0;

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Customer';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-[#D4D7C9]/50 p-6 md:p-8 shadow-sm bg-[url('/pattern-bg.png')] bg-cover bg-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#17210C]">
          Welcome, {displayName}
        </h1>
        <p className="font-sans text-xs text-[#1C221A]/70 mt-2 uppercase tracking-widest font-medium">
          Explore your journey witth us
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#D4D7C9]/50 p-5 shadow-sm flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 bg-[#4A5D23]/10 text-[#4A5D23] rounded-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-[#17210C]">{totalOrders}</p>
            <p className="font-sans text-[12px] uppercase tracking-widest text-[#1C221A]/60 mt-0.5">Total Orders</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D4D7C9]/50 p-5 shadow-sm flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 bg-[#C25934]/10 text-[#C25934] rounded-full flex items-center justify-center">
            <Ruler className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-[#17210C]">{measurementCount}</p>
            <p className="font-sans text-[12px] uppercase tracking-widest text-[#1C221A]/60 mt-0.5">Saved Profiles</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D4D7C9]/50 p-5 shadow-sm flex flex-col items-center justify-center text-center gap-3 col-span-2 md:col-span-1">
          <div className="w-12 h-12 bg-[#17210C]/5 text-[#17210C] rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-[#17210C]">{wishlistCount}</p>
            <p className="font-sans text-[12px] uppercase tracking-widest text-[#1C221A]/60 mt-0.5">Wishlist Items</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Glimpse */}
      <div className="bg-white rounded-2xl border border-[#D4D7C9]/50 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-[#D4D7C9]/40 pb-4">
          <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#17210C]">
            Recent Orders
          </h2>
          <Link href="/dashboard/orders" className="text-[12px] font-sans uppercase tracking-widest text-[#4A5D23] hover:text-[#C25934] transition-colors flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#D4D7C9]/40 bg-[#F8F9F5]/50">
                <div>
                  <p className="font-heading text-sm font-bold text-[#17210C] uppercase tracking-wide">
                    #{order.id}
                  </p>
                  <p className="font-sans text-[11px] text-[#1C221A]/60 mt-1">
                    {order.date ? new Date(order.date).toLocaleDateString() : 'Unknown Date'} • {order.items?.length || 0} Items
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-sans uppercase tracking-widest border
                    ${order.orderStatus === 'delivered' ? 'bg-[#4A5D23]/10 text-[#4A5D23] border-[#4A5D23]/20' :
                      order.orderStatus === 'processing' ? 'bg-[#C25934]/10 text-[#C25934] border-[#C25934]/20' :
                        'bg-white text-[#1C221A]/70 border-[#D4D7C9]'}
                  `}>
                    {order.orderStatus}
                  </span>
                  <span className="font-sans text-sm text-[#17210C]">
                    ৳ {order.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-[#F8F9F5] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4D7C9]/40">
              <ShoppingBag className="w-6 h-6 text-[#1C221A]/30" />
            </div>
            <p className="font-sans text-sm uppercase tracking-wider text-[#17210C] mb-2">No active orders</p>
            <p className="font-sans text-[11px] text-[#1C221A]/60 uppercase tracking-widest mb-6">Start your bespoke journey today</p>
            <Link href="/shop" className="inline-flex bg-[#4A5D23] text-white px-6 py-3 rounded-full font-sans text-xs uppercase tracking-[0.15em] shadow-md hover:bg-[#3D4C1D] transition-colors">
              Explore Collection
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}