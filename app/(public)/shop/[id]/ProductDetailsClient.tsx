"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, Heart, RotateCcw, Ruler, ShieldCheck,
  ShoppingBag, Star, Truck, ChevronLeft, ChevronRight, Maximize2, X
} from 'lucide-react';
import { SizeGuideModal } from '@/components/ui/SizeGuideModal';
import type { CollectionProduct } from '@/components/shop/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toggleWishlistItem } from '@/lib/actions/wishlist.actions';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlistStore';

const detailSections = [
  {
    title: 'Fabric & Material',
    content:
      'Premium woven fabric with refined tailoring. Each piece is selected to complement the silhouette while keeping comfort in focus.',
  },
  {
    title: 'Sizing & Fit',
    content:
      'Fits true to size with a balanced drape. Use the size selector below or visit our measurement guide for a custom fit.',
  },
  {
    title: 'Care Instructions',
    content:
      'Dry clean only. Keep it in a breathable garment bag and avoid direct ironing on detailing.',
  },
] as const;

type SizeMode = 'preset' | 'number';

interface ProductDetailsClientProps {
  product: CollectionProduct & { sizes?: string[], stock?: Record<string, number> };
  relatedProducts: CollectionProduct[];
}

export default function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const { wishlistedIds, addWishlistId, removeWishlistId } = useWishlistStore();
  const productIdNum = Number(product.id);
  const isWishlisted = wishlistedIds.includes(productIdNum);

  // Gallery States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomBgPos, setZoomBgPos] = useState('50% 50%');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Database Sizes & Stock
  const allAvailableSizes = product?.sizes || [];

  const productStock = typeof product?.stock === 'string'
    ? JSON.parse(product.stock)
    : (product?.stock || {});

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedSize) return;

    // প্রাইস যদি স্ট্রিং বা ফরম্যাটেড আকারে থাকে তবে তা সেফলি নাম্বারে কনভার্ট করা
    const numericPrice = typeof product.price === 'number'
      ? product.price
      : Number(String(product.price).replace(/[^0-9.]/g, ''));

    addItem({
      productId: String(product.id),
      productName: product.name,
      productType: 'readymade',
      image: product.images?.[0] || '',
      unitPrice: numericPrice,
      stitchingCharge: 0,
      sizeMode: sizeMode,
      sizeValue: selectedSize,
    });
  };

  const handleWishlistClick = async () => {
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

  // সাইজগুলোকে ডায়নামিকভাবে দুই ভাগে ভাগ করা হচ্ছে
  const dbPresetSizes = allAvailableSizes.filter(size => isNaN(Number(size))); // যেগুলো নাম্বার নয় (S, M, L)
  const dbNumericSizes = allAvailableSizes.filter(size => !isNaN(Number(size))); // যেগুলো নাম্বার (38, 40)

  // Size Toggle States
  const [sizeMode, setSizeMode] = useState<SizeMode>('preset');
  const [selectedSize, setSelectedSize] = useState<string>('');

  const [quantity, setQuantity] = useState(1);
  const [openTab, setOpenTab] = useState<number | null>(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // যে মোডটি সিলেক্ট করা আছে, সেটির সাইজগুলো বের করা
  const activeSizes = sizeMode === 'preset' ? dbPresetSizes : dbNumericSizes;

  useEffect(() => {
    if (!product) return;
    setActiveImageIndex(0);
    setZoomBgPos('50% 50%');
    setIsFullscreenOpen(false);
    setIsHoveringBtn(false);

    // প্রোডাক্ট লোড হওয়ার পর ডিফল্ট মোড এবং সাইজ সেট করা
    const initialMode = dbPresetSizes.length > 0 ? 'preset' : 'number';
    setSizeMode(initialMode);

    const initialSizes = initialMode === 'preset' ? dbPresetSizes : dbNumericSizes;
    setSelectedSize(initialSizes[0] || '');

    setQuantity(1);
    setOpenTab(0);
  }, [product]);

  // Gallery Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHoveringBtn) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomBgPos(`${x}% ${y}%`);
  };

  const handlePrev = () => {
    if (!product) return;
    setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!product) return;
    setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const toggleTab = (index: number) => {
    setOpenTab((current) => (current === index ? null : index));
  };

  // স্টক লজিক
  const maxStock = productStock[selectedSize] || 0;
  const isOutOfStock = maxStock === 0;

  // প্রোডাক্ট না থাকলে এম্পটি স্টেট দেখাবে
  if (!product) {
    return (
      <div className="bg-[#F8F9F5] min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-[#D4D7C9] bg-white p-8 text-center shadow-[0_12px_40px_rgba(14,20,9,0.05)]">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#4A5D23]/70 mb-3">
              Product not found
            </p>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.1em] text-[#17210C] mb-4">
              This product is unavailable
            </h1>
            <p className="font-sans text-sm leading-relaxed text-[#1C221A]/75 mb-6">
              The selected item could not be found in the current collection. Please go back and choose another product.
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="inline-flex items-center justify-center rounded-full bg-[#4A5D23] px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-white shadow-[0_10px_25px_rgba(74,93,35,0.2)]"
            >
              Back to collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen UI
  if (isFullscreenOpen) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center select-none">
        <button
          onClick={() => setIsFullscreenOpen(false)}
          className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src={product.images[activeImageIndex]}
          alt="Fullscreen"
          className="w-full h-auto max-h-screen object-contain"
        />

        {product.images.length > 1 && (
          <div className="absolute bottom-10 flex gap-6">
            <button
              onClick={handlePrev}
              className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-white/40 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-white/40 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9F5] min-h-screen pt-10 pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">

          {/* Gallery Section */}
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:sticky top-24">
            <div className="flex flex-row md:flex-col gap-3 shrink-0 justify-center md:justify-start overflow-x-auto md:overflow-visible">
              {product.images.map((img, i) => (
                <button
                  key={`${product.id}-${i}`}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-16 h-20 md:w-20 md:h-24 shrink-0 rounded-lg overflow-hidden border bg-white transition-all duration-300 cursor-pointer ${activeImageIndex === i
                    ? 'border-[#4A5D23] shadow-sm scale-102'
                    : 'border-[#EBECE3] hover:border-[#D4D7C9]'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div
              className="flex-1 aspect-[4/5] bg-[#EBECE3] rounded-[24px] overflow-hidden border border-[#EBECE3] relative group/modalimg"
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-200 ${isHoveringBtn ? 'opacity-100' : 'md:group-hover/modalimg:opacity-0'}`}
              />

              <div
                className={`hidden md:block absolute inset-0 bg-no-repeat cursor-crosshair transition-opacity duration-200 ${isHoveringBtn ? 'opacity-0' : 'opacity-0 group-hover/modalimg:opacity-100'}`}
                style={{
                  backgroundImage: `url(${product.images[activeImageIndex]})`,
                  backgroundPosition: zoomBgPos,
                  backgroundSize: '200%',
                }}
              ></div>

              <button
                onClick={() => setIsFullscreenOpen(true)}
                className="md:hidden absolute top-4 right-4 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md z-20 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {product.images.length > 1 && (
                <>
                  <button
                    onMouseEnter={() => setIsHoveringBtn(true)}
                    onMouseLeave={() => setIsHoveringBtn(false)}
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 text-black rounded-full flex items-center justify-center hover:bg-white shadow-md active:scale-95 z-20 cursor-pointer opacity-100 md:opacity-0 md:group-hover/modalimg:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onMouseEnter={() => setIsHoveringBtn(true)}
                    onMouseLeave={() => setIsHoveringBtn(false)}
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 text-black rounded-full flex items-center justify-center hover:bg-white shadow-md active:scale-95 z-20 cursor-pointer opacity-100 md:opacity-0 md:group-hover/modalimg:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#4A5D23]">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C25934] text-[#C25934]" />
                  ))}
                </div>
                <span className="font-sans text-xs text-[#1C221A]/50 font-medium">
                  (24 reviews)
                </span>
              </div>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.05em] text-[#17210C] mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="font-sans text-2xl font-medium text-[#C25934] tracking-[0.05em] mb-6">
              {product.price}
            </p>

            <div className="w-full h-[1px] bg-[#D4D7C9]/60 mb-6" />

            <p className="font-sans text-[14px] leading-relaxed text-[#1C221A]/75 mb-8">
              {product.description}
            </p>

            {/* Sizing & Stock Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#17210C]">
                    Select Size
                  </span>

                  {/* Size Mode Toggle - শুধুমাত্র যদি দুই ধরণের সাইজ থাকে তবেই দেখাবে */}
                  {(dbPresetSizes.length > 0 || dbNumericSizes.length > 0) && (
                    <div className="inline-flex rounded-full bg-[#EBECE3] p-1">
                      <button
                        type="button"
                        disabled={dbPresetSizes.length === 0}
                        onClick={() => {
                          setSizeMode('preset');
                          setSelectedSize(dbPresetSizes[0] || '');
                          setQuantity(1);
                        }}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all ${dbPresetSizes.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${sizeMode === 'preset'
                            ? 'bg-white text-[#4A5D23] shadow-sm'
                            : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                          }`}
                      >
                        Preset
                      </button>
                      <button
                        type="button"
                        disabled={dbNumericSizes.length === 0}
                        onClick={() => {
                          setSizeMode('number');
                          setSelectedSize(dbNumericSizes[0] || '');
                          setQuantity(1);
                        }}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all ${dbNumericSizes.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${sizeMode === 'number'
                            ? 'bg-white text-[#4A5D23] shadow-sm'
                            : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                          }`}
                      >
                        Number
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 font-sans text-[11px] font-medium uppercase tracking-widest text-[#4A5D23] hover:underline underline-offset-4 cursor-pointer transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>

              {/* ডায়নামিক সাইজ রেন্ডারিং */}
              <div className="flex flex-wrap gap-3">
                {activeSizes.length > 0 ? (
                  activeSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const stockForSize = productStock[size] || 0;
                    const outOfStock = stockForSize === 0;

                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        className={`w-12 h-12 flex items-center justify-center text-xs font-sans font-medium border transition-all duration-300 cursor-pointer ${outOfStock && !isSelected
                          ? 'border-[#D4D7C9]/50 bg-[#F8F9F5] text-[#1C221A]/30 line-through hover:border-[#1C221A]/40'
                          : isSelected
                            ? 'border-[#4A5D23] bg-[#4A5D23] text-white shadow-md'
                            : 'border-[#D4D7C9] bg-white text-[#1C221A] hover:border-[#4A5D23]'
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm font-sans text-[#1C221A]/50 py-2">No sizes available in this category.</p>
                )}
              </div>

              {/* স্টক স্ট্যাটাস মেসেজ */}
              {selectedSize && (
                <div className="mt-3 min-h-[20px]">
                  {isOutOfStock ? (
                    <span className="font-sans text-[11px] font-medium text-red-500 uppercase tracking-wider">
                      Currently out of stock for size {selectedSize}
                    </span>
                  ) : (
                    <span className="font-sans text-[11px] font-medium text-[#4A5D23] uppercase tracking-wider">
                      {maxStock} item{maxStock > 1 ? 's' : ''} available in stock
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Responsive Actions Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* Quantity Selector - স্টক অনুযায়ী রেস্ট্রিক্ট করা */}
              <div className="flex items-center justify-between border border-[#D4D7C9] bg-white h-14 px-4 w-full sm:w-[140px] shrink-0">
                <button
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={isOutOfStock}
                  className={`text-lg p-2 ${isOutOfStock ? 'text-[#1C221A]/20 cursor-not-allowed' : 'text-[#1C221A]/60 hover:text-[#1C221A] cursor-pointer'}`}
                >
                  -
                </button>
                <span className="font-sans font-medium text-sm w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((current) => (current < maxStock ? current + 1 : current))}
                  disabled={quantity >= maxStock || isOutOfStock}
                  className={`text-lg p-2 ${quantity >= maxStock || isOutOfStock ? 'text-[#1C221A]/20 cursor-not-allowed' : 'text-[#1C221A]/60 hover:text-[#1C221A] cursor-pointer'}`}
                >
                  +
                </button>
              </div>

              {/* Add to Cart and Wishlist Row Wrapper */}
              <div className="flex flex-row gap-3 flex-1 w-full">
                {/* Add to Cart Button Update */}
                <button
                  disabled={isOutOfStock || !selectedSize}
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 font-sans text-xs font-medium uppercase tracking-[0.2em] shadow-[0_10px_25px_rgba(74,93,35,0.2)] transition-all flex items-center justify-center gap-3 ${isOutOfStock || !selectedSize
                    ? 'bg-[#EBECE3] text-[#1C221A]/40 cursor-not-allowed border border-[#D4D7C9]'
                    : 'bg-[#4A5D23] text-white hover:bg-[#3D4D1D] active:scale-[0.99] cursor-pointer'
                    }`}
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                {/* Wishlist Button Update */}
                <button
                  onClick={handleWishlistClick}
                  disabled={isWishlistLoading}
                  className="w-14 h-14 border border-[#D4D7C9] bg-white flex items-center justify-center text-[#1C221A]/70 hover:text-[#C25934] hover:border-[#C25934] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isWishlistLoading ? (
                    <div className="w-5 h-5 border-2 border-[#C25934] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={cn("w-5 h-5 stroke-[1.5]", isWishlisted && "fill-[#C25934] text-[#C25934]")} />
                  )}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-5 border-y border-[#D4D7C9]/40 mb-8 text-center bg-white/40 rounded-xl px-2">
              <div className="flex flex-col items-center justify-center gap-1">
                <ShieldCheck className="w-5 h-5 text-[#4A5D23]" />
                <span className="font-sans text-[9px] font-medium uppercase tracking-wider text-[#17210C]">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <Truck className="w-5 h-5 text-[#4A5D23]" />
                <span className="font-sans text-[9px] font-medium uppercase tracking-wider text-[#17210C]">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <RotateCcw className="w-5 h-5 text-[#4A5D23]" />
                <span className="font-sans text-[9px] font-medium uppercase tracking-wider text-[#17210C]">Easy Returns</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-3">
              {detailSections.map((item, index) => {
                const isOpen = openTab === index;
                return (
                  <div key={item.title} className="border-b border-[#D4D7C9]/50 pb-3">
                    <button
                      onClick={() => toggleTab(index)}
                      className="w-full flex justify-between items-center py-2 text-left font-heading text-[13px] font-bold uppercase tracking-wider text-[#17210C] hover:text-[#4A5D23] transition-colors cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#1C221A]/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#4A5D23]' : ''
                          }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                      <div className="overflow-hidden font-sans text-xs leading-relaxed text-[#1C221A]/60 pr-4">
                        {item.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-28 border-t border-[#D4D7C9]/60 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#4A5D23]/70 text-center mb-2">
            Complete the Look
          </p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-[#17210C] text-center mb-12">
            Related Products
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
            {relatedProducts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(`/shop/${item.id}`)}
                className="group flex flex-col rounded-2xl bg-white border border-[#EBECE3] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md text-left cursor-pointer"
              >
                <div className="aspect-[4/5] w-full bg-[#EBECE3] overflow-hidden relative">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <h3 className="font-heading text-[13px] font-bold uppercase tracking-wide text-[#1C221A] truncate">
                    {item.name}
                  </h3>
                  <span className="font-sans text-[12px] font-medium text-[#C25934]">{item.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
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
    </div>
  );
}
