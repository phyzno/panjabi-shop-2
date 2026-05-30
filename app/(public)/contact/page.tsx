"use client";

import React, { useEffect } from "react";
import { MapPin, Phone, Mail, Clock, ArrowRight, Scissors, ShoppingBag, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact | Panjabi Shop';
  }, []);

  // Showroom Details & Map Link
  const contactInfo = {
    address: "12A Banani Commercial Area, Road 11, Dhaka, Bangladesh",
    phone: "+880 1700 000000",
    email: "info@panjabi.com",
    hours: "Everyday: 10:00 AM - 09:00 PM",
    mapLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d138912.08779815942!2d90.29840368365149!3d23.806731922387495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b9ed8915d9bd%3A0x7686e24704183351!2sPanjabi%20Ghor!5e0!3m2!1sen!2sbd!4v1779657402476!5m2!1sen!2sbd"
  };

  return (
    <section className="w-full bg-[#F8F9F5] py-8 md:py-16 overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* --- LEFT CONTENT: Information & Typography --- */}
          <div className="flex flex-col z-10">
            <span className="text-[#4A5D23]/70 text-[12px] md:text-[13px] uppercase tracking-[0.3em] mb-5">
              Flagship Studio
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold uppercase tracking-[0.1em] mb-6 text-[#17210C] leading-[1.15]">
              Banani <br className="hidden lg:block" />
              <span className="text-[#4A5D23]">Atelier</span>
            </h1>
            
            <p className="font-sans text-[#1C221A]/70 text-[14px] md:text-[15px] font-normal tracking-wide leading-relaxed mb-10 max-w-lg">
              Step into our flagship studio to experience true royal heritage. Feel the premium fabrics, consult with our master tailors, and get your exact measurements taken for a flawless bespoke fit.
            </p>

            {/* Separated 4 Info Details List */}
            <div className="flex flex-col gap-6 mb-12 border-y border-[#D4D7C9]/60 py-8">
              
              {/* 1. Location */}
              <div className="flex items-start gap-5 group">
                <div className="w-10 h-10 rounded-full bg-white border border-[#D4D7C9] flex items-center justify-center text-[#4A5D23] group-hover:bg-[#4A5D23] group-hover:text-white transition-colors shrink-0">
                  <MapPin className="w-4 h-4 stroke-[1.5]" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#17210C] mb-1">Location</span>
                  <span className="font-sans text-[14px] text-[#1C221A]/80">{contactInfo.address}</span>
                </div>
              </div>
              
              {/* 2. Opening Hours */}
              <div className="flex items-start gap-5 group">
                <div className="w-10 h-10 rounded-full bg-white border border-[#D4D7C9] flex items-center justify-center text-[#4A5D23] group-hover:bg-[#4A5D23] group-hover:text-white transition-colors shrink-0">
                  <Clock className="w-4 h-4 stroke-[1.5]" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#17210C] mb-1">Opening Hours</span>
                  <span className="font-sans text-[14px] text-[#1C221A]/80">{contactInfo.hours}</span>
                </div>
              </div>

              {/* 3. Call */}
              <div className="flex items-start gap-5 group">
                <a href={`tel:${contactInfo.phone}`} className="w-10 h-10 rounded-full bg-white border border-[#D4D7C9] flex items-center justify-center text-[#4A5D23] group-hover:bg-[#4A5D23] group-hover:text-white transition-colors shrink-0">
                  <Phone className="w-4 h-4 stroke-[1.5]" />
                </a>
                <div className="flex flex-col pt-0.5">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#17210C] mb-1">Call Studio</span>
                  <a href={`tel:${contactInfo.phone}`} className="font-sans text-[14px] text-[#1C221A]/80 hover:text-[#C25934] transition-colors">{contactInfo.phone}</a>
                </div>
              </div>

              {/* 4. Email */}
              <div className="flex items-start gap-5 group">
                <a href={`mailto:${contactInfo.email}`} className="w-10 h-10 rounded-full bg-white border border-[#D4D7C9] flex items-center justify-center text-[#4A5D23] group-hover:bg-[#4A5D23] group-hover:text-white transition-colors shrink-0">
                  <Mail className="w-4 h-4 stroke-[1.5]" />
                </a>
                <div className="flex flex-col pt-0.5">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#17210C] mb-1">Email Us</span>
                  <a href={`mailto:${contactInfo.email}`} className="font-sans text-[14px] text-[#1C221A]/80 hover:text-[#C25934] transition-colors">{contactInfo.email}</a>
                </div>
              </div>

            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/customize/new"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-[#4A5D23] text-white font-sans uppercase tracking-[0.15em] text-[11px] hover:bg-[#3D4C1D] transition-all duration-300 rounded-full shadow-[0_10px_20px_rgba(74,93,35,0.2)] active:scale-[0.98]"
              >
                <Scissors className="w-4 h-4" />
                <span>Start Designing</span>
              </Link>
              
              <Link 
                href="/shop"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#17210C] border border-[#D4D7C9] font-sans uppercase tracking-[0.15em] text-[11px] hover:bg-[#EBECE3] transition-all duration-300 rounded-full shadow-sm active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Shop</span>
              </Link>
            </div>
          </div>

          {/* --- RIGHT CONTENT: Immersive Map Widget --- */}
          <div className="w-full flex flex-col items-center lg:items-end">
            
            {/* Map Container - Sliced Top Design */}
            <div className="w-full flex flex-col rounded-[2.5rem] border-8 border-white shadow-[0_30px_60px_rgba(0,0,0,0.08)] bg-white overflow-hidden group">
              
              {/* Sliced White Header Bar */}
              <div className="flex items-center justify-center gap-2.5 px-6 md:px-8 py-3 bg-white shrink-0 z-20">
                 <ShieldCheck className="w-5 md:w-6 h-5 md:h-6 text-[#4A5D23] stroke-[2.5]" />
                 <span className="font-sans text-[11px] md:text-[14px] uppercase tracking-[0.2em] text-[#4A5D23] select-none">
                   Official Showroom Map
                 </span>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-[#D4D7C9]/60 shrink-0 z-20"></div>
              
              {/* Map Canvas Frame */}
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] bg-[#EBECE3]">
                
                {/* Embedded Live Studio Badge (Safe Placement: Bottom Right) */}
                <div className="absolute bottom-10 right-6 md:right-8 z-10 bg-[#111410] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-transform duration-500 hover:scale-105 pointer-events-none">
                  <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_12px_#22c55e]"></div>
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#F8F9F5]">
                    Live Studio
                  </span>
                </div>

                <iframe
                  src={contactInfo.mapLink}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[60%] contrast-[1.05] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                ></iframe>
              </div>
            </div>
            
            {/* Get Directions Trigger Anchor */}
            <div className="mt-8 w-full pl-4 md:pl-8 lg:pl-0 lg:pr-8 text-left lg:text-right">
               <a 
                 href="https://maps.app.goo.gl/sggU8janT5qz8sTV9"
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-[#1C221A]/50 hover:text-[#4A5D23] font-sans text-[12px] uppercase tracking-[0.3em] transition-colors duration-300 group/link"
               >
                 Get Directions 
                 <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1.5 transition-transform duration-300" />
               </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
