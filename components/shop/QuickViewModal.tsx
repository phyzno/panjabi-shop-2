'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, ShoppingCart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import type { CollectionProduct } from './ProductCard';

type SizeMode = 'preset' | 'number';

export interface ExtendedCollectionProduct extends CollectionProduct {
  sizes?: string[];
  stock?: Record<string, number> | string;
}

export interface CollectionQuickViewSizeProps {
  overlayClassName?: string;
  modalClassName?: string;
  galleryClassName?: string;
  closeButtonClassName?: string;
  navButtonClassName?: string;
  detailsClassName?: string;
  categoryClassName?: string;
  titleClassName?: string;
  priceClassName?: string;
  descriptionClassName?: string;
  primaryButtonClassName?: string;
  secondaryButtonClassName?: string;
}

interface CollectionQuickViewModalProps {
  product: ExtendedCollectionProduct | null;
  isOpen: boolean;
  onClose: () => void;
  size?: CollectionQuickViewSizeProps;
}

export function CollectionQuickViewModal({
  product,
  isOpen,
  onClose,
  size,
}: CollectionQuickViewModalProps) {
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [zoomBgPos, setZoomBgPos] = useState('50% 50%');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const [sizeMode, setSizeMode] = useState<SizeMode>('preset');
  const [selectedSize, setSelectedSize] = useState<string>(''); 
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const allAvailableSizes = product?.sizes || [];
  const productStock = typeof product?.stock === 'string'
    ? JSON.parse(product.stock)
    : (product?.stock || {});
  const dbPresetSizes = allAvailableSizes.filter(size => isNaN(Number(size)));
  const dbNumericSizes = allAvailableSizes.filter(size => !isNaN(Number(size)));
  const activeSizes = sizeMode === 'preset' ? dbPresetSizes : dbNumericSizes;
  const maxStock = productStock[selectedSize] || 0;
  const isOutOfStock = maxStock === 0;

  useEffect(() => {
    if (!isOpen || !product) {
      setModalImgIndex(0);
      setZoomBgPos('50% 50%');
      setIsFullscreenOpen(false);
      setIsHoveringBtn(false);
      return;
    }

    setModalImgIndex(0);
    setZoomBgPos('50% 50%');
    setIsFullscreenOpen(false);
    setIsHoveringBtn(false);

    // ডাইনামিক ডিফল্ট সাইজ সেটআপ
    const initialMode = dbPresetSizes.length > 0 ? 'preset' : 'number';
    setSizeMode(initialMode);

    const initialSizes = initialMode === 'preset' ? dbPresetSizes : dbNumericSizes;
    setSelectedSize(initialSizes[0] || '');

  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!product || !isOpen) {
    return null;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHoveringBtn) {
      return;
    }

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomBgPos(`${x}% ${y}%`);
  };

  const handlePrev = () => {
    setModalImgIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setModalImgIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const parsePrice = (price: string) => {
    const numericPrice = Number(price.replace(/[^0-9.]/g, ''));
    return Number.isFinite(numericPrice) ? numericPrice : 0;
  };

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedSize) return;

    const basePrice = parsePrice(product.price);

    addItem({
      productId: String(product.id),
      productName: product.name,
      productType: 'readymade',
      image: product.images?.[0] || '',
      unitPrice: basePrice,
      stitchingCharge: 0,
      sizeMode: sizeMode,
      sizeValue: selectedSize,
    });

    onClose();
  };

  const handleViewFullDetails = () => {
    onClose();
    router.push(`/shop/${product.id}`);
  };

  if (isFullscreenOpen) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
        <button
          onClick={() => setIsFullscreenOpen(false)}
          className={cn(
            'absolute top-6 right-6 z-50 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center',
            size?.closeButtonClassName,
          )}
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src={product.images[modalImgIndex]}
          alt="Fullscreen"
          className="w-full h-auto max-h-screen object-contain"
        />

        {product.images.length > 1 && (
          <div className="absolute bottom-10 flex gap-6">
            <button
              onClick={handlePrev}
              className={cn(
                'w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-white/40',
                size?.navButtonClassName,
              )}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                'w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md active:bg-white/40',
                size?.navButtonClassName,
              )}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div
        className={cn('absolute inset-0 bg-[#111410]/70 backdrop-blur-md transition-opacity', size?.overlayClassName)}
        onClick={onClose}
      ></div>

      <div
        className={cn(
          'relative w-full max-w-[900px] rounded-[24px] bg-[#F7F7F2] shadow-[0_28px_80px_rgba(14,20,9,0.2)] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 max-h-[90vh]',
          size?.modalClassName,
        )}
      >
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4 z-50 w-9 h-9 bg-white/90 hover:bg-accent rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-white shadow-md transition-all active:scale-90 cursor-pointer',
            size?.closeButtonClassName,
          )}
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div
          className={cn(
            'w-full md:w-1/2 h-[40vh] min-h-[300px] md:h-auto md:aspect-[3/4] bg-[#EBECE3] shrink-0 relative overflow-hidden group/modalimg',
            size?.galleryClassName,
          )}
          onMouseMove={handleMouseMove}
        >
          <img
            src={product.images[modalImgIndex]}
            alt={product.name}
            className={`w-full h-full object-cover block transition-opacity duration-200 ${isHoveringBtn ? 'opacity-100' : 'md:group-hover/modalimg:opacity-0'}`}
          />

          <div
            className={`hidden md:block absolute inset-0 bg-no-repeat cursor-crosshair transition-opacity duration-200 ${isHoveringBtn ? 'opacity-0' : 'opacity-0 group-hover/modalimg:opacity-100'}`}
            style={{
              backgroundImage: `url(${product.images[modalImgIndex]})`,
              backgroundPosition: zoomBgPos,
              backgroundSize: '200%',
            }}
          ></div>

          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="md:hidden absolute top-4 left-4 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md z-20"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {product.images.length > 1 && (
            <>
              <button
                onMouseEnter={() => setIsHoveringBtn(true)}
                onMouseLeave={() => setIsHoveringBtn(false)}
                onClick={handlePrev}
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 text-black rounded-full flex items-center justify-center hover:bg-white shadow-md active:scale-95 z-20 cursor-pointer',
                  size?.navButtonClassName,
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onMouseEnter={() => setIsHoveringBtn(true)}
                onMouseLeave={() => setIsHoveringBtn(false)}
                onClick={handleNext}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 text-black rounded-full flex items-center justify-center hover:bg-white shadow-md active:scale-95 z-20 cursor-pointer',
                  size?.navButtonClassName,
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setIsHoveringBtn(true)}
                    onMouseLeave={() => setIsHoveringBtn(false)}
                    onClick={() => setModalImgIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === modalImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div
          className={cn(
            'w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between overflow-y-auto',
            size?.detailsClassName,
          )}
        >
          <div>
            <span
              className={cn(
                'font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#4A5D23]/80 mb-3 inline-block',
                size?.categoryClassName,
              )}
            >
              {product.category}
            </span>
            <h2
              className={cn(
                'font-heading text-2xl md:text-3xl font-bold uppercase tracking-[0.08em] text-[#17210C] mb-3 leading-tight',
                size?.titleClassName,
              )}
            >
              {product.name}
            </h2>
            <p
              className={cn(
                'font-sans text-xl font-medium text-[#C25934] tracking-[0.08em] mb-5',
                size?.priceClassName,
              )}
            >
              {product.price}
            </p>

            <div className="w-10 h-[1px] bg-[#D4D7C9] mb-5"></div>

            <p
              className={cn(
                'font-sans text-sm text-[#1C221A]/75 leading-relaxed tracking-wide mb-6',
                size?.descriptionClassName,
              )}
            >
              {product.description}
            </p>

            <div className="mb-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="font-sans text-sm font-medium uppercase tracking-[0.2em] text-[#1C221A]">
                  Choose Size
                </p>
                <div className="inline-flex rounded-full bg-[#EBECE3] p-1">
                  <button
                    type="button"
                    disabled={dbPresetSizes.length === 0}
                    onClick={() => {
                      setSizeMode('preset');
                      setSelectedSize(dbPresetSizes[0] || '');
                    }}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer',
                      dbPresetSizes.length === 0 && 'opacity-50 cursor-not-allowed',
                      sizeMode === 'preset' ? 'bg-white text-[#4A5D23] shadow-sm' : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                    )}
                  >
                    Preset
                  </button>
                  <button
                    type="button"
                    disabled={dbNumericSizes.length === 0}
                    onClick={() => {
                      setSizeMode('number');
                      setSelectedSize(dbNumericSizes[0] || '');
                    }}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer',
                      dbNumericSizes.length === 0 && 'opacity-50 cursor-not-allowed',
                      sizeMode === 'number' ? 'bg-white text-[#4A5D23] shadow-sm' : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                    )}
                  >
                    Number
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
                {activeSizes.length > 0 ? (
                  activeSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const stockForSize = productStock[size] || 0;
                    const outOfStock = stockForSize === 0;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          'rounded-xl border py-1 md:py-3 lg:py-3 text-[12px] md:text-sm lg:text-sm font-medium uppercase tracking-[0.12em] transition-all cursor-pointer',
                          outOfStock && !isSelected
                            ? 'border-[#D4D7C9]/50 bg-[#F8F9F5] text-[#1C221A]/30 line-through hover:border-[#1C221A]/40'
                            : isSelected
                              ? 'border-[#4A5D23] bg-[#4A5D23] text-white shadow-[0_10px_22px_rgba(74,93,35,0.16)]'
                              : 'border-[#D4D7C9] bg-white hover:bg-[#F8F9F5] text-[#1C221A] hover:border-[#1C221A]/40'
                        )}
                      >
                        {size}
                      </button>
                    );
                  })
                ) : (
                  <p className="col-span-6 text-sm font-sans text-[#1C221A]/50 py-2">No sizes available.</p>
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
          </div>

          <div className="grid gap-3 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !selectedSize}
              className={cn(
                'w-full rounded-full py-3.5 flex items-center justify-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.2em] shadow-[0_12px_30px_rgba(74,93,35,0.2)] transition-all duration-300',
                isOutOfStock || !selectedSize
                  ? 'bg-[#EBECE3] text-[#1C221A]/40 cursor-not-allowed border border-[#D4D7C9]'
                  : 'bg-[#4A5D23] text-white hover:bg-[#3D4C1D] active:scale-[0.98] cursor-pointer',
                size?.primaryButtonClassName
              )}
            >
              <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleViewFullDetails}
              className={cn(
                'w-full rounded-full border border-[#D4D7C9] bg-transparent text-[#1C221A] py-3.5 font-sans text-[12px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 hover:border-[#1C221A] cursor-pointer',
                size?.secondaryButtonClassName
              )}
            >
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionQuickViewModal;
