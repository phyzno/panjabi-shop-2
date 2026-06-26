'use client';

import { useEffect, useState, useRef } from 'react';
import { Ruler, X, Info, Scissors, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STANDARD_SIZES } from '@/lib/config/standardSizes';
import { MEASUREMENT_INSTRUCTIONS, PRODUCT_SIZE_GROUPS, SHOE_SIZE_CHART } from '@/lib/config/sizeGuideConfig';

type MainTab = 'chart' | 'guide';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: MainTab;
  defaultCategory?: string;
}

export function SizeGuideModal({ isOpen, onClose, defaultTab = 'chart', defaultCategory = 'panjabi' }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<MainTab>(defaultTab);
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Reset steps when category changes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab(defaultTab);
      setActiveCategory(defaultCategory);
      setActiveStepIndex(0);
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, defaultTab, defaultCategory]);

  if (!isOpen) return null;

  const currentGroup = PRODUCT_SIZE_GROUPS[activeCategory];
  const activeInstructionKey = currentGroup.keys[activeStepIndex] || currentGroup.keys[0];
  const activeInstruction = MEASUREMENT_INSTRUCTIONS[activeInstructionKey];
  
  const standardChartData = STANDARD_SIZES[activeCategory] || {};
  const standardSizeKeys = Object.keys(standardChartData);
  const measurementKeys = standardSizeKeys.length > 0 ? Object.keys(standardChartData[standardSizeKeys[0]]) : [];

  const isShoes = activeCategory === 'shoes';

  // Navigation handlers for mobile slider
  const handleNextStep = () => {
    if (activeStepIndex < currentGroup.keys.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-[#111410]/70 backdrop-blur-sm p-0 sm:items-center sm:p-6 transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-[1000px] h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-[32px] sm:rounded-[32px] border border-[#D4D7C9]/30 bg-[#FEFDF8] shadow-[0_32px_80px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-500 sm:animate-in sm:zoom-in-95 sm:slide-in-from-bottom-0 overflow-hidden">
        
        {/* --- Header & Master Switcher --- */}
        <div className="shrink-0 border-b border-[#D4D7C9]/40 bg-white px-4 sm:px-8 pt-6 pb-4 z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#4A5D23]/10 text-[#4A5D23]">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#17210C]">
                  Size & Fit Guide
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9F5] text-[#1C221A]/50 transition-all hover:bg-[#4A5D23] hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex bg-[#EBECE3]/60 p-1.5 rounded-xl max-w-[400px] mx-auto shadow-inner">
            <button
              onClick={() => setActiveTab('chart')}
              className={cn("flex-1 py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2", activeTab === 'chart' ? "bg-white text-[#4A5D23] shadow-sm border border-[#D4D7C9]/50" : "text-[#1C221A]/50 hover:text-[#1C221A]")}
            >
              <Ruler className="w-3.5 h-3.5" /> Size Chart
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={cn("flex-1 py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2", activeTab === 'guide' ? "bg-white text-[#4A5D23] shadow-sm border border-[#D4D7C9]/50" : "text-[#1C221A]/50 hover:text-[#1C221A]")}
            >
              <Scissors className="w-3.5 h-3.5" /> How to Measure
            </button>
          </div>
        </div>

        {/* --- Category Switcher --- */}
        <div className="shrink-0 bg-[#F8F9F5] border-b border-[#D4D7C9]/40 overflow-x-auto hide-scrollbar px-4 sm:px-8 py-3 z-10">
          <div className="flex items-center gap-2 min-w-max">
            {Object.entries(PRODUCT_SIZE_GROUPS).map(([key, group]) => (
              <button
                key={key}
                onClick={() => { setActiveCategory(key); setActiveStepIndex(0); }}
                className={cn("px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all border cursor-pointer", activeCategory === key ? "bg-[#4A5D23] text-white border-[#4A5D23] shadow-sm" : "bg-white text-[#1C221A]/70 border-[#D4D7C9] hover:border-[#4A5D23]/50")}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 sm:p-8 bg-[#FEFDF8]">
          
          {activeTab === 'guide' && (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start h-full">
              
              {/* Desktop Sticky Image & Mobile Slider Container */}
              <div className="w-full lg:w-[60%] shrink-0 flex flex-col lg:sticky lg:top-0 z-10 bg-[#FEFDF8] pb-2 lg:pb-0">
                
                {/* Mobile Story Progress Bar */}
                <div className="flex lg:hidden gap-1.5 mb-4 px-1">
                  {currentGroup.keys.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={cn("h-1 flex-1 rounded-full transition-colors duration-300", 
                        idx === activeStepIndex ? "bg-[#4A5D23]" : 
                        idx < activeStepIndex ? "bg-[#4A5D23]/40" : "bg-[#D4D7C9]/50"
                      )} 
                    />
                  ))}
                </div>

                {/* Main Image Viewer */}
                <div className="w-full aspect-[4/3] lg:aspect-video bg-black/5 rounded-2xl overflow-hidden border border-[#D4D7C9]/50 shadow-inner relative group">
                  <img 
                    key={activeInstruction.image} // Force re-render for smooth natural transition
                    src={activeInstruction.image} 
                    alt={activeInstruction.title}
                    className="w-full h-full object-cover animate-in fade-in duration-500"
                  />
                  
                  {/* Step Badge (Desktop) */}
                  <div className="hidden lg:block absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-[#D4D7C9]/50">
                    <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-[#4A5D23]">
                      Step {activeStepIndex + 1} of {currentGroup.keys.length}
                    </span>
                  </div>

                  {/* Mobile Navigation Arrows inside Image */}
                  <div className="lg:hidden absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                    <button 
                      onClick={handlePrevStep}
                      disabled={activeStepIndex === 0}
                      className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md text-[#17210C] disabled:opacity-0 transition-opacity"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={handleNextStep}
                      disabled={activeStepIndex === currentGroup.keys.length - 1}
                      className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md text-[#17210C] disabled:opacity-0 transition-opacity"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Mobile Active Text Area */}
                <div className="lg:hidden mt-5 text-center px-2">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-[#17210C]">
                    {activeInstruction.title}
                  </h3>
                  <p className="font-sans text-[14px] text-[#1C221A]/70 leading-relaxed mt-2">
                    {activeInstruction.desc}
                  </p>
                </div>

                {isShoes && (
                   <div className="mt-4 bg-[#F8F9F5] p-4 rounded-xl flex gap-3 items-start border border-[#D4D7C9]/40">
                     <Info className="h-5 w-5 text-[#4A5D23] shrink-0 mt-0.5" />
                     <div className="space-y-2">
                       <p className="font-sans text-[13px] text-[#1C221A]/70 leading-relaxed"><strong className="text-[#17210C]">Measure in the evening:</strong> Feet slightly expand during the day.</p>
                       <p className="font-sans text-[13px] text-[#1C221A]/70 leading-relaxed"><strong className="text-[#17210C]">Wear socks:</strong> Measure with the socks you plan to wear.</p>
                       <p className="font-sans text-[13px] text-[#1C221A]/70 leading-relaxed"><strong className="text-[#17210C]">Use the larger foot:</strong> If one foot is slightly larger, use that measurement.</p>
                     </div>
                   </div>
                )}
              </div>

              {/* Right Side: Interactive Steps (Desktop Only) */}
              <div className="hidden lg:flex w-full lg:w-[40%] flex-col gap-3 pb-8">
                <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#17210C] mb-2">
                  Measurement Steps
                </h3>
                
                {currentGroup.keys.map((key, index) => {
                  const item = MEASUREMENT_INSTRUCTIONS[key];
                  const isActive = index === activeStepIndex;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveStepIndex(index)}
                      className={cn("text-left flex gap-4 p-4 rounded-xl border transition-all cursor-pointer group", 
                        isActive ? "bg-[#4A5D23]/5 border-[#4A5D23]/40 shadow-sm ring-1 ring-[#4A5D23]/10" 
                        : "bg-white border-[#D4D7C9]/40 hover:border-[#4A5D23]/30 hover:bg-[#F8F9F5]"
                      )}
                    >
                      <span className={cn("font-heading text-xs flex items-center justify-center rounded-full shrink-0 h-7 w-7 mt-0.5 transition-colors duration-300", 
                        isActive ? "bg-[#4A5D23] text-white" : "bg-[#F8F9F5] text-[#1C221A]/50 border border-[#D4D7C9] group-hover:text-[#4A5D23]"
                      )}>
                        {index + 1}
                      </span>
                      <div className="space-y-1.5">
                        <p className={cn("font-heading text-[14px] font-bold uppercase tracking-tight transition-colors", isActive ? "text-[#4A5D23]" : "text-[#17210C]")}>
                          {item.title}
                        </p>
                        <p className="font-sans text-[13px] font-normal text-[#1C221A]/60 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
              
              {/* --- Desktop Table View --- */}
              <div className="hidden sm:block">
                {isShoes ? (
                  <div className="overflow-hidden rounded-2xl border border-[#D4D7C9]/50 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F9F5] font-sans text-[11px] uppercase tracking-[0.15em] text-[#17210C]/60 whitespace-nowrap">
                          <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Foot Length (cm)</th>
                          <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Foot Length (inch)</th>
                          <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-bold text-[#4A5D23]">EU Size (BD)</th>
                          <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">US Size</th>
                          <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">UK Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4D7C9]/20">
                        {SHOE_SIZE_CHART.map((row) => (
                          <tr key={row.eu} className="font-sans text-[14px] font-normal text-[#1C221A] hover:bg-[#F8F9F5]/50 transition-colors">
                            <td className="px-5 py-3.5">{row.cm}</td>
                            <td className="px-5 py-3.5">{row.inch}</td>
                            <td className="px-5 py-3.5 font-bold text-[#4A5D23]">{row.eu}</td>
                            <td className="px-5 py-3.5">{row.us}</td>
                            <td className="px-5 py-3.5">{row.uk}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : standardSizeKeys.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-[#D4D7C9]/50 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F9F5] font-sans text-[11px] uppercase tracking-[0.15em] text-[#17210C]/60 whitespace-nowrap">
                          <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-bold text-[#4A5D23]">Size</th>
                          {measurementKeys.map(key => (
                            <th key={key} className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">{key.replace('_', ' ')} (in)</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4D7C9]/20">
                        {standardSizeKeys.map((size) => (
                          <tr key={size} className="font-sans text-[14px] font-normal text-[#1C221A] hover:bg-[#F8F9F5]/50 transition-colors">
                            <td className="px-5 py-4 font-bold text-[#4A5D23] bg-[#4A5D23]/5">{size}</td>
                            {measurementKeys.map(key => (
                              <td key={key} className="px-5 py-4">{standardChartData[size][key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-10 text-center text-[#1C221A]/50 font-sans text-sm border border-dashed border-[#D4D7C9] rounded-2xl">
                    Standard size chart not available for this category yet.
                  </div>
                )}
              </div>

              {/* --- Mobile Card View --- */}
              <div className="block sm:hidden space-y-4">
                {isShoes ? (
                  SHOE_SIZE_CHART.map((row) => (
                    <div key={row.eu} className="bg-white border border-[#D4D7C9]/40 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#D4D7C9]/30 pb-3 mb-3">
                        <span className="font-heading text-sm uppercase tracking-widest text-[#1C221A]/60">EU / BD Size</span>
                        <span className="font-heading text-xl font-bold text-[#4A5D23]">{row.eu}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
                        <div className="flex flex-col"><span className="text-[#1C221A]/50 uppercase text-[10px] tracking-wider">CM</span><span className="font-medium text-[#17210C] mt-0.5">{row.cm}</span></div>
                        <div className="flex flex-col"><span className="text-[#1C221A]/50 uppercase text-[10px] tracking-wider">Inch</span><span className="font-medium text-[#17210C] mt-0.5">{row.inch}</span></div>
                        <div className="flex flex-col"><span className="text-[#1C221A]/50 uppercase text-[10px] tracking-wider">US Size</span><span className="font-medium text-[#17210C] mt-0.5">{row.us}</span></div>
                        <div className="flex flex-col"><span className="text-[#1C221A]/50 uppercase text-[10px] tracking-wider">UK Size</span><span className="font-medium text-[#17210C] mt-0.5">{row.uk}</span></div>
                      </div>
                    </div>
                  ))
                ) : standardSizeKeys.length > 0 ? (
                  standardSizeKeys.map((size) => (
                    <div key={size} className="bg-white border border-[#D4D7C9]/40 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#D4D7C9]/30 pb-3 mb-3">
                        <span className="font-heading text-sm uppercase tracking-widest text-[#1C221A]/60">Standard Size</span>
                        <span className="font-heading text-xl font-bold text-[#4A5D23]">{size}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
                        {measurementKeys.map(key => (
                          <div key={key} className="flex justify-between items-center border-b border-dashed border-[#D4D7C9]/40 pb-1">
                            <span className="capitalize text-[#1C221A]/60">{key.replace('_', ' ')}</span>
                            <span className="font-bold text-[#17210C]">{standardChartData[size][key]}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#1C221A]/50 font-sans text-sm border border-dashed border-[#D4D7C9] rounded-2xl">
                    Standard size chart not available for this category yet.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4D7C9; border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default SizeGuideModal;