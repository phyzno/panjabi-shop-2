"use client";

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { CollectionProductCard, type CollectionProduct } from '@/components/shop/ProductCard';
import { CollectionQuickViewModal } from '@/components/shop/QuickViewModal';

const presetSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const numericSizes = ['38', '40', '42', '44', '46', '48'];

type SizeMode = 'preset' | 'number';

const productCardSize = {
  categoryBadgeClassName: 'bg-white font-medium',
  buttonClassName: 'bg-white hover:bg-[#4A5D23] border-[1px] border-[#4A5D23] text-[#4A5D23] hover:text-white text-[8px] md:text-[11px] rounded-[16px]'
};

const quickViewSize = {
  primaryButtonClassName: 'bg-[#4A5D23] hover:bg-[#3D4C1D]',
  secondaryButtonClassName: 'hover:border-[#1C221A]',
};

interface ShopClientProps {
  initialProducts: CollectionProduct[];
  initialCategories: string[];
}

export default function ShopPage({ initialProducts, initialCategories }: ShopClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeMode, setSizeMode] = useState<SizeMode>('preset');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<CollectionProduct | null>(null);

  const shopProducts = useMemo<CollectionProduct[]>(() => initialProducts, [initialProducts]);
  const availableSizes = sizeMode === 'preset' ? presetSizes : numericSizes;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSizeMode('preset');
    setPriceRange([0, 30000]);
  };

  const openQuickView = (product: CollectionProduct) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const filteredProducts = useMemo(() => {
    let result = [...shopProducts];

    if (searchQuery) {
      result = result.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category));
    }

    if (selectedSizes.length > 0) {
      result = result.filter((product) =>
        product.images.some((image) => image.includes('')),
      );
    }

    result = result.filter((product) => {
      const numericPrice = Number(product.price.replace(/[^0-9.]/g, ''));
      return numericPrice >= priceRange[0] && numericPrice <= priceRange[1];
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Number(a.price.replace(/[^0-9.]/g, '')) - Number(b.price.replace(/[^0-9.]/g, '')));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price.replace(/[^0-9.]/g, '')) - Number(a.price.replace(/[^0-9.]/g, '')));
        break;
      case 'newest':
      default:
        result.sort((a, b) => a.id.localeCompare(b.id));
    }

    return result;
  }, [priceRange, searchQuery, selectedCategories, selectedSizes, shopProducts, sortBy]);

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileFilterOpen]);

  const renderFilterContent = () => (
    <div className="flex flex-col space-y-8">
      <div>
        <h3 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C] mb-4 border-b border-[#D4D7C9]/40 pb-2">
          Categories
        </h3>
        <div className="flex flex-col space-y-3">
          {initialCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4 border border-[#D4D7C9] rounded-sm bg-white transition-colors group-hover:border-[#4A5D23]">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="peer absolute opacity-0 w-full h-full cursor-pointer"
                />
                <div className="w-2.5 h-2.5 bg-[#4A5D23] rounded-[1px] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <span className="font-sans text-[13px] text-[#1C221A]/80 uppercase tracking-wide group-hover:text-[#4A5D23] transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C] mb-4 border-b border-[#D4D7C9]/40 pb-2">
          Price : ৳ {priceRange[0].toLocaleString()} - ৳ {priceRange[1].toLocaleString()}
        </h3>
        <div
          className="relative w-full h-1.5 bg-[#D4D7C9] rounded-lg mt-2 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const value = percent * 30000;
            const snappedValue = Math.round(value / 500) * 500;

            if (Math.abs(snappedValue - priceRange[0]) < Math.abs(snappedValue - priceRange[1])) {
              setPriceRange([Math.min(snappedValue, priceRange[1] - 500), priceRange[1]]);
            } else {
              setPriceRange([priceRange[0], Math.max(snappedValue, priceRange[0] + 500)]);
            }
          }}
        >
          <div
            className="absolute h-full bg-[#4A5D23] rounded-lg pointer-events-none"
            style={{
              left: `${(priceRange[0] / 30000) * 100}%`,
              right: `${100 - (priceRange[1] / 30000) * 100}%`
            }}
          />
          <input
            type="range"
            min="0"
            max="30000"
            step="500"
            value={priceRange[0]}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), priceRange[1] - 500);
              setPriceRange([val, priceRange[1]]);
            }}
            className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#4A5D23] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_5px_rgba(0,0,0,0.2)]"
          />
          <input
            type="range"
            min="0"
            max="30000"
            step="500"
            value={priceRange[1]}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), priceRange[0] + 500);
              setPriceRange([priceRange[0], val]);
            }}
            className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#4A5D23] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_5px_rgba(0,0,0,0.2)]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 border-b border-[#D4D7C9]/40 pb-2">
          <h3 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] text-[#17210C]">
            Sizes
          </h3>
          <div className="inline-flex rounded-full bg-[#EBECE3] p-0.5">
            <button
              type="button"
              onClick={() => {
                setSizeMode('preset');
                setSelectedSizes([]);
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer ${sizeMode === 'preset'
                  ? 'bg-white text-[#4A5D23] shadow-sm'
                  : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                }`}
            >
              Preset
            </button>
            <button
              type="button"
              onClick={() => {
                setSizeMode('number');
                setSelectedSizes([]);
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] transition-all cursor-pointer ${sizeMode === 'number'
                  ? 'bg-white text-[#4A5D23] shadow-sm'
                  : 'text-[#1C221A]/70 hover:text-[#1C221A]'
                }`}
            >
              Number
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-10 h-10 flex items-center justify-center border text-[12px] font-sans font-medium uppercase transition-all duration-300 cursor-pointer ${selectedSizes.includes(size)
                  ? 'border-[#4A5D23] bg-[#4A5D23] text-white'
                  : 'border-[#D4D7C9] bg-white text-[#1C221A] hover:border-[#4A5D23] hover:text-[#4A5D23]'
                }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="pt-10">
          <button
            type="button"
            onClick={resetFilters}
            className="w-full border border-[#4A5D23] text-white py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors bg-primary hover:bg-primary/80 hover:text-white rounded-md cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F9F5] min-h-screen pb-20">
      <div className="pt-28 pb-12 bg-[#111410] text-center border-b border-[#D4D7C9]/10">
        <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-[0.15em] text-[#F8F9F5] mb-3">
          The Collection
        </h1>
        <p className="font-sans text-[11px] md:text-[13px] uppercase tracking-[0.2em] text-[#E1E4D9]/70">
          Discover our ready-to-wear masterpieces
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-10 relative">
          <aside className="hidden lg:block w-[260px] shrink-0 h-fit sticky top-24 self-start">
            {renderFilterContent()}
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="sticky top-16 z-30 bg-[#F8F9F5]/90 backdrop-blur-md py-4 border-b border-[#D4D7C9]/50 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-[#D4D7C9] text-[#17210C] text-xs font-sans font-medium uppercase tracking-widest hover:border-[#4A5D23] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <span className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1C221A]/60">
                  {filteredProducts.length} Products
                </span>
              </div>

              <div className="flex items-center w-full sm:w-auto gap-4">
                <div className="relative w-full sm:w-[220px]">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full bg-white border border-[#D4D7C9] px-4 py-2 pl-10 text-sm font-sans focus:outline-none focus:border-[#4A5D23] transition-colors placeholder:text-[#1C221A]/40"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/40 stroke-[1.5]" />
                </div>
                <div className="relative shrink-0">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="appearance-none bg-white border border-[#D4D7C9] px-4 py-2 pr-10 text-xs font-sans font-medium uppercase tracking-widest text-[#17210C] focus:outline-none focus:border-[#4A5D23] cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low - High</option>
                    <option value="price-high">Price: High - Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#17210C] pointer-events-none stroke-[1.5]" />
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
                {filteredProducts.map((product) => (
                  <CollectionProductCard
                    key={product.id}
                    product={product}
                    onQuickView={openQuickView}
                    className="w-full"
                    size={productCardSize}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-12 h-12 text-[#D4D7C9] mb-4" />
                <h3 className="font-heading text-xl font-bold uppercase tracking-[0.1em] text-[#17210C] mb-2">
                  No products found
                </h3>
                <p className="font-sans text-sm text-[#1C221A]/60">
                  Try adjusting your filters or search query.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                    setSelectedSizes([]);
                    setPriceRange([0, 30000]);
                  }}
                  className="mt-6 border-b border-[#4A5D23] text-[#4A5D23] pb-1 font-sans text-xs uppercase tracking-widest font-medium hover:text-[#C25934] hover:border-[#C25934] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-[#111410]/50 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${isMobileFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={() => setIsMobileFilterOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[85vw] sm:w-[350px] bg-[#F8F9F5] z-[110] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden flex flex-col ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4D7C9]/40 bg-white shrink-0">
          <span className="font-heading text-lg font-bold uppercase tracking-[0.15em] text-[#17210C]">
            Filters
          </span>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-2 -mr-2 text-[#1C221A]/60 hover:text-[#C25934] transition-colors"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {renderFilterContent()}
        </div>
        <div className="p-6 bg-white border-t border-[#D4D7C9]/40 shrink-0">
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full bg-[#4A5D23] text-white py-3.5 text-xs font-medium uppercase tracking-[0.2em] rounded-sm shadow-[0_8px_20px_rgba(74,93,35,0.2)] hover:bg-[#3D4C1D] transition-colors"
          >
            Show {filteredProducts.length} Results
          </button>
        </div>
      </div>

      <CollectionQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={closeQuickView}
        size={quickViewSize}
      />
    </div>
  );
}