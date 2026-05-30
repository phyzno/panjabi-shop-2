import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getUserOrders } from '@/lib/actions/user.actions';
import OrdersClient from './OrdersClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Orders',
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { success, data: orders, error } = await getUserOrders(user.id);

  if (!success) {
    return (
      <div className="text-center py-20 text-red-500 font-sans">
        Error loading orders: {error}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-[#17210C]">
          Order History
        </h1>
        <p className="font-sans text-xs text-[#1C221A]/60 mt-1 tracking-wide">
          Track, review, and print invoices for all your bespoke and ready-to-wear purchases.
        </p>
      </div>

      <OrdersClient orders={orders || []} />
    </div>
  );
}
