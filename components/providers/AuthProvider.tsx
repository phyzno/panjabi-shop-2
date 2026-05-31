'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { getUserWishlist } from '@/lib/actions/wishlist.actions';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { setUser, setLoaded } = useAuthStore();
  const { setWishlistedIds } = useWishlistStore();
  const supabase = useMemo(() => createClient(), []);
  const wishlistUserIdRef = useRef<string | null>(null);
  const goToResetPassword = useCallback(() => {
    if (pathname !== '/auth/reset-password') {
      router.replace('/auth/reset-password');
    }
  }, [pathname, router]);
  const syncAuthState = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const sessionUser = session?.user ?? null;
    const currentAuthState = useAuthStore.getState();

    if (currentAuthState.user?.id !== sessionUser?.id) {
      setUser(sessionUser);
    }

    if (sessionUser && wishlistUserIdRef.current !== sessionUser.id) {
      const res = await getUserWishlist(sessionUser.id);
      if (res.success && res.data) {
        const ids = res.data.map((item: any) => item.product.id);
        const currentIds = useWishlistStore.getState().wishlistedIds;

        if (ids.length !== currentIds.length || ids.some((id: number) => !currentIds.includes(id))) {
          setWishlistedIds(ids);
        }

        wishlistUserIdRef.current = sessionUser.id;
      }
    } else if (!sessionUser) {
      wishlistUserIdRef.current = null;
      const currentIds = useWishlistStore.getState().wishlistedIds;
      if (currentIds.length > 0) {
        setWishlistedIds([]);
      }
    }

    if (!currentAuthState.isLoaded) {
      setLoaded(true);
    }
  }, [supabase, setUser, setLoaded, setWishlistedIds]);

  useEffect(() => {
    syncAuthState();
  }, [pathname, syncAuthState]);

  useEffect(() => {
    const isRecoveryUrl =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery');

    if (!isRecoveryUrl) return;

    supabase.auth.getSession().finally(goToResetPassword);
  }, [goToResetPassword, supabase]);

  useEffect(() => {
    if (user) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncAuthState();
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [user, syncAuthState]);

  useEffect(() => {
    const handlePageShow = () => syncAuthState();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAuthState();
      }
    };
    const handleAuthBroadcast = () => syncAuthState();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'panjabi-shop-auth-event') {
        syncAuthState();
      }
    };
    const authChannel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel('panjabi-shop-auth')
        : null;

    authChannel?.addEventListener('message', handleAuthBroadcast);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      syncAuthState();
      if (event === 'PASSWORD_RECOVERY') {
        goToResetPassword();
      }
    });

    return () => {
      authChannel?.removeEventListener('message', handleAuthBroadcast);
      authChannel?.close();
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [goToResetPassword, supabase, syncAuthState]);

  return <>{children}</>;
}
