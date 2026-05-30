"use client";

import React from "react";
import { MousePointer2, Palette, Scissors, Truck } from "lucide-react";

const steps = [
  {
    icon: MousePointer2,
    number: "01",
    title: "কাপড় নির্বাচন",
    description: "আপনার পছন্দের প্রিমিয়াম ফেব্রিক এবং স্টাইল নির্বাচন দিয়ে শুরু করুন।"
  },
  {
    icon: Palette,
    number: "02",
    title: "ডিজাইন কাস্টমাইজ",
    description: "কলার, কাফ এবং বাটনের মতো খুঁটিনাটি বিস্তারিত নিজের মতো সাজিয়ে নিন।"
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
    description: "সবশেষে আপনার হাতের কাছেই পৌঁছে যাবে আপনার নিজস্ব ডিজাইনের পোশাক।"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#F8F9F5]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center mb-16">
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#4A5D23] mb-3">
            আমাদের কর্মপদ্ধতি
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.1em] text-[#17210C]">
            কিভাবে ডিজাইন করবেন?
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group p-8 rounded-[24px] bg-white border border-[#EBECE3] shadow-[0_4px_20px_rgba(14,20,9,0.03)] hover:shadow-[0_20px_40px_rgba(14,20,9,0.06)] transition-all duration-500"
            >
              {/* Step Number */}
              <span className="absolute top-6 right-8 font-heading text-4xl font-bold text-[#EBECE3] group-hover:text-[#4A5D23]/10 transition-colors duration-500">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 mb-8 rounded-full bg-[#F8F9F5] flex items-center justify-center text-[#4A5D23] group-hover:bg-[#4A5D23] group-hover:text-white transition-all duration-500">
                <step.icon className="w-6 h-6 stroke-[1.5]" />
              </div>

              {/* Text */}
              <h3 className="font-heading text-[16px] font-bold uppercase tracking-[0.1em] text-[#17210C] mb-3">
                {step.title}
              </h3>
              <p className="font-sans text-[12px] leading-relaxed text-[#1C221A]/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}