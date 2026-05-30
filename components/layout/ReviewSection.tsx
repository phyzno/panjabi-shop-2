"use client";

import React, { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

// --- Mock Data ---
const reviews = [
  {
    id: 1,
    name: "আহমেদ ফয়সাল",
    role: "ঢাকা",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    text: "ফেব্রিকের কোয়ালিটি এবং ফিটিং একদম পারফেক্ট ছিল। কাস্টমাইজেশন অপশনগুলো সত্যিই অসাধারণ, ঠিক যেমনটি চেয়েছিলাম তেমনই পেয়েছি।"
  },
  {
    id: 2,
    name: "শরিফুল ইসলাম",
    role: "সিলেট",
    rating: 5,
    text: "এতটা প্রফেশনাল কাজ আশা করিনি। সেলাইয়ের ফিনিশিং এবং বাটনের ডিটেইলিংগুলো খুবই প্রিমিয়াম। ডেলিভারিও পেয়েছি একদম সময়মতো।"
  },
  {
    id: 3,
    name: "মেহেদী হাসান",
    role: "চট্টগ্রাম",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    text: "প্যাকেজিং থেকে শুরু করে প্রোডাক্টের কোয়ালিটি—সবকিছুতেই প্রিমিয়াম ফিল আছে। কাস্টমার সার্ভিসও অনেক রেস্পন্সিভ। হাইলি রেকমেন্ডেড!"
  },
  {
    id: 4,
    name: "রাকিব উদ্দিন",
    role: "রাজশাহী",
    rating: 5,
    text: "ডিজাইন থেকে শুরু করে ডেলিভারি পর্যন্ত পুরো প্রসেসটা খুবই স্মুথ ছিল। কাপড়ের ম্যাটেরিয়াল সত্যিই অনেক আরামদায়ক।"
  },
  {
    id: 5,
    name: "তানভীর আহমেদ",
    role: "খুলনা",
    rating: 5,
    text: "আমি সাধারণত অনলাইনে কাপড় কিনি না, কিন্তু আপনাদের কাস্টমাইজেশন অপশন দেখে অর্ডার করেছিলাম। আমি ১০০% সন্তুষ্ট।"
  }
];

export default function ReviewSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  // ওভারফ্লো চেক (অ্যারো বাটন দেখানোর জন্য)
  const checkOverflow = () => {
    if (carouselRef.current) {
      const { scrollWidth, clientWidth } = carouselRef.current;
      setShowArrows(scrollWidth > clientWidth + 10);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const amount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 350; 
      carouselRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 -white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-0 md:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 px-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#4A5D23] mb-3">
            Client Satisfaction
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.1em] text-[#17210C] text-center">
            What Customers Say
          </h2>
        </div>

        {/* Carousel Section */}
        <div className="relative group/carousel mt-8">
            
          {/* Left Arrow */}
          {showArrows && (
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute left-2 md:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 bg-white/95 backdrop-blur-sm text-[#1C221A] border border-[#EBECE3] hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-md flex items-center justify-center rounded-full cursor-pointer transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </button>
          )}

          {/* Scrollable Area */}
          <div 
            ref={carouselRef}
            className={`flex flex-nowrap gap-6 overflow-x-auto px-6 pb-12 pt-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth max-w-7xl mx-auto ${
              showArrows ? "md:justify-start" : "md:justify-center"
            }`}
          >
            {reviews.map((review) => (
              <div 
                key={review.id}
                className="w-[85vw] sm:w-[320px] md:w-[350px] flex-shrink-0 snap-center group p-8 md:p-10 rounded-[24px] bg-[#F8F9F5] border border-[#EBECE3] transition-all duration-500 hover:border-[#D4D7C9] hover:shadow-[0_20px_40px_rgba(14,20,9,0.06)] flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1.5 mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C25934] stroke-[#C25934]" />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="font-sans text-[14px] leading-relaxed text-[#1C221A]/75 mb-8">
                    "{review.text}"
                  </p>
                </div>
                
                {/* Client Info with Image Fallback Logic */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#EBECE3] flex items-center justify-center font-heading text-[18px] font-bold text-[#17210C] transition-colors duration-500 group-hover:bg-[#4A5D23] group-hover:text-white shrink-0">
                    {review.image ? (
                      <img 
                        src={review.image} 
                        alt={review.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-heading text-[14px] font-bold tracking-[0.05em] text-[#17210C]">
                      {review.name}
                    </h4>
                    <p className="font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#4A5D23]/60 mt-1">
                      {review.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {showArrows && (
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute right-2 md:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 bg-white/95 backdrop-blur-sm text-[#1C221A] border border-[#EBECE3] hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-md flex items-center justify-center rounded-full cursor-pointer transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </button>
          )}
            
        </div>
      </div>
    </section>
  );
}