'use client';

import { useWishlistStore } from '@/store/wishlistStore';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WishlistStat() {
  const items = useWishlistStore((state) => state.items);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(items.length);
  }, [items]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-6 h-6 text-[#6B1E2E]" />
        <span className="text-sm text-gray-500">Wishlist</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
    </div>
  );
}
