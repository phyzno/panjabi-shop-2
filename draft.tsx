"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

// --- Custom Reusable Footer Link Component with Push Animation ---
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="group flex items-center relative text-[#1C221A]/60 hover:text-[#4A5D23] transition-colors duration-300 font-sans text-[13px] font-medium tracking-[0.08em] py-1"
  >
    {/* Left Emerging Line Indicator */}
    <span className="absolute left-0 w-0 h-[1.5px] bg-[#4A5D23] transition-all duration-300 ease-out group-hover:w-4 group-active:w-4 opacity-0 group-hover:opacity-100 group-active:opacity-100" />
    
    {/* Text That Gets Pushed to the Right */}
    <span className="transition-transform duration-300 ease-out group-hover:translate-x-6 group-active:translate-x-6">
      {children}
    </span>
  </Link>
);

export default function Footer() {
  return (
    <footer className="bg-[#F8F9F5] border-t border-[#EBECE3] pt-20 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 pb-16 border-b border-[#EBECE3]/60">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-heading text-[20px] font-bold uppercase tracking-[0.15em] text-[#17210C]">
              SIGNATURE
            </h3>
            <p className="font-sans text-[13px] leading-relaxed text-[#1C221A]/60 max-w-[240px]">
              Crafting premium attire tailored to perfection. Experience luxury fabrics and timeless designs made just for you.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-[#1C221A]/60 hover:text-[#4A5D23] transition-colors duration-300" aria-label="Facebook">
                <svg className="w-4 h-4 stroke-[1.5]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12c0 4.84 3.44 8.85 7.94 9.8v-6.93H7.9v-2.87h2.04V9.41c0-2.02 1.2-3.13 3.03-3.13.88 0 1.8.16 1.8.16v1.98h-1.02c-1.01 0-1.32.63-1.32 1.28v1.53h2.24l-.36 2.87h-1.88V21.8C18.56 20.85 22 16.84 22 12z" stroke="currentColor" strokeWidth="0"/>
                  <path d="M15 12.5v2.87h1.88l.36-2.87h-2.24z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="text-[#1C221A]/60 hover:text-[#4A5D23] transition-colors duration-300" aria-label="Instagram">
                <svg className="w-4 h-4 stroke-[1.5]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="text-[#1C221A]/60 hover:text-[#4A5D23] transition-colors duration-300" aria-label="Twitter">
                <svg className="w-4 h-4 stroke-[1.5]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 5.92c-.66.3-1.36.5-2.1.6.76-.46 1.34-1.18 1.62-2.05-.71.42-1.5.72-2.34.88A3.66 3.66 0 0016.15 4c-2.02 0-3.66 1.63-3.66 3.64 0 .29.03.57.1.84C9.1 8.3 6.13 6.7 4 4.15c-.32.55-.5 1.2-.5 1.89 0 1.3.66 2.45 1.67 3.12-.61-.02-1.18-.19-1.68-.46v.05c0 1.76 1.25 3.23 2.9 3.56-.3.08-.62.12-.95.12-.23 0-.45-.02-.67-.06.45 1.4 1.75 2.42 3.29 2.45A7.33 7.33 0 014 19.54 10.34 10.34 0 0010.66 22c6.4 0 9.9-5.3 9.9-9.9v-.45c.68-.5 1.26-1.12 1.72-1.82-.63.28-1.3.47-2 .55z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="flex flex-col space-y-5">
            <h4 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-[#17210C]">
              Collections
            </h4>
            <div className="flex flex-col space-y-2.5">
              <FooterLink href="/collection/wedding">Wedding Edition</FooterLink>
              <FooterLink href="/collection/casual">Casual Attire</FooterLink>
              <FooterLink href="/collection/party">Party Wear</FooterLink>
              <FooterLink href="/collection/exclusive">Exclusive Release</FooterLink>
            </div>
          </div>

          {/* Column 3: Customer Care */}
          <div className="flex flex-col space-y-5">
            <h4 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-[#17210C]">
              Customer Care
            </h4>
            <div className="flex flex-col space-y-2.5">
              <FooterLink href="/about">Our Story</FooterLink>
              <FooterLink href="/track-order">Track Your Order</FooterLink>
              <FooterLink href="/shipping-returns">Shipping & Returns</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
            </div>
          </div>

          {/* Column 4: Contact & Showroom */}
          <div className="flex flex-col space-y-5">
            <h4 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-[#17210C]">
              The Showroom
            </h4>
            <div className="flex flex-col space-y-4 font-sans text-[13px] text-[#1C221A]/70">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#4A5D23] shrink-0 mt-0.5 stroke-[1.5]" />
                <span className="leading-relaxed">12A Banani Commercial Area,<br />Road 11, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#4A5D23] shrink-0 stroke-[1.5]" />
                <span>+880 1700 000000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#4A5D23] shrink-0 stroke-[1.5]" />
                <span className="hover:text-[#4A5D23] transition-colors duration-300 cursor-pointer">info@signature.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Area */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1C221A]/40 text-center sm:text-left">
            © {new Date().getFullYear()} SIGNATURE. All Rights Reserved.
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#4A5D23]/50">
            Designed for Corporate Excellence
          </p>
        </div>

      </div>
    </footer>
  );
}