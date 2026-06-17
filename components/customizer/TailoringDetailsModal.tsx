'use client';

import React from 'react';
import { X, Check, Info } from 'lucide-react';
import { ADVANCED_TAILORING_OPTIONS } from '@/lib/config/productConfig';

interface TailoringDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: string; // e.g., 'shirt', 'panjabi', 'pant', 'jubba', 'pajama'
  productStyles: Record<string, string>;
  setProductStyle: (key: string, value: string) => void;
}

export function TailoringDetailsModal({ isOpen, onClose, productType, productStyles, setProductStyle }: TailoringDetailsModalProps) {
  if (!isOpen) return null;

  // Normalized product key for mapping
  const activeKey = productType.startsWith('panjabi_') ? 'panjabi' : productType.startsWith('pant_') ? 'pant' : productType;
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
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-[#F8F9F5] hover:bg-[#4A5D23] hover:text-white rounded-full flex items-center justify-center text-[#1C221A]/70 shadow-sm transition-all cursor-pointer">
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 flex-1 bg-[#F8F9F5]/50">
          {visibleOptions.length === 0 ? (
            <p className="text-center font-sans text-xs text-[#1C221A]/50 py-8">No custom tailoring options needed for this item.</p>
          ) : (
            visibleOptions.map((group) => (
              <div key={group.id} className="bg-white p-5 rounded-2xl border border-[#D4D7C9]/40 shadow-sm">
                <h4 className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#4A5D23] mb-4 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 opacity-70" /> {group.title}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {group.choices.map(([key, imagePath]) => {
                    const isSelected = productStyles[group.id] === key || (!productStyles[group.id] && group.choices[0][0] === key);

                    return (
                      <div
                        key={key}
                        onClick={() => setProductStyle(group.id, key)}
                        className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all bg-white ${isSelected
                            ? 'border-[#4A5D23] shadow-md ring-1 ring-[#4A5D23] bg-[#F8F9F5]'
                            : 'border-[#EBECE3] hover:border-[#D4D7C9]'
                          }`}
                      >
                        {/* Vector Container */}
                        <div className="w-16 h-16 bg-[#F8F9F5] rounded-xl flex items-center justify-center shrink-0 border border-[#EBECE3] overflow-hidden">
                          {imagePath ? (
                            <img src={imagePath} alt={key} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <span className="text-xl font-heading text-[#4A5D23]/40 font-bold uppercase tracking-tighter">MTM</span>
                          )}
                        </div>

                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#17210C] text-center px-1">
                          {key.replace(/_/g, ' ')}
                        </span>

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-[#4A5D23] rounded-full p-1 shadow-sm">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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