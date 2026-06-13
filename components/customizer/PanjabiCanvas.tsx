"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderPanjabiTexture, TextureConfig } from '@/lib/canvas/textureEngine';
import { Loader2, AlertTriangle, RotateCcw, Info } from 'lucide-react';

interface PanjabiCanvasProps {
  color: string;
  fabricType: string;
  fabricImageUrl?: string;
  collarType: 'band' | 'vneck' | 'round' | 'mandarin';
  productOverlayUrl?: string;
  fabricOpacity?: number;
  colorIntensity?: number;
  hideControls?: boolean;
  isProcessingExternal?: boolean;
  onRenderComplete?: (dataUrl: string) => void;
  onReset?: () => void;
  onInfoClick?: () => void;
}

export function PanjabiCanvas({
  color,
  fabricType,
  fabricImageUrl,
  collarType,
  productOverlayUrl,
  fabricOpacity = 0.35,
  colorIntensity = 0.92,
  hideControls = false,
  isProcessingExternal = false,
  onRenderComplete,
  onReset,
  onInfoClick,
}: PanjabiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const images = [
      '/assets/punjabi/collar-band.png',
      '/assets/punjabi/collar-vneck.png',
      '/assets/punjabi/collar-round.png',
      '/assets/punjabi/collar-mandarin.png',
    ];
    images.forEach(src => {
      if (imageCache.current[src]) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.current[src] = img;
        setImagesLoaded(prev => prev + 1);
      };
      img.src = src;
    });
  }, []);

  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);

    if (canvasRef.current) {
      canvasRef.current.style.opacity = '0.6';
      canvasRef.current.style.transition = 'opacity 0.15s';
    }

    const config: TextureConfig = {
      color,
      fabricType,
      fabricImageUrl,
      fabricOpacity,
      colorIntensity,
      collarType,
      productOverlayUrl,
    };

    try {
      await renderPanjabiTexture(canvasRef.current, config, imageCache.current);
      if (onRenderComplete) {
        onRenderComplete(canvasRef.current.toDataURL());
      }
    } catch (err) {
      console.error('Failed to render canvas', err);
    } finally {
      setIsRendering(false);
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    }
  }, [color, fabricType, fabricImageUrl, fabricOpacity, colorIntensity, collarType, productOverlayUrl, onRenderComplete]); // <--- productOverlayUrl যুক্ত করা হলো

  useEffect(() => {
    render();
  }, [render, imagesLoaded]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `panjabi-custom-${fabricType}-${color}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        const blob = await new Promise<Blob | null>(res => canvasRef.current?.toBlob(res));
        if (blob) {
          const file = new File([blob], 'panjabi.png', { type: 'image/png' });
          await navigator.share({
            title: 'My Custom Panjabi',
            text: 'Check out the Panjabi I customized!',
            files: [file],
          });
        }
      } catch (err) {
        console.error('Error sharing', err);
      }
    }
  };

  return (
    <div className="relative w-full h-full z-[999] lg:h-auto lg:max-w-[500px] lg:aspect-square mx-auto lg:bg-[#F5F0EA] lg:rounded-2xl lg:shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden group flex items-center justify-center">

      {/* Front View Badge */}
      <div className="absolute top-4 left-4 lg:top-4 lg:left-4 z-20 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-medium text-gray-800 shadow-sm border border-gray-100">
        Front View
      </div>

      {/* --- Action Buttons (PC View) --- */}
<div className="hidden lg:block">
  {/* PC Reset */}
  {onReset && (
    <button
      onClick={onReset}
      className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full text-[#1C221A]/50 hover:text-[#C25934] hover:bg-[#C25934]/10 shadow-sm border border-[#D4D7C9]/50 transition-all cursor-pointer"
      title="Reset Design"
    >
      <RotateCcw className="w-3.5 h-3.5" />
    </button>
  )}

  {/* PC Fabric Info */}
  {onInfoClick && (
    <button
      onClick={onInfoClick}
      className="absolute right-[-36px] top-1/2 -translate-y-1/2 z-20 flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider text-[#1C221A] tracking-[0.15em] shadow-sm border border-[#D4D7C9]/50 hover:text-[#4A5D23] hover:border-[#4A5D23]/30 transition-all cursor-pointer -rotate-90 origin-center"
      title="View Fabric Details"
    >
      <Info className="w-4 h-4" />
      <span className="whitespace-nowrap">Fabric Details</span>
    </button>
  )}
</div>

{/* --- Action Buttons (Mobile View Grouped) --- */}
<div className="lg:hidden absolute right-2.5 top-[30%] z-50 flex flex-col items-center gap-6">
  {/* Mobile Reset */}
  {onReset && (
    <button
      onClick={onReset}
      className="w-12 h-12 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-[#C25934] active:scale-[0.9] transition-all duration-200 cursor-pointer"
      aria-label="Reset Customizer"
    >
      <RotateCcw className="w- h- stroke-[2.5]" />
    </button>
  )}

  {/* Mobile Fabric Info (Vertical Capsule) */}
  {onInfoClick && (
    <button
      onClick={onInfoClick}
      className="w-11 py-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full flex flex-col items-center justify-center gap-2.5 text-[#1C221A]/70 hover:text-[#4A5D23] active:scale-[0.95] transition-all duration-200 cursor-pointer"
      title="View Fabric Details"
    >
      <Info className="w-5 h-5 shrink-0" />
      <span 
        className="text-[13px] font-medium uppercase tracking-[0.15em] whitespace-nowrap text-[#1C221A]/80"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        Fabric Details
      </span>
    </button>
  )}
</div>

      <canvas
        ref={canvasRef}
        className={`w-full h-full lg:h-auto lg:max-h-none object-contain scale-[1.25] translate-y-6 lg:scale-100 lg:translate-y-0 transition-all duration-300 group-hover:scale-[1.02] lg:group-hover:scale-[1.02] ${(isRendering || isProcessingExternal) ? 'opacity-40 blur-sm' : 'opacity-100 blur-0'
          }`}
      />

      {(isRendering || isProcessingExternal) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
        </div>
      )}

      {!hideControls && (
        <div className="absolute bottom-4 left-0 right-0 lg:left-4 lg:right-4 flex flex-row justify-between items-center gap-1 text-[10px] lg:text-xs text-gray-500 bg-white/80 backdrop-blur-md px-3 lg:px-4 py-2 rounded-t-xl lg:rounded-xl shadow-sm z-20 border border-white/50 lg:border-gray-100">
          <span className="flex items-center gap-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            <AlertTriangle className="w-3 h-3 text-[#D1B875] shrink-0" />
            Actual fabric variation may occur.
          </span>
          <div className="flex gap-2 lg:gap-4 shrink-0">
            <button onClick={handleDownload} className="hover:text-[#4A5D23] transition-colors uppercase tracking-wider text-[#1C221A] text-[9px] lg:text-[11px] cursor-pointer">
              Download
            </button>
            {isMounted && !!navigator.share && (
              <button onClick={handleShare} className="hover:text-[#4A5D23] transition-colors uppercase tracking-wider text-[#1C221A] text-[9px] lg:text-[11px] cursor-pointer">
                Share
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
