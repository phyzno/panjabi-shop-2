import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getUserWishlist } from '@/lib/actions/wishlist.actions';
import WishlistClient from './WishlistClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Wishlist | My Atelier',
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { success, data } = await getUserWishlist(user.id);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-[#17210C]">
          My Wishlist
        </h1>
        <p className="font-sans text-xs text-[#1C221A]/60 mt-1 tracking-wide">
          Your curated collection of favorite pieces, saved for later.
        </p>
      </div>

      <WishlistClient userId={user.id} initialItems={success && data ? data : []} />
    </div>
  );
}