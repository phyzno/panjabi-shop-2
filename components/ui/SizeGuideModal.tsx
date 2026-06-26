'use client';

import { useEffect, useState, useRef } from 'react';
import { Ruler, X, Info, Scissors, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STANDARD_SIZES } from '@/lib/config/standardSizes';
import { MEASUREMENT_INSTRUCTIONS, PRODUCT_SIZE_GROUPS, SHOE_SIZE_CHART } from '@/lib/config/sizeGuideConfig';

type MainTab = 'chart' | 'guide';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGlobal?: boolean;
  defaultTab?: MainTab; // 'chart' for shop, 'guide' for customizer
  defaultCategory?: string; // e.g., 'panjabi', 'shoes'
}

export function SizeGuideModal({ isOpen, onClose, isGlobal = true, defaultTab = 'chart', defaultCategory = 'panjabi' }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<MainTab>(defaultTab);
  const [chartMode, setChartMode] = useState<'preset' | 'number'>('preset');
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zoom Position State
  const [zoomBgPos, setZoomBgPos] = useState('50% 50%');

  // Category Scroll Tracking States
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Swipe gesture states for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    // Only run this when the modal physically opens/closes.
    // Removed other dependencies to prevent accidental tab resets.
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab(defaultTab);
      setActiveCategory(defaultCategory);
      setActiveStepIndex(0);
      setIsFullscreen(false);
    } else {
      document.body.style.overflow = '';
      setZoomBgPos('50% 50%');
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen((prev) => {
          if (prev) return false;
          onClose();
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  // Scroll tracker for category switcher
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // ১ পিক্সেল বাফার রাখা হয়েছে রাউন্ডিং ইস্যু এড়াতে
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  // যখন মোডাল ওপেন হবে বা ক্যাটাগরি চেঞ্জ হবে তখন স্ক্রল পজিশন আপডেট হবে
  useEffect(() => {
    if (isOpen) {
      handleScroll();
    }
  }, [isOpen, activeCategory]);

  if (!isOpen) return null;

  const currentGroup = PRODUCT_SIZE_GROUPS[activeCategory];
  const stepsCount = currentGroup.keys.length;
  const activeInstructionKey = currentGroup.keys[activeStepIndex] || currentGroup.keys[0];
  const activeInstruction = MEASUREMENT_INSTRUCTIONS[activeInstructionKey];

  // Navigation Handlers
  const handleNext = () => setActiveStepIndex((prev) => (prev + 1) % stepsCount);
  const handlePrev = () => setActiveStepIndex((prev) => (prev - 1 + stepsCount) % stepsCount);

  // Touch handlers for swipe
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
  };



  // E-commerce Hover Zoom Handler (For Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomBgPos(`${x}% ${y}%`);
  };



  // Auto-centering Category Click Handler
  const handleCategoryClick = (key: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveCategory(key);
    setActiveStepIndex(0);

    const button = e.currentTarget;
    const scrollContainer = button.parentElement?.parentElement;

    if (scrollContainer) {
      const scrollPosition = button.offsetLeft - (scrollContainer.clientWidth / 2) + (button.clientWidth / 2);
      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Get standard sizes from config
  const standardChartData = STANDARD_SIZES[activeCategory] || {};
  const standardSizeKeys = Object.keys(standardChartData);
  
  // Separate keys
  const presetKeys = standardSizeKeys.filter(size => isNaN(Number(size)));
  const numericKeys = standardSizeKeys.filter(size => !isNaN(Number(size)));
  
  const hasBothModes = presetKeys.length > 0 && numericKeys.length > 0;
  // Customizer (isGlobal === false and activeTab === 'guide' implies customizer usage, but to be safe, if we are in Customizer, we only want Preset)
  // To keep it simple, we just use chartMode to decide which keys to show.
  const activeChartKeys = chartMode === 'preset' && presetKeys.length > 0 ? presetKeys : 
                          chartMode === 'number' && numericKeys.length > 0 ? numericKeys : 
                          standardSizeKeys;

  const measurementKeys = activeChartKeys.length > 0 ? Object.keys(standardChartData[activeChartKeys[0]]) : [];

  const isShoes = activeCategory === 'shoes';

  return (
    <>
      <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-[#111410]/70 backdrop-blur-sm p-0 sm:items-center sm:p-6 transition-all duration-300">
        <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

        {/* Dynamic Modal Height Setup - Flexbox fits content up to 96vh */}
        <div className="relative w-full max-w-[1000px] h-[96dvh] sm:h-auto sm:max-h-[96vh] flex flex-col rounded-t-[32px] sm:rounded-[32px] border border-[#D4D7C9]/30 bg-[#FEFDF8] shadow-[0_32px_80px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-500 sm:animate-in sm:zoom-in-95 sm:slide-in-from-bottom-0 overflow-hidden">

          {/* --- Header & Master Switcher --- */}
          <div className="shrink-0 border-b border-[#D4D7C9]/40 bg-white px-4 sm:px-8 pt-5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              {/* Title Area */}
              <div className="flex items-center justify-between w-full sm:w-auto">
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

                {/* Close Button Mobile */}
                <button onClick={onClose} className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9F5] text-[#1C221A]/50 transition-all hover:bg-[#4A5D23] hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Top Main Tab Switcher - Desktop */}
              <div className="hidden sm:flex bg-[#EBECE3]/60 p-1.5 rounded-xl w-[300px] shadow-inner">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={cn("flex-1 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 cursor-pointer", activeTab === 'chart' ? "bg-white text-[#4A5D23] shadow-sm border border-[#D4D7C9]/50" : "text-[#1C221A]/50 hover:text-[#1C221A]")}
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Chart
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={cn("flex-1 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 cursor-pointer", activeTab === 'guide' ? "bg-white text-[#4A5D23] shadow-sm border border-[#D4D7C9]/50" : "text-[#1C221A]/50 hover:text-[#1C221A]")}
                >
                  <Scissors className="w-3.5 h-3.5" /> Measure
                </button>
              </div>

              {/* Close Button Desktop */}
              <button onClick={onClose} className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F9F5] text-[#1C221A]/50 transition-all hover:bg-[#4A5D23] hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Top Main Tab Switcher - Mobile */}
            <div className="flex sm:hidden mt-4 bg-[#EBECE3]/60 p-1.5 rounded-xl shadow-inner w-full">
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

          {/* --- Category Switcher (with dynamic scroll gradients) --- */}
          {isGlobal && (
            <div className="shrink-0 bg-[#F8F9F5] border-b border-[#D4D7C9]/40 relative py-3">
              {/* Left Edge Gradient Fade */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-[#F8F9F5] via-[#F8F9F5]/90 to-transparent pointer-events-none z-10 transition-opacity duration-300",
                  canScrollLeft ? "opacity-100" : "opacity-0"
                )}
              />

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="overflow-x-auto hide-scrollbar px-4 sm:px-8 relative w-full"
              >
                <div className="flex items-center gap-2 min-w-max">
                  {Object.entries(PRODUCT_SIZE_GROUPS).map(([key, group]) => (
                    <button
                      key={key}
                      onClick={(e) => handleCategoryClick(key, e)}
                      className={cn("px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all border cursor-pointer", activeCategory === key ? "bg-[#4A5D23] text-white border-[#4A5D23] shadow-sm" : "bg-white text-[#1C221A]/70 border-[#D4D7C9] hover:border-[#4A5D23]/50")}
                    >
                      {group.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Edge Gradient Fade */}
              <div
                className={cn(
                  "absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-[#F8F9F5] via-[#F8F9F5]/90 to-transparent pointer-events-none z-10 transition-opacity duration-300",
                  canScrollRight ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
          )}

          {/* --- Main Content Area --- */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 bg-[#FEFDF8]">

            {activeTab === 'guide' && (
              <div className="flex flex-col h-full max-w-4xl mx-auto animate-in fade-in duration-300">

                {/* Insta-style Dashes (Progress) */}
                <div className="flex gap-1.5 w-full mb-5">
                  {currentGroup.keys.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn("h-1 flex-1 rounded-full transition-colors duration-300", idx === activeStepIndex ? "bg-[#4A5D23]" : "bg-[#D4D7C9]/60")}
                    />
                  ))}
                </div>

                {/* Main Image Container */}
                <div className="relative w-full flex items-center justify-center gap-6 mb-6">
                  {/* Prev Button (Desktop) */}
                  <button
                    onClick={handlePrev}
                    className="hidden lg:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-white border border-[#D4D7C9]/80 text-[#1C221A]/70 hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-sm transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* 16:9 Image Box with Inner Zoom */}
                  <div
                    className="w-full lg:w-[80%] aspect-video bg-[#F8F9F5] rounded-2xl overflow-hidden border border-[#D4D7C9]/50 shadow-inner relative group cursor-crosshair"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseMove={handleMouseMove}
                    onClick={() => {
                      if (window.matchMedia('(max-width: 1023px)').matches) {
                        setIsFullscreen(true);
                      }
                    }}
                  >
                    <img
                      key={activeInstruction.image}
                      src={activeInstruction.image}
                      alt={activeInstruction.title}
                      className="w-full h-full object-cover animate-in fade-in duration-500 transition-opacity duration-200 lg:group-hover:opacity-0"
                      draggable="false"
                    />

                    {/* FIXED: Added single quotes inside url() to handle spaces in path */}
                    <div
                      className="hidden lg:block absolute inset-0 bg-no-repeat opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      style={{
                        backgroundImage: `url('${activeInstruction.image}')`,
                        backgroundPosition: zoomBgPos,
                        backgroundSize: '250%',
                      }}
                    />

                    {/* Expand/Fullscreen Button overlay (Mobile/Tablet Only) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullscreen(true);
                      }}
                      className="lg:hidden absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-[#D4D7C9]/50 shadow-sm text-[#4A5D23] z-10"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Next Button (Desktop) */}
                  <button
                    onClick={handleNext}
                    className="hidden lg:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-white border border-[#D4D7C9]/80 text-[#1C221A]/70 hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-sm transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Title & Description */}
                <div className="text-center max-w-2xl mx-auto mb-8 px-4">
                  <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-widest text-[#4A5D23] mb-3">
                    {activeInstruction.title}
                  </h3>
                  <p className="font-sans text-[14px] sm:text-[15px] text-[#1C221A]/70 leading-relaxed">
                    {activeInstruction.desc}
                  </p>
                </div>

                {/* Desktop Direct Indexing (1, 2, 3...) */}
                <div className="hidden lg:flex justify-center gap-3 mt-auto">
                  {currentGroup.keys.map((key, idx) => (
                    <button
                      key={key}
                      onClick={() => setActiveStepIndex(idx)}
                      className={cn("h-10 w-10 rounded-full font-heading text-sm font-bold transition-all flex items-center justify-center border cursor-pointer", idx === activeStepIndex ? "bg-[#4A5D23] text-white border-[#4A5D23] shadow-md scale-110" : "bg-white text-[#1C221A]/60 border-[#D4D7C9] hover:border-[#4A5D23]/50 hover:text-[#4A5D23]")}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Mobile 2-Column Grid Tab Switcher */}
                <div className="grid lg:hidden grid-cols-2 gap-2 mt-auto pb-4">
                  {currentGroup.keys.map((key, idx) => {
                    const item = MEASUREMENT_INSTRUCTIONS[key];
                    const isActive = idx === activeStepIndex;
                    const isLastAndOdd = idx === currentGroup.keys.length - 1 && currentGroup.keys.length % 2 !== 0; // Check if odd and last
                    
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveStepIndex(idx)}
                        className={cn("p-3.5 rounded-xl border text-center transition-all flex items-center justify-center", isActive ? "bg-[#4A5D23]/10 border-[#4A5D23]/50 shadow-sm" : "bg-white border-[#D4D7C9]/50 hover:bg-[#F8F9F5]", isLastAndOdd ? "col-span-2" : "")}
                      >
                        <span className={cn("font-heading text-[11px] font-bold uppercase tracking-widest truncate", isActive ? "text-[#4A5D23]" : "text-[#1C221A]/60")}>
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Extra Info for Shoes */}
                {isShoes && (
                  <div className="mt-8 bg-[#F8F9F5] p-5 rounded-xl flex gap-3 items-start border border-[#D4D7C9]/40 max-w-2xl mx-auto">
                    <Info className="h-5 w-5 text-[#4A5D23] shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-sans text-[13px] text-[#1C221A]/70 leading-relaxed"><strong className="text-[#17210C]">Measure in the evening:</strong> Feet slightly expand during the day.</p>
                      <p className="font-sans text-[13px] text-[#1C221A]/70 leading-relaxed"><strong className="text-[#17210C]">Wear socks:</strong> Measure with the socks you plan to wear.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Size Chart View */}
            {activeTab === 'chart' && (
              <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
                {/* --- Preset / Number Toggle (Only if both exist) --- */}
                {!isShoes && hasBothModes && (
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-full bg-[#EBECE3] p-1 shadow-inner">
                      <button
                        onClick={() => setChartMode('preset')}
                        className={cn("rounded-full px-5 py-2 text-[11px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer", chartMode === 'preset' ? "bg-white text-[#4A5D23] shadow-sm" : "text-[#1C221A]/70 hover:text-[#1C221A]")}
                      >
                        Preset Size
                      </button>
                      <button
                        onClick={() => setChartMode('number')}
                        className={cn("rounded-full px-5 py-2 text-[11px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer", chartMode === 'number' ? "bg-white text-[#4A5D23] shadow-sm" : "text-[#1C221A]/70 hover:text-[#1C221A]")}
                      >
                        Numbered Size
                      </button>
                    </div>
                  </div>
                )}
                {isShoes ? (
                  <>
                    <div className="hidden sm:block overflow-hidden rounded-2xl border border-[#D4D7C9]/50 bg-white shadow-sm">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F8F9F5] font-sans text-[11px] uppercase tracking-[0.15em] text-[#17210C]/60 whitespace-nowrap">
                              <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Foot Length (cm)</th>
                              <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">Foot Length (inch)</th>
                              <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium text-[#4A5D23]">EU Size (BD)</th>
                              <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">US Size</th>
                              <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">UK Size</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D4D7C9]/20">
                            {SHOE_SIZE_CHART.map((row) => (
                              <tr key={row.eu} className="font-sans text-[14px] font-normal text-[#1C221A] hover:bg-[#F8F9F5]/50 transition-colors">
                                <td className="px-5 py-3.5">{row.cm}</td>
                                <td className="px-5 py-3.5">{row.inch}</td>
                                <td className="px-5 py-3.5 text-accent">{row.eu}</td>
                                <td className="px-5 py-3.5">{row.us}</td>
                                <td className="px-5 py-3.5">{row.uk}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="sm:hidden space-y-3">
                      {SHOE_SIZE_CHART.map((row) => (
                        <div key={row.eu} className="bg-white border border-[#D4D7C9]/50 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#4A5D23]/5 px-4 py-2.5 border-b border-[#D4D7C9]/30 flex justify-between items-center">
                            <span className="font-heading text-xs font-bold text-[#4A5D23] uppercase tracking-widest">EU Size (BD)</span>
                            <span className="font-heading text-lg font-bold text-[#4A5D23]">{row.eu}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 p-4">
                            <div>
                              <span className="block font-sans text-[10px] uppercase tracking-wider text-[#1C221A]/50 mb-1">Foot Length</span>
                              <span className="font-sans text-sm text-[#1C221A]">{row.cm} cm / {row.inch}</span>
                            </div>
                            <div>
                              <span className="block font-sans text-[10px] uppercase tracking-wider text-[#1C221A]/50 mb-1">US / UK Size</span>
                              <span className="font-sans text-sm text-[#1C221A]">US {row.us} / UK {row.uk}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : standardSizeKeys.length > 0 ? (
                  <>
                    <div className="hidden sm:block overflow-hidden rounded-2xl border border-[#D4D7C9]/50 bg-white shadow-sm">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F8F9F5] font-sans text-[11px] uppercase tracking-[0.15em] text-[#17210C]/60 whitespace-nowrap">
                              <th className="px-5 py-4 border-b border-[#D4D7C9]/30 font-normal text-[#4A5D23]">Size</th>
                              {measurementKeys.map(key => (
                                <th key={key} className="px-5 py-4 border-b border-[#D4D7C9]/30 font-medium">{key.replace('_', ' ')} (in)</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D4D7C9]/20">
                            {activeChartKeys.map((size) => (
                              <tr key={size} className="font-sans text-[14px] font-normal text-[#1C221A] hover:bg-[#F8F9F5]/50 transition-colors">
                                <td className="px-5 py-4 text-[#4A5D23] bg-[#4A5D23]/5 font-medium">{size}</td>
                                {measurementKeys.map(key => (
                                  <td key={key} className="px-5 py-4">{standardChartData[size][key]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="sm:hidden flex flex-col gap-3">
                      {activeChartKeys.map((size) => (
                        <div key={size} className="bg-white border border-[#D4D7C9]/50 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#4A5D23]/5 px-4 py-2.5 border-b border-[#D4D7C9]/30 flex justify-between items-center">
                            <span className="font-heading text-xs font-bold text-[#4A5D23] uppercase tracking-widest">Size</span>
                            <span className="font-heading text-lg font-bold text-[#4A5D23]">{size}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4 p-4">
                            {measurementKeys.map(key => (
                              <div key={key} className="flex flex-col">
                                <span className="font-sans text-[10px] uppercase tracking-wider text-[#1C221A]/50 mb-0.5">{key.replace('_', ' ')} (in)</span>
                                <span className="font-sans text-sm font-medium text-[#1C221A]">{standardChartData[size][key]}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center text-[#1C221A]/50 font-sans text-sm border border-dashed border-[#D4D7C9] rounded-2xl">
                    Standard size chart not available for this category yet.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- Fullscreen Lightbox Gallery (Mainly for Mobile/Touch Devices) --- */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[20000] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">

          <div className="absolute top-0 w-full px-6 py-5 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
            <span className="text-white font-heading text-sm uppercase tracking-widest">{activeInstruction.title}</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all rounded-full p-2.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              key={activeInstruction.image}
              src={activeInstruction.image}
              alt={activeInstruction.title}
              className="max-w-[95%] max-h-[85%] bg-white object-contain animate-in zoom-in-95 duration-300"
              style={{ touchAction: 'pinch-zoom' }}
              draggable="false"
            />
          </div>

          {/* Bottom Dots Indicator */}
          <div className="absolute bottom-8 flex gap-2.5">
            {currentGroup.keys.map((_, idx) => (
              <div
                key={idx}
                className={cn("w-2 h-2 rounded-full transition-all duration-300", idx === activeStepIndex ? "bg-white scale-125" : "bg-white/30")}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4D7C9; border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}

export default SizeGuideModal;