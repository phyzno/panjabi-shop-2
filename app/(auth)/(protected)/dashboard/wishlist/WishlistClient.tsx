'use client';

import React, { useState } from 'react';
import { Heart, Trash2, Eye, ArrowRight, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { toggleWishlistItem } from '@/lib/actions/wishlist.actions';
import { useRouter } from 'next/navigation';
import { CollectionQuickViewModal, ExtendedCollectionProduct } from '@/components/shop/QuickViewModal';

export default function WishlistClient({ userId, initialItems }: { userId: string, initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  
  const [selectedProduct, setSelectedProduct] = useState<ExtendedCollectionProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null; wishlistId: number | null }>({ 
    isOpen: false, 
    productId: null, 
    wishlistId: null 
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();

  const handleQuickView = (product: any) => {
    setSelectedProduct(product as ExtendedCollectionProduct);
    setIsQuickViewOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteModal.productId || !deleteModal.wishlistId) return;
    
    setIsDeleting(true);
    const res = await toggleWishlistItem(userId, deleteModal.productId);
    
    if (res.success) {
      setItems(items.filter(item => item.wishlist_id !== deleteModal.wishlistId));
      router.refresh();
    }
    
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, productId: null, wishlistId: null });
  };

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map(({ wishlist_id, product }) => {
            // 🎯 Pricing & Discount Logic for Wishlist Item
            const numericPrice = typeof product.price === 'number' 
              ? product.price 
              : Number(String(product.price).replace(/[^0-9.]/g, ''));
            const rawPrice = Number.isFinite(numericPrice) ? numericPrice : 0;
            const hasDiscount = (product.discount_percentage ?? 0) > 0;
            const discountedPrice = hasDiscount 
              ? Math.round(rawPrice - (rawPrice * (product.discount_percentage / 100))) 
              : rawPrice;
            const displayPricePrefix = product.has_price_variation ? "From ৳ " : "৳ ";

            return (
              <div 
                key={wishlist_id} 
                className="flex flex-row items-center gap-4 bg-white rounded-2xl p-3 sm:p-4 border border-[#D4D7C9]/50 shadow-[0_2px_10px_rgba(14,20,9,0.02)] hover:shadow-md transition-all group"
              >
                
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-[#EBECE3] rounded-xl overflow-hidden shrink-0 cursor-pointer" onClick={() => handleQuickView(product)}>
                  <img 
                    src={product.images?.[0] || '/placeholder.png'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h3 
                    onClick={() => handleQuickView(product)}
                    className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-[#17210C] truncate cursor-pointer hover:text-[#4A5D23] transition-colors"
                  >
                    {product.name}
                  </h3>

                  {/* 🎯 Updated Price Display */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-1">
                    <p className="font-sans text-xs sm:text-sm font-medium text-[#C25934] tracking-widest">
                      {displayPricePrefix}{discountedPrice.toLocaleString()}
                    </p>
                    {hasDiscount && (
                      <span className="line-through text-[#1C221A]/40 text-[10px] font-sans">
                        ৳ {rawPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#1C221A]/50 mt-1 sm:mt-2">
                    {product.category || 'Apparel'}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 pr-2">
                  <button 
                    onClick={() => handleQuickView(product)}
                    className="w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 flex items-center justify-center gap-2 bg-[#F8F9F5] border border-[#D4D7C9] text-[#1C221A] rounded-full sm:rounded-xl hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] transition-all cursor-pointer"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" /> 
                    <span className="hidden sm:inline font-sans text-[11px] uppercase tracking-widest font-medium">View</span>
                  </button>

                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, productId: product.id, wishlistId: wishlist_id })}
                    className="w-8 h-8 flex items-center justify-center text-accent hover:text-red-500 bg-[#F8F9F5] hover:bg-red-50 rounded-full sm:rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 sm:py-24 bg-white rounded-2xl border border-[#D4D7C9]/50 shadow-sm">
          <div className="w-16 h-16 bg-[#F8F9F5] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4D7C9]/40">
            <Heart className="w-6 h-6 text-[#1C221A]/30" />
          </div>
          <h3 className="font-heading text-base font-bold uppercase tracking-wider text-[#17210C] mb-2">
            Your Wishlist is Empty
          </h3>
          <p className="font-sans text-xs text-[#1C221A]/60 mb-6 px-4">
            Found something you love? Save it here to buy later.
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#4A5D23] text-white px-7 py-3.5 rounded-full font-sans text-xs uppercase tracking-[0.15em] shadow-md hover:bg-[#3D4C1D] transition-colors"
          >
            Start Exploring <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <CollectionQuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, productId: null, wishlistId: null })} />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setDeleteModal({ isOpen: false, productId: null, wishlistId: null })} 
              className="absolute top-4 right-4 p-2 bg-[#F8F9F5] rounded-full text-[#1C221A]/60 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-[#17210C] mb-2">Remove Item?</h3>
              <p className="font-sans text-xs text-[#1C221A]/60 mb-6 leading-relaxed">
                Are you sure you want to remove this piece from your curated wishlist?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, productId: null, wishlistId: null })}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-[#F8F9F5] border border-[#D4D7C9] text-[#1C221A] hover:bg-[#EBECE3] rounded-xl font-sans text-[11px] font-medium uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  Keep It
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl font-sans text-[11px] font-medium uppercase tracking-widest shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}