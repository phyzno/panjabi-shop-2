"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderPanjabiTexture, TextureConfig } from '@/lib/canvas/textureEngine';
import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';

interface PanjabiCanvasProps {
  color: string;
  fabricType: string;
  fabricImageUrl?: string;
  collarType: 'band' | 'vneck' | 'round' | 'mandarin';
  fabricOpacity?: number;
  colorIntensity?: number;
  hideControls?: boolean;
  isProcessingExternal?: boolean;
  onRenderComplete?: (dataUrl: string) => void;
  onReset?: () => void;
}

export function PanjabiCanvas({
  color,
  fabricType,
  fabricImageUrl,
  collarType,
  fabricOpacity = 0.35,
  colorIntensity = 0.92,
  hideControls = false,
  isProcessingExternal = false,
  onRenderComplete,
  onReset,
}: PanjabiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(0); // Counter to trigger re-render

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Preload collar base images
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
    
    // Smooth transition start
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
      // Smooth transition end
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    }
  }, [color, fabricType, fabricImageUrl, fabricOpacity, colorIntensity, collarType, onRenderComplete]);

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

  // PanjabiCanvas.tsx - Return অংশের সম্পূর্ণ পরিবর্তন

return (
  <div className="relative w-full h-full z-[999] lg:h-auto lg:max-w-[500px] lg:aspect-square mx-auto lg:bg-[#F5F0EA] lg:rounded-2xl lg:shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden group flex items-center justify-center">
    
    <div className="absolute top-4 left-4 lg:top-4 lg:left-4 z-20 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-medium text-gray-800 shadow-sm border border-gray-100">
      Front View
    </div>

    <div className="absolute top-4 left-4 lg:top-4 lg:left-4 z-20 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-medium text-gray-800 shadow-sm border border-gray-100">
      Front View
    </div>

    {/* ✨ Reset Button ✨ */}
    {onReset && (
      <button
        onClick={onReset}
        className="absolute top-4 right-4 lg:top-4 lg:right-4 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-500 hover:text-[#C25934] hover:bg-[#C25934]/10 shadow-sm border border-gray-100 transition-all cursor-pointer"
        title="Reset Design"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    )}

    {/* পাঞ্জাবিকে মোবাইলেscale-[1.35] করে জুম করা হয়েছে এবং translate-y-6 দিয়ে একটু নিচে নামানো হয়েছে। ডেক্সটপে এটা স্বাভাবিক থাকবে। */}
    <canvas
      ref={canvasRef}
      className={`w-full h-full lg:h-auto lg:max-h-none object-contain scale-[1.25] translate-y-6 lg:scale-100 lg:translate-y-0 transition-all duration-300 group-hover:scale-[1.02] lg:group-hover:scale-[1.02] ${
        (isRendering || isProcessingExternal) ? 'opacity-40 blur-sm' : 'opacity-100 blur-0'
      }`}
    />

    {(isRendering || isProcessingExternal) && (
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    )}

    {/* ওভারলে প্যানেল: মোবাইলেও flex-row থাকবে, টেক্সট ছোট ও компакт করা হয়েছে। জুম করা পাঞ্জাবি থেকে দুরে রাখতে একদম নিচে (bottom-0) রাখা হয়েছে। */}
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
