"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { useSizeGuideStore } from "@/store/useSizeGuideStore";

const FooterLink = ({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="group flex items-center relative text-white/70 hover:text-[#B5C293] transition-colors duration-300 font-sans text-[13px] font-medium tracking-[0.08em] py-1"
  >
    <span className="absolute left-0 w-0 h-[1.5px] bg-[#B5C293] transition-all duration-300 ease-out group-hover:w-4 group-active:w-4 opacity-0 group-hover:opacity-100 group-active:opacity-100" />
    
    <span className="transition-transform duration-300 ease-out group-hover:translate-x-6 group-active:translate-x-6">
      {children}
    </span>
  </Link>
);

export default function Footer() {
  const openSizeGuide = useSizeGuideStore((state) => state.openModal);
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 pt-20 pb-8 select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16">
          
          <div className="flex flex-col space-y-6">
            <h3 className="font-heading text-2xl font-bold uppercase tracking-[0.15em] text-[#B5C293]">
              MENS'O<span className="text-accent text-3xl leading-none font-sans">.</span>
            </h3>
            <p className="font-sans text-[13px] leading-relaxed text-white/70 max-w-[260px]">
              Crafting premium, royal heritage ethnic wear stitched to your exact measurements. Experience luxury fabrics and timeless designs.
            </p>
            <div className="flex items-center gap-5 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#B5C293] transition-all duration-300 hover:-translate-y-1 hover:scale-110" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#B5C293] transition-all duration-300 hover:-translate-y-1 hover:scale-110" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#B5C293] transition-all duration-300 hover:-translate-y-1 hover:scale-110" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col space-y-5">
            <h4 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-white/90">
              Quick Links
            </h4>
            <div className="flex flex-col space-y-2.5">
              <FooterLink href="/shop">Explore Shop</FooterLink>
              <FooterLink href="/customize">Custom Tailoring</FooterLink>
              <FooterLink href="/track-order">Track Order</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </div>
          </div>

          <div className="flex flex-col space-y-5">
            <h4 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-white/90">
              Customer Care
            </h4>
            <div className="flex flex-col space-y-2.5">

              <FooterLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  openSizeGuide({ isGlobal: true, tab: 'guide', category: 'panjabi' });
                }}
              >
                Measurement Guide
              </FooterLink>

              <FooterLink href="/faq">FAQs</FooterLink>
              <FooterLink href="/shipping">Shipping Info</FooterLink>
              <FooterLink href="/returns">Returns & Exchanges</FooterLink>  
            </div>
          </div>

          <div className="flex flex-col space-y-5">
            <h4 className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-white/90">
              The Showroom
            </h4>
            <div className="flex flex-col space-y-4 font-sans text-[13px] text-white/70">
              
              <a 
                href="https://maps.google.com/?q=12A+Banani+Commercial+Area,+Road+11,+Dhaka,+Bangladesh" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-start gap-3 hover:text-[#B5C293] transition-colors duration-300 group/link"
              >
                <MapPin className="w-4 h-4 text-[#B5C293] hover:text-accent shrink-0 mt-0.5 stroke-[1.5]" />
                <span className="leading-relaxed group-hover/link:underline underline-offset-4">
                  12A Banani Commercial Area,<br />Road 11, Dhaka, Bangladesh
                </span>
              </a>

              <a 
                href="tel:+8801700000000" 
                className="flex items-center gap-3 hover:text-[#B5C293] transition-colors duration-300 group/link"
              >
                <Phone className="w-4 h-4 text-[#B5C293] hover:text-accent shrink-0 stroke-[1.5]" />
                <span className="group-hover/link:underline underline-offset-4">+880 1700 000000</span>
              </a>

              <a 
                href="mailto:info@panjabi.com" 
                className="flex items-center gap-3 hover:text-[#B5C293] transition-colors duration-300 group/link"
              >
                <Mail className="w-4 h-4 text-[#B5C293] hover:text-accent shrink-0 stroke-[1.5]" />
                <span className="group-hover/link:underline underline-offset-4">info@menso.com</span>
              </a>
            </div>

            <div className="pt-4 flex flex-col space-y-3">
               <h4 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                 Accepted Payments
               </h4>
               <div className="flex flex-wrap items-center gap-2">
                 <span className="px-3 py-1.5 text-[10px] font-medium tracking-[0.15em] uppercase border border-white/70 bg-white/5 rounded-sm text-white/70">
                   bKash
                 </span>
                 <span className="px-3 py-1.5 text-[10px] font-medium tracking-[0.15em] uppercase border border-white/70 bg-white/5 rounded-sm text-white/70">
                   Nagad
                 </span>
                 <span className="px-3 py-1.5 text-[10px] font-medium tracking-[0.15em] uppercase border border-white/70 bg-white/5 rounded-sm text-white/70 flex items-center gap-1.5">
                   <CreditCard className="w-3.5 h-3.5" /> COD
                 </span>
               </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-white/50 text-center md:text-left">
            © {new Date().getFullYear()} Mens'O Fashion Shop. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="font-sans text-[11px] uppercase tracking-[0.1em] text-white/50 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-sans text-[11px] uppercase tracking-[0.1em] text-white/50 hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}