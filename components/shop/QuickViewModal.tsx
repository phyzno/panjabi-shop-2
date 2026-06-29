'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, PlayCircle, ShoppingCart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { getProductVariants, getProductById } from '@/lib/actions/product.actions';
import type { CollectionProduct } from './ProductCard';

type SizeMode = 'preset' | 'number';

export interface ExtendedCollectionProduct extends CollectionProduct {
  sizes?: string[];
  stock?: Record<string, number> | string;
  group_id?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  video_url?: string | null;
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
  product: incomingProduct,
  isOpen,
  onClose,
  size,
}: CollectionQuickViewModalProps) {
  const [product, setProduct] = useState<ExtendedCollectionProduct | null>(null);
  const [isChangingVariant, setIsChangingVariant] = useState(false);

  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [zoomBgPos, setZoomBgPos] = useState('50% 50%');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const [sizeMode, setSizeMode] = useState<SizeMode>('preset');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [colorVariants, setColorVariants] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const allAvailableSizes = product?.sizes || [];
  const productStock = typeof product?.stock === 'string'
    ? JSON.parse(product.stock)
    : (product?.stock || {});

  const dbPresetSizes = allAvailableSizes.filter(size => isNaN(Number(size)));
  const dbNumericSizes = allAvailableSizes.filter(size => !isNaN(Number(size)));

  const hasBothModes = dbPresetSizes.length > 0 && dbNumericSizes.length > 0;
  const activeSizes = sizeMode === 'preset' ? dbPresetSizes : dbNumericSizes;

  const maxStock = productStock[selectedSize] || 0;
  const isOutOfStock = maxStock === 0;

  useEffect(() => {
    let isMounted = true;

    const fetchVariants = async () => {
      if (isOpen && product?.group_id) {
        const res = await getProductVariants(product.group_id, product.id);
        if (res.success && res.data && isMounted) {
          setColorVariants(res.data);
        }
      } else {
        if (isMounted) setColorVariants([]);
      }
    };

    fetchVariants();

    return () => {
      isMounted = false;
    };
  }, [isOpen, product?.group_id, product?.id]);

  useEffect(() => {
    if (!isOpen || !incomingProduct) {
      setProduct(null);
      setModalImgIndex(0);
      setZoomBgPos('50% 50%');
      setIsFullscreenOpen(false);
      setShowVideo(false);
      setIsHoveringBtn(false);
      setIsExpanded(false);
      return;
    }

    setProduct(incomingProduct);
    setModalImgIndex(0);
    setZoomBgPos('50% 50%');
    setIsFullscreenOpen(false);
    setShowVideo(false);
    setIsHoveringBtn(false);
    setIsExpanded(false);

    const allAvailableSizes = incomingProduct.sizes || [];
    const dbPresetSizes = allAvailableSizes.filter(size => isNaN(Number(size)));
    const dbNumericSizes = allAvailableSizes.filter(size => !isNaN(Number(size)));

    const initialMode = dbPresetSizes.length > 0 ? 'preset' : 'number';
    setSizeMode(initialMode);

    const initialSizes = initialMode === 'preset' ? dbPresetSizes : dbNumericSizes;
    setSelectedSize(initialSizes[0] || '');

  }, [isOpen, incomingProduct]);

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
    if (isHoveringBtn || showVideo) return;
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

  // Pricing Logic Update
  const parsePrice = (price: string | number) => {
    const numericPrice = typeof price === 'number'
      ? price
      : Number(price.replace(/[^0-9.]/g, ''));
    return Number.isFinite(numericPrice) ? numericPrice : 0;
  };

  const rawPrice = parsePrice(product.price);
  const hasDiscount = (product.discount_percentage ?? 0) > 0;
  const finalDiscountedPrice = hasDiscount
    ? Math.round(rawPrice - (rawPrice * (product.discount_percentage! / 100)))
    : rawPrice;

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedSize) return;

    addItem({
      productId: String(product.id),
      productName: product.name,
      productType: 'readymade',
      image: product.images?.[0] || '',
      
      // 🎯 নতুন প্রাইসিং ফিল্ডগুলো
      originalUnitPrice: rawPrice,
      discountPercentage: product.discount_percentage || 0,
      unitPrice: finalDiscountedPrice,
      stitchingCharge: 0,
      
      sizeMode: sizeMode,
      sizeValue: selectedSize,
    });

    onClose();
  };

  const handleSwatchClick = async (swatchId: string) => {
    if (isChangingVariant || !product) return;
    setIsChangingVariant(true);

    try {
      // সার্ভার অ্যাকশন কল করে নতুন কালারের প্রোডাক্ট ডেটা আনা হচ্ছে
      const res = await getProductById(swatchId);

      if (res && res.success && res.data) {
        const p = res.data;

        // আপনার অ্যাপের ফরম্যাট অনুযায়ী ডেটা ম্যাপ করুন
        const formattedProduct: ExtendedCollectionProduct = {
          id: p.id.toString(),
          name: p.name,
          category: p.categoryName || p.category || 'Uncategorized',
          price: `৳ ${p.price}`,
          discount_percentage: p.discount_percentage || 0,
          images: p.images || [],
          description: p.description || '',
          sizes: (p.sizes as string[]) || [],
          stock: p.stock || {},
          group_id: p.group_id || null,
          color_name: p.color_name || null,
          color_hex: p.color_hex || null,
          video_url: p.video_url || null,
        };

        // লোকাল স্টেট আপডেট - চোখের পলকে মডালের কন্টেন্ট বদলে যাবে
        setProduct(formattedProduct);
        setModalImgIndex(0); // নতুন কালারের প্রথম ইমেজ দেখানোর জন্য
        setShowVideo(false);
        setIsExpanded(false);

        // নতুন প্রোডাক্টের সাইজ ও মোড ডাইনামিকালি সেটআপ
        const nextPresetSizes = (formattedProduct.sizes || []).filter(size => isNaN(Number(size)));
        const nextNumericSizes = (formattedProduct.sizes || []).filter(size => !isNaN(Number(size)));
        const nextMode = nextPresetSizes.length > 0 ? 'preset' : 'number';

        setSizeMode(nextMode);
        setSelectedSize(nextMode === 'preset' ? (nextPresetSizes[0] || '') : (nextNumericSizes[0] || ''));
      }
    } catch (error) {
      console.error("Failed to swap variant in modal:", error);
    } finally {
      setIsChangingVariant(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    router.push(`/shop/${product.id}`);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  const hasColorInfo = !!product.color_hex;
  const swatches = [
    ...(hasColorInfo ? [{ id: product.id, color_name: product.color_name || 'Current', color_hex: product.color_hex!, isCurrent: true }] : []),
    ...colorVariants
      .filter(v => String(v.id) !== String(product.id))
      .map(v => ({
        id: v.id,
        color_name: v.color_name || 'Variant',
        color_hex: v.color_hex || '#ffffff',
        isCurrent: false
      }))
  ];

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
        <div className={cn("w-full flex flex-col md:flex-row transition-all duration-300", isChangingVariant && "opacity-40 pointer-events-none")}>
          <button
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 z-50 w-9 h-9 bg-white/90 hover:bg-accent rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-white shadow-md transition-all active:scale-90 cursor-pointer',
              size?.closeButtonClassName,
            )}
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          {product.video_url && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="hidden md:flex absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 z-50 items-center gap-1.5 px-3 py-2 border border-[#D4D7C9] bg-[#F7F7F2] text-[#1C221A] font-sans text-[10px] uppercase tracking-[0.15em] -rotate-90 rounded-t-md shadow-sm transition-all hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] cursor-pointer origin-center"
            >
              {showVideo ? (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>View Images</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-[#C25934]" />
                  <span>Watch Video</span>
                </>
              )}
            </button>
          )}

          <div
            className={cn(
              'w-full md:w-1/2 h-[40vh] min-h-[300px] md:h-auto md:aspect-[3/4] bg-[#EBECE3] shrink-0 relative overflow-visible md:overflow-hidden z-10 md:z-auto group/modalimg',
              size?.galleryClassName,
            )}
            onMouseMove={handleMouseMove}
          >
            {showVideo && product.video_url ? (
              <div className="w-full h-full bg-black animate-in fade-in duration-300 overflow-hidden rounded-t-[24px] md:rounded-none">
                <iframe
                  src={getEmbedUrl(product.video_url)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <>
                <div className="w-full h-full relative cursor-crosshair overflow-hidden rounded-t-[24px] md:rounded-none">
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
                </div>

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
              </>
            )}

            {product.video_url && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="md:hidden absolute bottom-0 right-6 translate-y-1/2 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D4D7C9] bg-[#F7F7F2] text-[#1C221A] font-sans text-[11px] uppercase tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-95 transition-all cursor-pointer"
              >
                {showVideo ? (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 text-[#C25934]" />
                    <span>View Images</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5 text-[#C25934]" />
                    <span>Watch Video</span>
                  </>
                )}
              </button>
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

              {/* Extended Pricing Layout */}
              <div className="mb-5 flex items-center flex-wrap gap-3">
                <p
                  className={cn(
                    'font-sans text-xl font-medium text-[#C25934] tracking-[0.08em]',
                    size?.priceClassName,
                  )}
                >
                  ৳ {finalDiscountedPrice}
                </p>
                {hasDiscount && (
                  <>
                    <span className="line-through text-[#1C221A]/40 text-sm font-sans mt-0.5">
                      ৳ {rawPrice}
                    </span>
                    <span className="px-2.5 py-1 rounded-sm bg-[#C25934]/10 text-[#C25934] text-[11px] uppercase tracking-wider">
                      Save {product.discount_percentage}%
                    </span>
                  </>
                )}
              </div>

              <div className="w-10 h-[1px] bg-[#D4D7C9] mb-5"></div>

              {product.description && (
                <div className="mb-6">
                  {product.description.length > 250 ? (
                    !isExpanded ? (
                      <p
                        className={cn(
                          'font-sans text-sm text-[#1C221A]/75 leading-relaxed tracking-wide',
                          size?.descriptionClassName,
                        )}
                      >
                        {product.description.slice(0, 150).trim()}...
                        <button
                          type="button"
                          onClick={() => setIsExpanded(true)}
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-[#4A5D23]/10 text-[#4A5D23] text-[11px] uppercase tracking-wider hover:bg-[#4A5D23]/20 transition-all cursor-pointer align-middle border border-[#4A5D23]/20"
                        >
                          Read More
                        </button>
                      </p>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <div
                          className={cn(
                            'max-h-[140px] overflow-y-auto bg-[#EBECE3]/40 border border-[#D4D7C9]/60 rounded-xl p-3.5 font-sans text-sm text-[#1C221A]/80 leading-relaxed tracking-wide whitespace-pre-wrap pr-2 shadow-inner [scrollbar-width:thin] [scrollbar-color:#D4D7C9_transparent]',
                            size?.descriptionClassName,
                          )}
                        >
                          {product.description}
                        </div>
                        <div className="flex justify-end mt-1.5">
                          <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="text-[11px] font-sans uppercase tracking-widest text-[#C25934] hover:text-[#a14324] hover:underline transition-all cursor-pointer"
                          >
                            See Less
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <p
                      className={cn(
                        'font-sans text-sm text-[#1C221A]/75 leading-relaxed tracking-wide whitespace-pre-wrap',
                        size?.descriptionClassName,
                      )}
                    >
                      {product.description}
                    </p>
                  )}
                </div>
              )}

              {swatches.length > 0 && (
                <div className="mb-5">
                  <p className="font-sans text-sm font-medium uppercase tracking-[0.2em] text-[#1C221A] mb-3">
                    Available Colors
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {swatches.map((swatch, index) => (
                      <div key={`${swatch.id}-${index}`} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            if (!swatch.isCurrent) {
                              // 👇 রিডাইরেক্টের পরিবর্তে আমাদের নতুন সোয়াপ ফাংশন কল হবে
                              handleSwatchClick(swatch.id);
                            }
                          }}
                          disabled={isChangingVariant} // লোড হওয়ার সময় বাটন ডিজেবল থাকবে
                          className={cn(
                            "w-7 h-7 rounded-full border shadow-sm transition-all duration-300 relative flex items-center justify-center cursor-pointer",
                            swatch.isCurrent
                              ? "border-[#4A5D23] ring-2 ring-[#4A5D23]/30 scale-105"
                              : "border-[#D4D7C9] hover:border-[#4A5D23] hover:scale-105",
                            isChangingVariant && "cursor-not-allowed opacity-50"
                          )}
                          style={{ backgroundColor: swatch.color_hex }}
                        >
                          {swatch.isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                          )}
                        </button>

                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#17210C] text-white text-[10px] font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-md">
                          {swatch.color_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="font-sans text-sm font-medium uppercase tracking-[0.2em] text-[#1C221A]">
                    Choose Size
                  </p>
                  {hasBothModes && (
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
                  )}
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
                            'rounded-xl border py-1 md:py-3 lg:py-3 text-[12px] md:text-sm lg:text-sm font-medium tracking-[0.12em] transition-all cursor-pointer',
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
    </div>
  );
}

export default CollectionQuickViewModal;
