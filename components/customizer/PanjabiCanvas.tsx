"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderPanjabiTexture, TextureConfig } from '@/lib/canvas/textureEngine';
import { Loader2, AlertTriangle, RotateCcw, Info, Download, Share2 } from 'lucide-react';

interface PanjabiCanvasProps {
  color: string;
  fabricType: string;
  fabricImageUrl?: string;
  productOverlayUrl?: string;
  fabricOpacity?: number;
  colorIntensity?: number;
  hideControls?: boolean;
  isProcessingExternal?: boolean;
  onRenderComplete?: (dataUrl: string) => void;
  onReset?: () => void;
  onInfoClick?: () => void;
  showTracker?: boolean; 
  onTrackerClick?: () => void;
  showZeroState?: boolean;
  zeroStateMessage?: string;
  hasFabric?: boolean;
}

export function PanjabiCanvas({
  color,
  fabricType,
  fabricImageUrl,
  productOverlayUrl,
  fabricOpacity = 0.35,
  colorIntensity = 0.92,
  hideControls = false,
  isProcessingExternal = false,
  onRenderComplete,
  onReset,
  onInfoClick,
  showTracker,
  onTrackerClick,
  hasFabric,
  showZeroState,
  zeroStateMessage,
}: PanjabiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
  }, [color, fabricType, fabricImageUrl, fabricOpacity, colorIntensity, productOverlayUrl, onRenderComplete]); // <--- productOverlayUrl যুক্ত করা হলো

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
    // Main Wrapper for PC Canvas and new Footer integration
    <div className="relative flex flex-col w-full h-full lg:h-auto lg:max-w-[500px] mx-auto group lg:rounded-2xl lg:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
      
      {/* --- Mobile Warning Bar & Progress Tracker (Top Placement) --- */}
      {!hideControls && (
        <div className="lg:hidden absolute top-[64px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 text-[10px] text-[#1C221A]/70 bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-b-2xl shadow-sm z-[100] border border-t-0 border-white/50 w-max max-w-[95%] transition-all">
          <AlertTriangle className="w-3.5 h-3.5 text-[#D1B875] shrink-0" />
          <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            Actual fabric variation may occur.
          </span>
          
          {/* নতুন Progress Button for Mobile */}
          {showTracker && onTrackerClick && (
            <>
              <div className="w-[1px] h-3.5 bg-[#D4D7C9]/80 mx-0.5"></div>
              <button
                onClick={onTrackerClick}
                className="flex items-center gap-1 text-[#4A5D23] uppercase tracking-wider shrink-0 hover:text-[#3D4C1D] active:scale-95 transition-all cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" /> Progress
              </button>
            </>
          )}
        </div>
      )}

      {/* --- Main Canvas Container --- */}
      <div className="relative w-full h-full z-[99] lg:aspect-square lg:bg-[#F5F0EA] lg:rounded-t-2xl overflow-hidden flex items-center justify-center">

        {/* PC: Front View Badge (Kept as requested, hidden on mobile) */}
        <div className="hidden lg:block absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-medium text-gray-800 shadow-sm border border-gray-100">
          Front View
        </div>

        {/* --- 🎯 NEW: Central Glassmorphism Zero State Badge --- */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[105] flex items-center justify-center px-6 py-3 rounded-full bg-[#F8F9F5]/70 backdrop-blur-md border border-[#D4D7C9]/60 shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none ${
            hasFabric ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[#17210C] whitespace-nowrap">
            No Fabric Selected
          </span>
        </div>

        {/* --- PC: Action Buttons (Top/Right Placement) --- */}
        <div className="hidden lg:flex absolute top-4 right-4 z-20 items-center gap-2">
          {showTracker && onTrackerClick && (
            <button
              onClick={onTrackerClick}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-[#4A5D23] text-[10px] uppercase tracking-widest shadow-sm border border-[#D4D7C9]/50 hover:bg-[#4A5D23] hover:text-white transition-all cursor-pointer"
              title="View Progress"
            >
              <Info className="w-3.5 h-3.5" /> Progress
            </button>
          )}
          
          {onReset && (
            <button
              onClick={onReset}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-[#1C221A]/50 hover:text-white hover:bg-red-500 shadow-sm border border-[#D4D7C9]/50 transition-all cursor-pointer"
              title="Reset Design"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* --- PC: Fabric Info Button (Middle Right) --- */}
        <div className={`hidden lg:block absolute right-[-36px] top-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          hasFabric ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
        }`}>
          {onInfoClick && (
            <button
              onClick={onInfoClick}
              className="flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider text-[#1C221A] tracking-[0.15em] shadow-sm border border-[#D4D7C9]/50 hover:text-[#4A5D23] hover:border-[#4A5D23]/30 transition-all cursor-pointer -rotate-90 origin-center"
              title="View Fabric Details"
            >
              <Info className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Fabric Details</span>
            </button>
          )}
        </div>

        {/* --- PC: Download & Share Icons (Bottom Right Corner inside Canvas) --- */}
        {!hideControls && (
          <div className="hidden lg:flex absolute bottom-4 right-4 z-20 items-center gap-2.5">
            <button
              onClick={handleDownload}
              className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-[#1C221A]/50 hover:text-[#4A5D23] hover:bg-[#4A5D23]/10 shadow-sm border border-[#D4D7C9]/50 transition-all cursor-pointer"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {isMounted && !!navigator.share && (
              <button
                onClick={handleShare}
                className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-[#1C221A]/50 hover:text-[#4A5D23] hover:bg-[#4A5D23]/10 shadow-sm border border-[#D4D7C9]/50 transition-all cursor-pointer"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* --- Mobile: Action Buttons Group (Moved up slightly with new gap & icons) --- */}
        <div className="lg:hidden absolute right-2.5 top-[20%] z-50 flex flex-col items-center gap-3.5">
          {/* Mobile Reset */}
          {onReset && (
            <button
              onClick={onReset}
              className="w-11 h-11 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-[#C25934] active:scale-[0.9] transition-all duration-200 cursor-pointer"
              aria-label="Reset Customizer"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Mobile Fabric Info */}
          <div className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            hasFabric ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}>
            {onInfoClick && (
              <button
                onClick={onInfoClick}
                className="w-11 py-3.5 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full flex flex-col items-center justify-center gap-2 text-[#1C221A]/70 hover:text-[#4A5D23] active:scale-[0.95] transition-all duration-200 cursor-pointer"
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

          {/* Separation indicator/Gap */}
          {!hideControls && (
             <div className="w-3 h-1 rounded-full bg-[#1C221A]/20 my-2" />
          )}

          {/* Mobile Download & Share Icons */}
          {!hideControls && (
            <>
              <button
                onClick={handleDownload}
                className="w-11 h-11 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-[#4A5D23] active:scale-[0.9] transition-all duration-200 cursor-pointer"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              {isMounted && !!navigator.share && (
                <button
                  onClick={handleShare}
                  className="w-11 h-11 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-full flex items-center justify-center text-[#1C221A]/70 hover:text-[#4A5D23] active:scale-[0.9] transition-all duration-200 cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* --- 🎯 Zero State Backdrop Overlay --- */}
        {showZeroState && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-[#F8F9F5]/50 backdrop-blur-md transition-all duration-500">
            <div className="bg-white/95 px-6 py-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#D4D7C9]/60 text-center max-w-[85%] animate-in zoom-in-95 duration-300">
              <span className="text-3xl mb-3 block">
                {zeroStateMessage?.includes('Cart') ? '🛍️' : zeroStateMessage?.includes('Reset') ? '🔄' : '💡'}
              </span>
              <p className="font-heading text-[13px] font-bold uppercase tracking-widest text-[#17210C] leading-relaxed">
                {zeroStateMessage || "Please select a product"}
              </p>
            </div>
          </div>
        )}

        {/* 3D Canvas rendering */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full lg:h-auto lg:max-h-none object-contain scale-[1.25] lg:scale-100 translate-y-1 lg:translate-y-0 transition-all duration-300 group-hover:scale-[1.02] lg:group-hover:scale-[1.02] ${(isRendering || isProcessingExternal) ? 'opacity-40 blur-sm' : 'opacity-100 blur-0'
            }`}
        />

        {(isRendering || isProcessingExternal) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
          </div>
        )}
      </div>

      {/* --- PC: Footer (Warning Text out of canvas, square top, rounded bottom) --- */}
      {!hideControls && (
        <div className="hidden lg:flex w-full items-center justify-center gap-1.5 bg-white border border-[#D4D7C9]/40 border-t-0 rounded-b-2xl py-3 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-[98]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#D1B875] shrink-0" />
          <span className="text-[11px] font-medium text-[#1C221A]/60 tracking-wider">
            Actual fabric variation may occur.
          </span>
        </div>
      )}

    </div>
  );
}
