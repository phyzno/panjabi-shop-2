"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, ShieldCheck } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Ayman Sadiq",
    role: "Groom",
    purchase: "Custom Zardosi Silk",
    rating: 5,
    text: "The craftsmanship is absolutely breathtaking. I ordered a custom fit for my wedding, and the measurements were flawless. It truly felt like wearing a piece of royal heritage."
  },
  {
    id: 2,
    name: "Salman Muqtadir",
    role: "Verified Buyer",
    purchase: "Emerald Brocade",
    rating: 5,
    text: "Exceptional fabric quality and attention to detail. The delivery was perfectly on time, and the packaging itself felt like an unboxing experience of a luxury watch."
  },
  {
    id: 3,
    name: "Rafiqul Islam",
    role: "Verified Buyer",
    purchase: "Linen Breeze Olive",
    rating: 5,
    text: "I was looking for something minimalist yet elegant for everyday wear. The Linen Breeze exceeded my expectations. Extremely comfortable and the tailoring is incredibly sharp."
  },
  {
    id: 4,
    name: "Dr. Hasan Mahmud",
    role: "Groom's Brother",
    purchase: "Midnight Velvet Noir",
    rating: 5,
    text: "Wore this to a reception and received compliments all night. The velvet is premium, doesn't trap heat, and the subtle metallic accents are just perfect. Highly recommended."
  },
  {
    id: 5,
    name: "Tahsan Khan",
    role: "Verified Buyer",
    purchase: "Ivory Pearl Embroidered",
    rating: 5,
    text: "The ivory panjabi is simply a work of art. The embroidery is so subtle yet striking. Highly impressed with the overall finish and customer service."
  }
];

export default function ReviewSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const totalReviews = reviews.length;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalReviews);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  };

  const handleCardClick = (index: number) => {
    const diff = (index - activeIndex + totalReviews) % totalReviews;
    if (diff === 1) handleNext();
    if (diff === totalReviews - 1) handlePrev();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + totalReviews) % totalReviews;

    if (diff === 0) {
      return "translate-x-0 scale-100 opacity-100 z-30 shadow-[0_25px_60px_rgba(28,34,26,0.15)] rotate-0 blur-none pointer-events-auto";
    } else if (diff === 1) {
      return "translate-x-[25%] sm:translate-x-[35%] md:translate-x-[50%] scale-[0.85] opacity-60 z-20 shadow-md rotate-6 blur-[1px] cursor-pointer hover:opacity-80 hover:scale-[0.88] pointer-events-auto";
    } else if (diff === totalReviews - 1) {
      return "-translate-x-[25%] sm:-translate-x-[35%] md:-translate-x-[50%] scale-[0.85] opacity-60 z-20 shadow-md -rotate-6 blur-[1px] cursor-pointer hover:opacity-80 hover:scale-[0.88] pointer-events-auto";
    } else {
      return "translate-x-0 scale-75 opacity-0 z-10 rotate-0 pointer-events-none";
    }
  };

  return (
    <section className="py-20 md:py-24 relative border-t border-[#D4D7C9]/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-0 md:px-6">
        
        <div className="flex flex-col items-center mb-10 md:mb-16 px-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#4A5D23]/70 mb-3">
            Voice of Trust
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-[0.15em] text-[#1C221A] text-center leading-tight">
            What Our Customers Say
          </h2>
          <div className="w-16 h-[2px] bg-[#C25934] mt-6"></div>
        </div>

        <div 
          className="relative flex justify-center items-center w-full min-h-[400px] md:min-h-[430px] px-4 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {reviews.map((review, index) => {
            const isActive = index === activeIndex;
            
            return (
              <div 
                key={review.id} 
                onClick={() => handleCardClick(index)}
                className={`absolute w-[75vw] sm:w-[400px] lg:w-[440px] flex flex-col bg-[#F8F9F5] border border-[#D4D7C9]/60 p-6 md:p-10 rounded-[20px] transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] select-none ${getCardStyle(index)}`}
              >
                <Quote className="absolute top-6 right-6 w-12 h-12 md:w-16 md:h-16 text-[#D4D7C9]/40 -rotate-12" />

                <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isActive ? 'fill-[#C25934] text-[#C25934]' : 'fill-[#D4D7C9] text-[#D4D7C9]'} transition-colors duration-500`} />
                    ))}
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors duration-500 ${isActive ? 'text-[#4A5D23]' : 'text-[#1C221A]/30'}`}>
                    <ShieldCheck className="w-4 h-4 stroke-[2]" />
                    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em]">Verified</span>
                  </div>
                </div>

                <p className={`font-sans text-[13px] md:text-[15px] leading-relaxed tracking-wide mb-8 md:mb-10 flex-grow relative z-10 italic transition-colors duration-500 ${isActive ? 'text-[#1C221A]/80' : 'text-[#1C221A]/40'}`}>
                  "{review.text}"
                </p>

                <div className="mt-auto border-t border-[#D4D7C9]/50 pt-4 md:pt-5 relative z-10 flex flex-col gap-1.5">
                  <h4 className={`font-heading text-base md:text-lg font-bold uppercase tracking-[0.1em] transition-colors duration-500 ${isActive ? 'text-[#1C221A]' : 'text-[#1C221A]/40'}`}>
                    {review.name}
                  </h4>
                  <span className={`font-sans text-[10px] md:text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-500 ${isActive ? 'text-[#C25934]' : 'text-[#1C221A]/30'}`}>
                    Ordered: {review.purchase}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center items-center gap-6 mt-6 md:mt-5 relative z-40">
          <button 
            onClick={handlePrev} 
            className="w-12 h-12 rounded-full border border-[#D4D7C9] bg-white text-[#1C221A] flex items-center justify-center hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-sm transition-all duration-300 active:scale-90 cursor-pointer"
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
          </button>
          
          <button 
            onClick={handleNext} 
            className="w-12 h-12 rounded-full border border-[#D4D7C9] bg-white text-[#1C221A] flex items-center justify-center hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-sm transition-all duration-300 active:scale-90 cursor-pointer"
            aria-label="Next Review"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

      </div>
    </section>
  );
}