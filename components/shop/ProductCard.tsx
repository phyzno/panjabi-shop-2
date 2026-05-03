'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';
import { resolveProductImageSrc } from '@/lib/productImages';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string | null;
  isStitched?: boolean;
}

export function ProductCard({ id, name, category, price, imageUrl, isStitched }: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const active = isInWishlist(id);

  return (
    <div className="group flex flex-col relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Wishlist Button */}
      <button 
        onClick={() => toggleItem(id)}
        className={cn(
          "absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300",
          active 
            ? "bg-red-50 text-[#EF4444] shadow-sm" 
            : "bg-white/70 backdrop-blur-md text-gray-500 hover:text-[#EF4444] hover:bg-white"
        )}
      >
        <Heart size={18} fill={active ? "currentColor" : "none"} />
      </button>

      {/* Category Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-[#1A1A1A]/80 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded">
          {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General'}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
        <Image 
          src={resolveProductImageSrc(imageUrl)} 
          alt={name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Quick Customize Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link 
            href={`/customize/${id}`}
            className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-6 py-2 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white"
          >
            Quick Customize
          </Link>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-heading text-lg font-bold text-[#1A1A1A] mb-1 line-clamp-1">{name}</h3>
        <p className="text-[#6B6B6B] text-sm mb-3">From ৳{price?.toLocaleString()}</p>
        
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
          {isStitched ? (
            <span className="flex items-center gap-1 text-xs font-medium text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded">
              <span>✂️</span> Custom Stitching
            </span>
          ) : (
            <span className="text-xs text-gray-400">Ready to wear</span>
          )}
          
          <Link 
            href={`/customize/${id}`}
            className="text-sm font-semibold text-[#6B1E2E] hover:text-[#8B2222] transition-colors flex items-center gap-1"
          >
            Customize <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
