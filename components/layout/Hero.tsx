"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Scissors } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[100svh] min-h-[500px] overflow-hidden bg-[#111410]">
      {/* Aesthetic Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-90 scale-105"
        >
          {/* Provided Premium Video Link */}
          <source
            src="https://res.cloudinary.com/djr5ztmep/video/upload/v1779465788/1471877_People_1920x1080_mcbf7s.mp4"
            type="video/mp4"
          />
        </video>
        
        {/* Premium Dark Olive Glass Overlay for Text Readability */}
        <div className="absolute inset-0 bg-[#111410]/50"></div>
      </div>

      {/* Hero Content - Editorial Layout */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between">
        
        {/* Left Side: Typography (Centered on Mobile, Left on PC) */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start pt-30 max-w-2xl text-center md:text-left">

          {/* Majestic Main Heading */}
          <h1 className="font-heading text-4xl leading-[1.15] sm:text-5xl lg:text-[3.5rem] font-bold tracking-[0.1em] uppercase text-[#F8F9F5] drop-shadow-2xl mb-4 md:mb-6">
            Your Signature Style, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F8F9F5] to-[#D4D7C9]">
              Tailored to
            </span>
            <br className="hidden md:block" />
            {" "}Perfection<span className="text-accent">.</span>
          </h1>

          {/* Premium Description */}
          <p className="font-sans text-[11px] sm:text-[13px] md:text-base font-medium tracking-[0.1em] md:tracking-[0.12em] text-[#E1E4D9]/90 uppercase leading-relaxed max-w-[280px] sm:max-w-sm md:max-w-lg">
            Discover our exclusive ready-to-wear collections or craft your own masterpiece with our premium tailoring that match with you perfectly.
          </p>
        </div>

        {/* Right Side: Action Buttons (Inline on Mobile, Bottom Right on PC) */}
        <div className="flex-shrink-0 flex flex-row justify-center md:justify-end items-center md:items-end pb-8 md:pb-16 gap-3 md:gap-5 mt-auto md:mt-0 w-full md:w-auto px-2 md:px-0">
          
          {/* Primary Button: Customize */}
          <Link
            href="/customize"
            className="group relative flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 bg-primary text-primary-foreground hover:bg-[#3D4C1D] px-2 py-3.5 md:px-12 md:py-4 font-sans font-medium uppercase tracking-[0.15em] md:tracking-[0.2em] text-[10px] md:text-sm transition-all duration-300 border border-transparent shadow-xl hover:shadow-primary/30 rounded-sm overflow-hidden active:scale-[0.98]"
          >
            {/* Elegant Shine Hover Effect */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite] group-active:animate-[shimmer_1.5s_infinite]"></span>
            
            {/* Animated Scissors Icon */}
            <Scissors className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] stroke-[1.5] relative z-10 transition-transform duration-500 ease-out group-hover:-rotate-45 group-hover:scale-110 group-active:-rotate-45 group-active:scale-110" />
            <span className="relative z-10 whitespace-nowrap">Customize</span>
          </Link>

          {/* Secondary Button: Explore Collection */}
          <Link
            href="/shop"
            className="group flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 bg-transparent border border-[#E1E4D9]/40 text-[#F8F9F5] hover:bg-[#F8F9F5] hover:text-[#111410] px-2 py-3.5 md:px-12 md:py-4 font-sans font-medium uppercase tracking-[0.15em] md:tracking-[0.2em] text-[10px] md:text-sm transition-all duration-300 backdrop-blur-sm rounded-sm active:scale-[0.98]"
          >
            <span className="whitespace-nowrap">Explore</span>
            {/* Smooth Arrow Translation */}
            <ArrowRight className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] stroke-[1.5] transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-active:translate-x-1.5" />
          </Link>
          
        </div>

      </div>
    </section>
  );
}