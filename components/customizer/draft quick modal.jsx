'use client';

import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, PlayCircle, Scissors, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFabricVariants, getFabricById } from '@/lib/actions/fabric.actions';

// Fabric-এর স্কিমা অনুযায়ী ইন্টারফেস তৈরি করা হলো
export interface ExtendedFabric {
  id: number;
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  discount_percentage?: number | null;
  texture_url: string;
  raw_image_url?: string | null;
  video_url?: string | null;
  preview_images?: string[] | null;
  allowed_products?: string[] | null;
  group_id?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  yards?: number | null;
}

interface FabricQuickViewModalProps {
  fabric: ExtendedFabric | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectFabric: (fabricId: number) => void; // কাস্টমাইজারে সিলেক্ট করার জন্য
}

export function FabricQuickViewModal({ fabric: incomingFabric, isOpen, onClose, onSelectFabric }: FabricQuickViewModalProps) {
  const [fabric, setFabric] = useState<ExtendedFabric | null>(null);
  const [isChangingVariant, setIsChangingVariant] = useState(false);

  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [zoomBgPos, setZoomBgPos] = useState('50% 50%');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // গ্যালারিতে ভিডিও টগল করার স্টেট
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const [colorVariants, setColorVariants] = useState<Pick<ExtendedFabric, 'id' | 'color_name' | 'color_hex'>[]>([]);

  // Prepare images array combining preview_images and texture_url
  const allImages = useMemo(() => {
  if (!fabric) return [];
  // যদি preview_images থাকে এবং তা ফাঁকা না হয়, তবে শুধু সেগুলোই রিটার্ন করবে
  if (fabric.preview_images && fabric.preview_images.length > 0) {
    return fabric.preview_images;
  }
  // preview_images না থাকলে ফলব্যাক হিসেবে texture_url দেখাবে
  return fabric.texture_url ? [fabric.texture_url] : [];
}, [fabric]);

  useEffect(() => {
    let isMounted = true;
    const fetchVariants = async () => {
      if (isOpen && fabric?.group_id) {
        const res = await getFabricVariants(fabric.group_id, fabric.id);
        if (res.success && res.data && isMounted) {
          setColorVariants(res.data);
        }
      } else {
        if (isMounted) setColorVariants([]);
      }
    };
    fetchVariants();
    return () => { isMounted = false; };
  }, [isOpen, fabric?.group_id, fabric?.id]);

  useEffect(() => {
    if (!isOpen || !incomingFabric) {
      setFabric(null);
      setModalImgIndex(0);
      setZoomBgPos('50% 50%');
      setIsFullscreenOpen(false);
      setShowVideo(false);
      return;
    }
    setFabric(incomingFabric);
    setModalImgIndex(0);
    setShowVideo(false);
  }, [isOpen, incomingFabric]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!fabric || !isOpen) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHoveringBtn || showVideo) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomBgPos(`${x}% ${y}%`);
  };

  const rawPrice = Number(fabric.price);
  const hasDiscount = (fabric.discount_percentage ?? 0) > 0;
  const finalDiscountedPrice = hasDiscount
    ? Math.round(rawPrice - (rawPrice * (fabric.discount_percentage! / 100)))
    : rawPrice;

  const maxStock = fabric.yards || 0;
  const isOutOfStock = maxStock <= 0;

  const handleSwatchClick = async (swatchId: number) => {
    if (isChangingVariant || !fabric) return;
    setIsChangingVariant(true);

    try {
      const res = await getFabricById(swatchId);
      if (res && res.success && res.data) {
        setFabric(res.data as ExtendedFabric);
        setModalImgIndex(0);
        setShowVideo(false); // ভ্যারিয়েন্ট চেঞ্জ করলে ভিডিও বন্ধ হয়ে ইমেজ আসবে
      }
    } catch (error) {
      console.error("Failed to swap variant:", error);
    } finally {
      setIsChangingVariant(false);
    }
  };

  // Video embed helper
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url; 
  };

  const hasColorInfo = !!fabric.color_hex;
  const swatches = [
    ...(hasColorInfo ? [{ id: fabric.id, color_name: fabric.color_name || 'Current', color_hex: fabric.color_hex!, isCurrent: true }] : []),
    ...colorVariants.map(v => ({
      id: v.id, color_name: v.color_name || 'Variant', color_hex: v.color_hex || '#ffffff', isCurrent: false
    }))
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#111410]/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[900px] rounded-[24px] bg-[#F7F7F2] shadow-[0_28px_80px_rgba(14,20,9,0.2)] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 max-h-[90vh]">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 bg-white/90 hover:bg-[#4A5D23] hover:text-white rounded-full flex items-center justify-center text-[#1C221A]/70 shadow-md transition-all active:scale-90 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Left Side: Image Gallery OR Video */}
        <div className={cn("w-full md:w-1/2 h-[40vh] min-h-[300px] md:h-auto md:aspect-[3/4] bg-[#EBECE3] shrink-0 relative overflow-hidden group/modalimg transition-all duration-300", isChangingVariant && "opacity-40 pointer-events-none")}>
          
          {showVideo && fabric.video_url ? (
            <div className="w-full h-full bg-black animate-in fade-in duration-300">
              <iframe 
                src={getEmbedUrl(fabric.video_url)} 
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <>
              {allImages.length > 0 ? (
                <div onMouseMove={handleMouseMove} className="w-full h-full relative cursor-crosshair">
                  <img
                    src={allImages[modalImgIndex]}
                    alt={fabric.name}
                    className={`w-full h-full object-cover block transition-opacity duration-200 ${isHoveringBtn ? 'opacity-100' : 'md:group-hover/modalimg:opacity-0'}`}
                  />
                  <div
                    className={`hidden md:block absolute inset-0 bg-no-repeat transition-opacity duration-200 ${isHoveringBtn ? 'opacity-0' : 'opacity-0 group-hover/modalimg:opacity-100'}`}
                    style={{
                      backgroundImage: `url(${allImages[modalImgIndex]})`,
                      backgroundPosition: zoomBgPos,
                      backgroundSize: '200%',
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1C221A]/30">No Image Available</div>
              )}

              <button
                onClick={() => setIsFullscreenOpen(true)}
                className="md:hidden absolute top-4 left-4 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md z-20"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onMouseEnter={() => setIsHoveringBtn(true)}
                    onMouseLeave={() => setIsHoveringBtn(false)}
                    onClick={() => setModalImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 text-black rounded-full flex items-center justify-center hover:bg-white shadow-md active:scale-95 z-20 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onMouseEnter={() => setIsHoveringBtn(true)}
                    onMouseLeave={() => setIsHoveringBtn(false)}
                    onClick={() => setModalImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 text-black rounded-full flex items-center justify-center hover:bg-white shadow-md active:scale-95 z-20 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
                    {allImages.map((_, i) => (
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
        </div>

        {fabric.video_url && (
          <button
            type="button"
            onClick={() => setShowVideo(!showVideo)}
            aria-label={showVideo ? 'View fabric images' : 'Watch fabric video'}
            className={cn(
              "absolute z-40 right-0 top-[calc(max(40vh,_300px)_-_20px)] h-10 rounded-l-full rounded-r-none border border-white/80 bg-[#17210C] px-3 pr-4 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(14,20,9,0.22)] backdrop-blur-md transition-all duration-300 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2",
              "md:right-auto md:left-1/2 md:top-[68%] md:h-9 md:-translate-x-1/2 md:-translate-y-1/2 md:rotate-90 md:rounded-full md:px-4 md:pr-4 md:tracking-[0.2em]",
              showVideo
                ? "border-[#D4D7C9] bg-[#F7F7F2] text-[#17210C] hover:bg-white"
                : "hover:bg-[#4A5D23]"
            )}
          >
            {showVideo ? <ImageIcon className="w-4 h-4 stroke-[1.6]" /> : <PlayCircle className="w-4 h-4 stroke-[1.6]" />}
            <span className="md:hidden">{showVideo ? 'View Images' : 'Watch Video'}</span>
            <span className="hidden md:inline">{showVideo ? 'Images' : 'Video'}</span>
          </button>
        )}

        {/* Right Side: Details */}
        <div className={cn("w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between overflow-y-auto", isChangingVariant && "opacity-40 pointer-events-none")}>
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#4A5D23]/80 inline-block bg-[#4A5D23]/10 px-2.5 py-1 rounded-sm">
                ID: {fabric.sku || fabric.id}
              </span>
            </div>

            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-[0.08em] text-[#17210C] mb-3 leading-tight">
              {fabric.name}
            </h2>

            {/* Pricing Layout */}
            <div className="mb-5 flex items-center flex-wrap gap-3">
              <p className="font-sans text-xl font-medium text-[#C25934] tracking-[0.08em]">
                ৳ {finalDiscountedPrice} <span className="text-sm text-[#1C221A]/50 lowercase font-normal">/ yard</span>
              </p>
              {hasDiscount && (
                <>
                  <span className="line-through text-[#1C221A]/40 text-sm font-sans mt-0.5">
                    ৳ {rawPrice}
                  </span>
                  <span className="px-2.5 py-1 rounded-sm bg-[#C25934]/10 text-[#C25934] text-[11px] uppercase tracking-wider">
                    Save {fabric.discount_percentage}%
                  </span>
                </>
              )}
            </div>

            <div className="w-10 h-[1px] bg-[#D4D7C9] mb-5"></div>

            {fabric.description && (
              <p className="font-sans text-sm text-[#1C221A]/75 leading-relaxed tracking-wide mb-6 whitespace-pre-wrap">
                {fabric.description}
              </p>
            )}

            {/* Allowed Products Tags */}
            {fabric.allowed_products && fabric.allowed_products.length > 0 && (
              <div className="mb-6">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#1C221A]/50 mb-3">Best Used For</p>
                <div className="flex flex-wrap gap-2">
                  {fabric.allowed_products.map(product => (
                    <span key={product} className="px-3 py-1.5 rounded-full border border-[#D4D7C9] bg-white text-[11px] font-sans text-[#1C221A] tracking-wider shadow-sm">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-color Variants */}
            {swatches.length > 0 && (
              <div className="mb-6 bg-[#F8F9F5] p-4 rounded-xl border border-[#D4D7C9]/50">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#1C221A] mb-3">
                  Available Colors
                </p>
                <div className="flex flex-wrap gap-3">
                  {swatches.map((swatch, index) => (
                    <div key={`${swatch.id}-${index}`} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          if (!swatch.isCurrent) handleSwatchClick(swatch.id);
                        }}
                        disabled={isChangingVariant}
                        className={cn(
                          "w-8 h-8 rounded-full border shadow-sm transition-all duration-300 relative flex items-center justify-center cursor-pointer",
                          swatch.isCurrent
                            ? "border-[#4A5D23] ring-2 ring-[#4A5D23]/30 scale-105"
                            : "border-[#D4D7C9] hover:border-[#4A5D23] hover:scale-105",
                          isChangingVariant && "cursor-not-allowed opacity-50"
                        )}
                        style={{ backgroundColor: swatch.color_hex }}
                      >
                        {swatch.isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-white mix-blend-difference" />
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

            {/* Stock Warning */}
            <div className="mt-2 mb-4">
              {isOutOfStock ? (
                <span className="font-sans text-[11px] text-red-500 uppercase tracking-wider bg-red-500/10 px-3 py-1.5 rounded-sm">
                  Currently Out of Stock
                </span>
              ) : (
                <span className="font-sans text-[11px] font-medium text-[#4A5D23] uppercase tracking-wider">
                  {maxStock} Yards Available in stock
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 mt-4">
            <button
              onClick={() => {
                if(!isOutOfStock) onSelectFabric(fabric.id);
              }}
              disabled={isOutOfStock}
              className={cn(
                'w-full rounded-full py-3.5 flex items-center justify-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.2em] shadow-[0_12px_30px_rgba(74,93,35,0.2)] transition-all duration-300',
                isOutOfStock
                  ? 'bg-[#EBECE3] text-[#1C221A]/40 cursor-not-allowed border border-[#D4D7C9]'
                  : 'bg-[#4A5D23] text-white hover:bg-[#3D4C1D] active:scale-[0.98] cursor-pointer'
              )}
            >
              <Scissors className="w-4 h-4 stroke-[1.5]" />
              <span>{isOutOfStock ? 'Fabric Unavailable' : 'Use this Fabric'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      {isFullscreenOpen && !showVideo && (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
          <button
            onClick={() => setIsFullscreenOpen(false)}
            className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={allImages[modalImgIndex]}
            alt="Fullscreen"
            className="w-full h-auto max-h-screen object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default FabricQuickViewModal;
