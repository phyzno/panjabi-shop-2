'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Heart, ShoppingCart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { toggleWishlistItem } from '@/lib/actions/wishlist.actions';
import { QuickAddModal } from './QuickAddModal';
import { useWishlistStore } from '@/store/wishlistStore';

export type CollectionProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  images: string[];
  description: string;
  sizes?: string[];
  stock?: Record<string, number> | string;
};

export interface CollectionProductCardSizeProps {
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
  imageClassName?: string;
  imageStyle?: React.CSSProperties;
  categoryBadgeClassName?: string;
  categoryBadgeStyle?: React.CSSProperties;
  iconButtonClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  priceClassName?: string;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  buttonTextClassName?: string;
}

export interface CollectionProductCardProps {
  product: CollectionProduct;
  onQuickView?: (product: CollectionProduct) => void;
  className?: string;
  size?: CollectionProductCardSizeProps;
}

export function CollectionProductCard({
  product,
  onQuickView,
  className,
  size,
}: CollectionProductCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const { wishlistedIds, addWishlistId, removeWishlistId } = useWishlistStore();
  const productIdNum = Number(product.id);  
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const isWishlisted = wishlistedIds.includes(productIdNum); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  // স্টক ক্যালকুলেশন
  const productStock = typeof product.stock === 'string'
    ? JSON.parse(product.stock)
    : (product.stock || {});
    
  // সব সাইজের স্টক যোগ করে দেখা হচ্ছে প্রোডাক্টটি আদৌ স্টকে আছে কি না
  const totalStock = Object.values(productStock).reduce((sum: any, val: any) => sum + (Number(val) || 0), 0) as number;
  const isCompletelyOutOfStock = (product.sizes?.length ?? 0) > 0 && totalStock === 0;

  const handleCardClick = () => {
    router.push(`/shop/${product.id}`);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setIsWishlistLoading(true);
    try {
      const res = await toggleWishlistItem(user.id, productIdNum);
      if (res.success) {
        if (isWishlisted) {
          removeWishlistId(productIdNum);
        } else {
          addWishlistId(productIdNum);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          'w-[75vw] sm:w-[280px] lg:w-[270px] flex-shrink-0 snap-center h-full group flex flex-col rounded-[24px] bg-white border border-[#D4D7C9] shadow-[0_12px_40px_rgba(14,20,9,0.05)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(14,20,9,0.1)] cursor-pointer relative',
          size?.cardClassName,
          className,
        )}
        style={size?.cardStyle}
      >
        <div
          className={cn(
            'relative aspect-[4/5] w-full bg-[#EBECE3] overflow-hidden',
            size?.imageClassName,
          )}
          style={size?.imageStyle}
        >
          <div
            className={cn(
              'absolute top-3 left-3 rounded-full bg-[#4A5D23]/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4A5D23] z-10 backdrop-blur-sm',
              size?.categoryBadgeClassName,
            )}
            style={size?.categoryBadgeStyle}
          >
            {product.category}
          </div>

          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={cn(
              "w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105",
              isCompletelyOutOfStock && "opacity-60 grayscale-[0.3]"
            )}
          />

          {/* Out of Stock Overlay */}
          {isCompletelyOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/30 backdrop-blur-[2px]">
              <div className="bg-black/80 text-white px-4 py-2 rounded-sm font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                Out of Stock
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            <button
              onClick={handleWishlistClick}
              disabled={isWishlistLoading}
              className={cn(
                'w-8 h-8 bg-white/95 backdrop-blur-sm text-[#1C221A]/70 hover:text-[#C25934] rounded-full flex items-center justify-center shadow-md transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50',
                isWishlisted && 'text-[#C25934]',
                size?.iconButtonClassName,
              )}
              aria-label="Add to Wishlist"
            >
              {isWishlistLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-[#C25934] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart className={cn("w-[15px] h-[15px] stroke-[1.5]", isWishlisted && "fill-[#C25934]")} />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView?.(product);
              }}
              className={cn(
                'w-8 h-8 bg-white/95 backdrop-blur-sm text-[#1C221A]/70 hover:text-[#C25934] rounded-full flex items-center justify-center shadow-md transition-all duration-300 active:scale-95 cursor-pointer',
                size?.iconButtonClassName,
              )}
              aria-label="Quick View"
            >
              <Eye className="w-[15px] h-[15px] stroke-[1.5]" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            'flex-1 p-5 flex flex-col justify-between gap-4',
            size?.contentClassName,
          )}
        >
          <div>
            <h3
              className={cn(
                'font-heading text-[16px] font-semibold uppercase tracking-[0.08em] text-[#1C221A] leading-tight mb-2 truncate',
                size?.titleClassName,
              )}
            >
              {product.name}
            </h3>
            <span
              className={cn(
                'font-sans text-[13px] font-medium uppercase tracking-[0.15em] text-[#C25934]',
                size?.priceClassName,
              )}
            >
              {product.price}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isCompletelyOutOfStock) {
                setIsQuickAddOpen(true);
              }
            }}
            disabled={isCompletelyOutOfStock}
            className={cn(
              'w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300',
              isCompletelyOutOfStock
                ? 'bg-[#EBECE3] text-[#1C221A]/40 cursor-not-allowed border border-[#D4D7C9]'
                : 'bg-[#4A5D23] text-white shadow-[0_8px_20px_rgba(74,93,35,0.2)] hover:bg-[#3D4C1D] active:scale-[0.98] cursor-pointer',
              size?.buttonClassName,
            )}
            style={size?.buttonStyle}
          >
            <ShoppingCart className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className={cn(size?.buttonTextClassName)}>
              {isCompletelyOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal 
        product={product} 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)}
      />
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 p-2 bg-[#F8F9F5] rounded-full text-[#1C221A]/60 hover:text-red-500 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-heading text-lg font-bold text-[#17210C] uppercase tracking-wide mb-2 mt-4">Login Required</h3>
            <p className="font-sans text-xs text-[#1C221A]/70 mb-6 px-2">
              You need to be logged in to save pieces to your curated wishlist.
            </p>
            <button 
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
              className="w-full py-3 bg-[#4A5D23] text-white rounded-xl font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg hover:bg-[#3D4C1D] transition-colors cursor-pointer"
            >
              Log In Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CollectionProductCard;
