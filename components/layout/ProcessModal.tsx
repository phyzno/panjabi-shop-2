"use client";

import React, { useEffect, useRef, useState } from "react";
import { MousePointer2, Palette, Scissors, Truck, X } from "lucide-react";

const steps = [
  {
    icon: MousePointer2,
    number: "01",
    title: "কাপড় নির্বাচন",
    description: "আপনার পছন্দের প্রিমিয়াম ফেব্রিক এবং স্টাইল নির্বাচন করুন।"
  },
  {
    icon: Palette,
    number: "02",
    title: "ডিজাইন কাস্টমাইজ",
    description: "কলারসহ খুঁটিনাটি বিস্তারিত নিজের মতো কাস্টমাইজ করে নিন।"
  },
  {
    icon: Scissors,
    number: "03",
    title: "নিখুঁত কারিগরী",
    description: "আমাদের দক্ষ কারিগর আপনার পরিমাপ অনুযায়ী পোশাকটি তৈরি করবে।"
  },
  {
    icon: Truck,
    number: "04",
    title: "ডোরস্টেপ ডেলিভারি",
    description: "নির্ধারিত সময়ে পৌঁছে যাবে আপনার পছন্দের ডিজাইনের পোশাক।"
  }
];

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProcessModal({ isOpen, onClose }: ProcessModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        setActiveCard(null);
        return;
      }

      const cards = container.querySelectorAll(".process-card");
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveCard(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    setTimeout(handleScroll, 100);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-6">
      <div 
        className="absolute inset-0 bg-[#111410]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full md:max-w-5xl h-[90vh] md:h-auto lg:h-auto max-h-[90vh] bg-[#F8F9F5] rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-[0_28px_80px_rgba(14,20,9,0.2)] flex flex-col animate-in slide-in-from-bottom-full md:fade-in md:zoom-in-95 duration-300">
        
        <div className="w-full bg-[#F8F9F5]/90 backdrop-blur-md px-6 py-3 flex justify-between items-center z-50 border-b border-[#EBECE3]/60 shrink-0">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#4A5D23]/70 font-medium select-none">
            User Manual
          </span>
          <button 
            onClick={onClose}
            className="w-15 h-10 rounded-full bg-white border border-[#EBECE3] flex items-center justify-center text-[#17210C] hover:text-[#C25934] hover:border-[#D4D7C9] shadow-sm transition-all active:scale-90"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto p-6 md:p-12 flex-1 scroll-smooth"
        >
          <div className="flex flex-col items-center mb-12 md:mb-16">
            <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#4A5D23] mb-3">
              আমাদের কর্মপদ্ধতি
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.1em] text-[#17210C] text-center leading-tight">
              কিভাবে ডিজাইন করবেন?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => {
              const isMobileActive = activeCard === index;

              return (
                <div 
                  key={index} 
                  className={`process-card relative group p-8 rounded-[24px] bg-white border transition-all duration-500 ${
                    isMobileActive 
                      ? "border-[#D4D7C9] shadow-[0_20px_40px_rgba(14,20,9,0.06)] -translate-y-1" 
                      : "border-[#EBECE3] shadow-[0_4px_20px_rgba(14,20,9,0.03)]"
                  } md:hover:border-[#D4D7C9] md:hover:shadow-[0_20px_40px_rgba(14,20,9,0.06)] md:hover:-translate-y-1`}
                >
                  <span className={`absolute top-6 right-8 font-heading text-4xl font-bold transition-colors duration-500 ${
                    isMobileActive ? "text-[#4A5D23]/10" : "text-[#EBECE3]"
                  } md:group-hover:text-[#4A5D23]/10`}>
                    {step.number}
                  </span>

                  <div className={`w-14 h-14 mb-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isMobileActive 
                      ? "bg-[#4A5D23] text-white scale-105" 
                      : "bg-[#F8F9F5] text-[#4A5D23]"
                  } md:group-hover:bg-[#4A5D23] md:group-hover:text-white md:group-hover:scale-105`}>
                    <step.icon className="w-6 h-6 stroke-[1.5]" />
                  </div>

                  <h3 className="font-heading text-[16px] font-bold uppercase tracking-[0.1em] text-[#17210C] mb-3">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[12px] leading-relaxed text-[#1C221A]/60">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}