'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function getSafeDestination(destination?: string) {
  if (
    !destination ||
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    destination.startsWith('/login') ||
    destination.startsWith('/signup')
  ) {
    return '/dashboard';
  }

  return destination;
}

export default function AuthRedirect({ destination }: { destination?: string }) {
  const router = useRouter();
  const { user, isLoaded } = useAuthStore();

  useEffect(() => {
    if (!isLoaded || !user) return;

    router.replace(getSafeDestination(destination));
  }, [destination, isLoaded, router, user]);

  return null;
}
