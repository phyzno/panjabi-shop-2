'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { getUserWishlist } from '@/lib/actions/wishlist.actions';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setUser, setLoaded } = useAuthStore();
  const { setWishlistedIds } = useWishlistStore();
  const supabase = useMemo(() => createClient(), []);

  const syncAuthState = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    setUser(user);

    if (user) {
      const res = await getUserWishlist(user.id);
      if (res.success && res.data) {
        setWishlistedIds(res.data.map((item: any) => item.product.id));
      }
    } else {
      setWishlistedIds([]);
    }

    setLoaded(true);
  }, [supabase, setUser, setLoaded, setWishlistedIds]);

  useEffect(() => {
    syncAuthState();
  }, [pathname, syncAuthState]);

  useEffect(() => {
    const handlePageShow = () => syncAuthState();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAuthState();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncAuthState();
    });

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [supabase, syncAuthState]);

  return <>{children}</>;
}