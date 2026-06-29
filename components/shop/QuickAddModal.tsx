'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import type { CollectionProduct } from './ProductCard';

type SizeMode = 'preset' | 'number';

interface QuickAddModalProps {
  product: CollectionProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const [sizeMode, setSizeMode] = useState<SizeMode>('preset');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const addItem = useCartStore((state) => state.addItem);

  const allAvailableSizes = product?.sizes || [];
  const productStock = typeof product?.stock === 'string'
    ? JSON.parse(product.stock)
    : (product?.stock || {});

  const dbPresetSizes = allAvailableSizes.filter(size => isNaN(Number(size)));
  const dbNumericSizes = allAvailableSizes.filter(size => !isNaN(Number(size)));
  
  const hasBothModes = dbPresetSizes.length > 0 && dbNumericSizes.length > 0;
  const activeSizes = sizeMode === 'preset' ? dbPresetSizes : dbNumericSizes;

  const maxStock = productStock[selectedSize] || 0;
  const isOutOfStock = maxStock === 0;

  useEffect(() => {
    if (isOpen && product) {
      const initialMode = dbPresetSizes.length > 0 ? 'preset' : 'number';
      setSizeMode(initialMode);
      const initialSizes = initialMode === 'preset' ? dbPresetSizes : dbNumericSizes;
      setSelectedSize(initialSizes[0] || '');
    }
  }, [isOpen, product, dbPresetSizes.length, dbNumericSizes.length]);

  if (!product || !isOpen) return null;

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedSize) return;

    const numericPrice = typeof product.price === 'number' 
      ? product.price 
      : Number(String(product.price).replace(/[^0-9.]/g, ''));

    // 🎯 ডাইনামিক প্রাইসিং ও ডিসকাউন্ট ক্যালকুলেশন
    const discountPercent = product.discount_percentage || 0;
    const discountedPrice = discountPercent > 0
      ? Math.round(numericPrice - (numericPrice * (discountPercent / 100)))
      : numericPrice;

    addItem({
      productId: String(product.id),
      productName: product.name,
      productType: 'readymade',
      image: product.images?.[0] || '',
      
      // 🎯 নতুন প্রাইসিং ফিল্ডগুলো
      originalUnitPrice: numericPrice,
      discountPercentage: discountPercent,
      unitPrice: discountedPrice,
      stitchingCharge: 0,
      
      sizeMode: sizeMode,
      sizeValue: selectedSize,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-[#111410]/50 backdrop-blur-sm transition-opacity">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-[400px] rounded-[24px] bg-[#F7F7F2] shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white hover:bg-accent rounded-full flex items-center justify-center text-[#1C221A]/70 shadow-sm transition-all cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="flex gap-4 mb-6">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-20 h-24 object-cover rounded-xl border border-[#D4D7C9]"
          />
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-[#17210C] line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <p className="font-sans text-sm text-[#C25934] mt-1">
              {product.price}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.15em] text-[#1C221A]">
              Select Size
            </span>
            {hasBothModes && (
              <div className="inline-flex rounded-full bg-[#EBECE3] p-1">
                <button
                  disabled={dbPresetSizes.length === 0}
                  onClick={() => { setSizeMode('preset'); setSelectedSize(dbPresetSizes[0] || ''); }}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-all cursor-pointer',
                    dbPresetSizes.length === 0 && 'opacity-50 cursor-not-allowed',
                    sizeMode === 'preset' ? 'bg-white text-[#4A5D23] shadow-sm' : 'text-[#1C221A]/70'
                  )}
                >
                  Preset
                </button>
                <button
                  disabled={dbNumericSizes.length === 0}
                  onClick={() => { setSizeMode('number'); setSelectedSize(dbNumericSizes[0] || ''); }}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-all cursor-pointer',
                    dbNumericSizes.length === 0 && 'opacity-50 cursor-not-allowed',
                    sizeMode === 'number' ? 'bg-white text-[#4A5D23] shadow-sm' : 'text-[#1C221A]/70'
                  )}
                >
                  Number
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {activeSizes.map((size) => {
              const isSelected = selectedSize === size;
              const stockForSize = productStock[size] || 0;
              const outOfStock = stockForSize === 0;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center text-xs font-sans font-medium rounded-lg border transition-all cursor-pointer',
                    outOfStock && !isSelected
                      ? 'border-[#D4D7C9]/50 bg-[#F8F9F5] text-[#1C221A]/30 line-through'
                      : isSelected
                        ? 'border-[#4A5D23] bg-[#4A5D23] text-white'
                        : 'border-[#D4D7C9] bg-white text-[#1C221A] hover:border-[#4A5D23]'
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
          
          {selectedSize && (
            <p className="mt-2 text-[10px] font-sans uppercase font-medium text-[#4A5D23]">
              {isOutOfStock ? <span className="text-red-500">Out of stock</span> : `${maxStock} items available in stock`}
            </p>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || !selectedSize}
          className={cn(
            'w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest transition-all',
            isOutOfStock || !selectedSize
              ? 'bg-[#EBECE3] text-[#1C221A]/40 cursor-not-allowed'
              : 'bg-[#4A5D23] text-white hover:bg-[#3D4C1D] shadow-md cursor-pointer active:scale-95'
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          {isOutOfStock ? 'Out of Stock' : 'Confirm & Add'}
        </button>
      </div>
    </div>
  );
}