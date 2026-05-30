'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { getUserWishlist } from '@/lib/actions/wishlist.actions';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoaded } = useAuthStore();
  const { setWishlistedIds } = useWishlistStore();
  const supabase = createClient();

  useEffect(() => {
    // সেশন এবং উইশলিস্ট ফেচ করার ফাংশন
    const fetchSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
         const res = await getUserWishlist(session.user.id);
         if (res.success && res.data) {
            const ids = res.data.map((item: any) => item.product.id);
            setWishlistedIds(ids);
         }
      } else {
         setWishlistedIds([]);
      }
      setLoaded(true);
    };

    fetchSessionAndData();

    // রিয়েল-টাইম লিসেনার
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
           const res = await getUserWishlist(session.user.id);
           if (res.success && res.data) {
              const ids = res.data.map((item: any) => item.product.id);
              setWishlistedIds(ids);
           }
        } else {
           setWishlistedIds([]);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoaded, setWishlistedIds]);

  return <>{children}</>;
}