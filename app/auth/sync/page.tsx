'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/authStore';

function notifyAuthChange() {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('panjabi-shop-auth');
      channel.postMessage({ type: 'auth-changed', at: Date.now() });
      channel.close();
    }

    localStorage.setItem('panjabi-shop-auth-event', String(Date.now()));
  } catch {
  }
}

function getSafeNext(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/dashboard';
  }

  return next;
}

function AuthSyncClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setLoaded } = useAuthStore();

  useEffect(() => {
    let isActive = true;

    const syncAndRedirect = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!isActive) return;

      setUser(session?.user ?? null);
      setLoaded(true);
      notifyAuthChange();

      router.replace(getSafeNext(searchParams.get('next')));
    };

    syncAndRedirect();

    return () => {
      isActive = false;
    };
  }, [router, searchParams, setUser, setLoaded]);

  return (
    <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-[#4A5D23] border-t-transparent animate-spin" />
    </div>
  );
}

export default function AuthSyncPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-[#4A5D23] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthSyncClient />
    </Suspense>
  );
}
