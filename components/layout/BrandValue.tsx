"use client";

import React from "react";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    subtitle: "Authentic materials"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    subtitle: "Nationwide shipping"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    subtitle: "Hassle-free process"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-[#F8F9F5]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center p-8 rounded-[24px] bg-white border border-[#EBECE3] shadow-[0_4px_20px_rgba(14,20,9,0.03)] transition-all duration-300 hover:border-[#D4D7C9] hover:shadow-[0_10px_30px_rgba(14,20,9,0.06)]"
            >
              <div className="w-12 h-12 mb-5 rounded-full bg-[#F8F9F5] flex items-center justify-center text-[#4A5D23]">
                <item.icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-heading text-[15px] font-bold uppercase tracking-[0.1em] text-[#17210C] mb-1">
                {item.title}
              </h3>
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#4A5D23]/60">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}