"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderPanjabiTexture, TextureConfig } from '@/lib/canvas/textureEngine';
import { Loader2 } from 'lucide-react';

interface PanjabiCanvasProps {
  color: string;
  fabricType: string;
  collarType: 'band' | 'vneck' | 'round' | 'mandarin';
  fabricOpacity?: number;
  colorIntensity?: number;
  onRenderComplete?: (dataUrl: string) => void;
}

export function PanjabiCanvas({
  color,
  fabricType,
  collarType,
  fabricOpacity = 0.35,
  colorIntensity = 0.92,
  onRenderComplete,
}: PanjabiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(0); // Counter to trigger re-render

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
  }, [color, fabricType, fabricOpacity, colorIntensity, collarType, onRenderComplete]);

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
    <div className="relative w-full max-w-[500px] aspect-square mx-auto bg-[#F5F0EA] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden group">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm border border-gray-100">
        Front View
      </div>

      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-[1.02] ${
          isRendering ? 'opacity-40 blur-sm' : 'opacity-100 blur-0'
        }`}
      />

      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-gray-500 bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl">
        <span className="flex items-center gap-1">
          🔒 Preview only — actual fabric may vary slightly
        </span>
        <div className="flex gap-2">
          <button 
            onClick={handleDownload}
            className="hover:text-gray-900 transition-colors"
            title="Download Preview"
          >
            Download
          </button>
          {typeof navigator !== 'undefined' && !!navigator.share && (
            <button 
              onClick={handleShare}
              className="hover:text-gray-900 transition-colors"
              title="Share"
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
