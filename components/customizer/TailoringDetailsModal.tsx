'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { X, Check, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { ADVANCED_TAILORING_OPTIONS } from '@/lib/config/productConfig';

interface TailoringDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: string; // e.g., 'shirt', 'panjabi', 'pant', 'jubba', 'pajama'
  productStyles: Record<string, string>;
  setProductStyle: (key: string, value: string) => void;
}

// 🎯 NEW: Modal specific helper component
const TailoringCategoryRow = ({ group, productStyles, setProductStyle }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeft(scrollLeft > 5);
    setShowRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Auto Center Active Element
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const timeoutId = setTimeout(() => {
      const activeItem = container.querySelector('[data-active="true"]') as HTMLElement;
      if (activeItem) {
        const scrollPos = activeItem.offsetLeft - (container.clientWidth / 2) + (activeItem.offsetWidth / 2);
        container.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
      checkScroll();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [productStyles[group.id], checkScroll]);

  return (
    <div className="relative w-full group/carousel">
      {/* 🎯 Modal Fade Limits */}
      <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F8F9F5] sm:from-white via-[#F8F9F5]/80 sm:via-white/80 to-transparent z-10 flex items-center justify-start pl-1 pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100' : 'opacity-0'}`}>
         <ChevronLeft className="w-4 h-4 text-[#1C221A]/30 transition-colors group-hover/carousel:text-[#4A5D23]" />
      </div>
      <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F8F9F5] sm:from-white via-[#F8F9F5]/80 sm:via-white/80 to-transparent z-10 flex items-center justify-end pr-1 pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100' : 'opacity-0'}`}>
         <ChevronRight className="w-4 h-4 text-[#1C221A]/30 transition-colors group-hover/carousel:text-[#4A5D23]" />
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 pb-4 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible sm:gap-4"
      >
        {group.choices.map(([key, imagePath]: [string, string | null]) => {
          const isSelected = productStyles[group.id] === key || (!productStyles[group.id] && group.choices[0][0] === key);

          return (
            <div
              key={key}
              data-active={isSelected}
              onClick={() => setProductStyle(group.id, key)}
              // 🎯 FIX: এখানে w-[55%] এর পরের snap-start কে snap-center করা হয়েছে
              className={`group relative flex flex-col aspect-square shrink-0 w-[55%] snap-center sm:w-auto rounded-[16px] overflow-hidden border cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-[#4A5D23] shadow-sm ring-1 ring-[#4A5D23]'
                  : 'border-[#D4D7C9]/60 bg-white hover:border-[#D4D7C9]'
              }`}
            >
              <div className="w-full aspect-[4/3] bg-[#F8F9F5] relative flex items-center justify-center overflow-hidden border-b border-[#EBECE3]/50">
                {imagePath ? (
                  /* 🎯 Normal Image rendering without masking or blend modes */
                  <img
                    src={imagePath}
                    alt={key}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-2xl font-heading text-[#4A5D23]/20 font-bold uppercase tracking-tighter transition-colors group-hover:text-[#4A5D23]/40">
                    MTM
                  </span>
                )}

                {/* 🎯 Flicker-Free Checkmark (CSS Transition instead of unmount) */}
                <div 
                  className={`absolute top-2 right-2 bg-[#4A5D23] rounded-full p-1.5 shadow-md z-10 transition-all duration-200 transform ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                </div>
              </div>

              <div className={`flex-1 p-2 flex items-center justify-center transition-colors ${
                isSelected ? 'bg-[#4A5D23]/5' : 'bg-white'
              }`}>
                <span className={`font-sans text-[10px] uppercase tracking-widest text-center leading-tight px-2 ${
                  isSelected ? 'text-[#4A5D23]' : 'text-[#17210C] font-medium'
                }`}>
                  {key.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function TailoringDetailsModal({ isOpen, onClose, productType, productStyles, setProductStyle }: TailoringDetailsModalProps) {
  if (!isOpen) return null;

  // Normalized product key for mapping (Dynamic and clean)
  const activeKey = productType.split('_')[0];
  const allOptions = ADVANCED_TAILORING_OPTIONS[activeKey] || [];
  
  // কন্ডিশনাল লজিক প্রয়োগ করে যেগুলো হাইড হওয়া উচিত সেগুলো ফিল্টার আউট করা
  const visibleOptions = allOptions.filter(group => 
    group.condition ? group.condition(productType, productStyles) : true
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#111410]/70 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-[750px] rounded-[24px] bg-[#F7F7F2] shadow-[0_28px_80px_rgba(14,20,9,0.2)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4D7C9]/60 bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-[0.08em] text-[#17210C]">
              Advanced Tailoring Details
            </h3>
            <p className="font-sans text-[11px] text-[#1C221A]/60 uppercase tracking-wider mt-0.5">
              Customize technical fit and premium stitching specifications
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F9F5] rounded-md border border-[#D4D7C9]/60 mt-2">
              <Info className="w-3 h-3 text-[#4A5D23]" />
              <span className="font-sans text-[9px] text-[#4A5D23] uppercase tracking-widest font-medium">
                Note: Technical details do not update the canvas preview
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-[#F8F9F5] hover:bg-[#4A5D23] hover:text-white rounded-full flex items-center justify-center text-[#1C221A]/70 shadow-sm transition-all cursor-pointer">
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 sm:space-y-8 flex-1 bg-[#F8F9F5]/50 sm:bg-[#F8F9F5]/50">
          {visibleOptions.length === 0 ? (
            <p className="text-center font-sans text-xs text-[#1C221A]/50 py-8">No custom tailoring options needed for this item.</p>
          ) : (
            visibleOptions.map((group) => (
              <div key={group.id} className="bg-transparent sm:bg-white sm:p-5 sm:rounded-2xl sm:border sm:border-[#D4D7C9]/40 sm:shadow-sm">
                
                <h4 className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#4A5D23] mb-4 flex items-center gap-1.5 px-1 sm:px-0">
                  <Info className="w-3.5 h-3.5 opacity-70" /> {group.title}
                </h4>

                {/* 🎯 NEW: Injected Auto-Centering Modal Row */}
                <TailoringCategoryRow
                   group={group}
                   productStyles={productStyles}
                   setProductStyle={setProductStyle}
                />
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#D4D7C9]/60 flex justify-end sticky bottom-0">
          <button onClick={onClose} className="px-8 py-3 bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-sans text-[11px] font-medium uppercase tracking-[0.2em] rounded-full shadow-md transition-all active:scale-[0.98] cursor-pointer">
            Save Specifications
          </button>
        </div>
      </div>
    </div>
  );
}