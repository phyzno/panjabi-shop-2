'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CollectionProductCard,
  type CollectionProduct,
  type CollectionProductCardSizeProps,
} from '@/components/shop/ProductCard';
import { CollectionQuickViewModal, type CollectionQuickViewSizeProps } from '@/components/shop/QuickViewModal';

interface FeaturedCollectionClientProps {
  products: CollectionProduct[];
  categories: string[];
  cardSize?: CollectionProductCardSizeProps;
  quickViewSize?: CollectionQuickViewSizeProps;
  initialCategory?: string;
}

export default function FeaturedCollectionClient({
  products,
  categories,
  cardSize,
  quickViewSize,
  initialCategory,
}: FeaturedCollectionClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory ?? categories[0]
  );
  const [quickViewProduct, setQuickViewProduct] = useState<CollectionProduct | null>(null);
  const [showArrows, setShowArrows] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // ডায়নামিক প্রোডাক্ট ফিল্টার করা
  const activeProducts = products.filter((product) => product.category === activeCategory);
  
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
  }, [activeCategory]);

  const handleCategoryClick = (category: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveCategory(category);

    if (tabsContainerRef.current) {
      const button = event.currentTarget;
      const container = tabsContainerRef.current;
      const scrollPos = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }

    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) {
      return;
    }

    const amount = window.innerWidth < 640 ? window.innerWidth * 0.8 : 300;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const openQuickView = (product: CollectionProduct) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <section className="py-12 md:py-16 bg-[#F8F9F5] relative">
      <div className="max-w-7xl mx-auto px-0 md:px-6">
        <div className="flex flex-col items-center mb-8 px-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#4A5D23]/70 mb-2">
            Ready to Wear
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.2em] text-[#17210C] mb-8 text-center leading-tight">
            Premium Collections
          </h2>

          <div
            ref={tabsContainerRef}
            className="flex justify-start md:justify-center gap-8 md:gap-14 overflow-x-auto px-4 w-full md:w-auto border-b-2 border-[#D4D7C9]/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth relative"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={(event) => handleCategoryClick(category, event)}
                className={`group whitespace-nowrap pb-3 font-sans text-xs md:text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300 relative select-none cursor-pointer ${
                  activeCategory === category
                    ? 'text-[#4A5D23]'
                    : 'text-[#1C221A]/50 hover:text-[#C25934]'
                }`}
              >
                {category}
                <span
                  className={`absolute bottom-[-2px] left-0 w-full transition-all duration-300 ${
                    activeCategory === category
                      ? 'h-[3px] bg-[#4A5D23]'
                      : 'h-[3px] bg-[#C25934] opacity-0 group-hover:opacity-100'
                  }`}
                ></span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative group/carousel mt-4">
          {showArrows && (
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-2 md:-left-4 lg:-left-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 bg-white/95 backdrop-blur-sm text-[#1C221A] border border-[#D4D7C9] hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-md flex items-center justify-center rounded-full cursor-pointer transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </button>
          )}

          <div
            ref={carouselRef}
            className={`flex flex-nowrap gap-4 md:gap-6 overflow-x-auto px-4 sm:px-6 pb-10 pt-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth max-w-7xl mx-auto ${
              showArrows ? 'md:justify-start' : 'md:justify-center'
            }`}
          >
            {activeProducts.map((product) => (
              <CollectionProductCard
                key={product.id}
                product={product}
                onQuickView={openQuickView}
                size={cardSize}
              />
            ))}
          </div>

          {showArrows && (
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-2 md:-right-4 lg:-right-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 bg-white/95 backdrop-blur-sm text-[#1C221A] border border-[#D4D7C9] hover:bg-[#4A5D23] hover:text-white hover:border-[#4A5D23] shadow-md flex items-center justify-center rounded-full cursor-pointer transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </button>
          )}
        </div>

        <div className="flex justify-center mt-2">
          <a href="/shop" className="flex items-center gap-3 border-b border-[#4A5D23] pb-1.5 text-[#4A5D23] hover:text-[#C25934] hover:border-[#C25934] transition-all duration-300 group font-sans text-xs font-medium uppercase tracking-[0.2em] cursor-pointer">
            <span>View Full Collection</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </a>
        </div>
      </div>

      <CollectionQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={closeQuickView}
        size={quickViewSize}
      />
    </section>
  );
}
