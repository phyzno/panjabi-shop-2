"use client";

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  useEffect(() => {
    document.title = 'Cart | Panjabi Shop';
  }, []);

  const { items, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const delivery = subtotal > 2000 ? 0 : 60;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-8">
          <span className="text-6xl">🛒</span>
        </div>
        <h1 className="font-heading text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/shop" className="bg-primary hover:bg-[#8B2222] text-white px-8 py-3 rounded-lg font-medium transition-colors">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-4xl font-bold mb-10">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* LEFT: Cart Items */}
        <div className="lg:w-[65%] space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-white border border-border rounded-2xl shadow-sm">
              <div className="w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-[#F5F0EA] relative shrink-0">
                <Image src={item.previewDataUrl || '/assets/customizable-punjabi.png'} alt={item.productName} fill className="object-contain" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading text-xl font-bold">{item.productName}</h3>
                  <p className="font-bold text-lg">৳{item.total}</p>
                </div>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  {item.colorName} · {item.fabricName} · {item.collarStyle} · 
                  Size: {(item.sizeType === 'preset' || item.sizeType === 'standard') ? item.standardSize : 'Custom'}
                </p>
                
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                  <Link href={`/customize/${item.productId}`} className="text-sm font-medium text-primary hover:underline">
                    Edit Configuration
                  </Link>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:w-[35%]">
          <div className="bg-white border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="font-heading text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>{delivery === 0 ? <span className="text-green-600 font-medium">Free</span> : `৳${delivery}`}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="font-heading text-3xl font-bold text-primary">৳{total}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
              <p className="font-bold mb-1">Advance payment (30%): ৳{Math.round(total * 0.3)}</p>
              <p className="opacity-80">Remaining ৳{total - Math.round(total * 0.3)} paid on delivery</p>
            </div>

            <Link href="/checkout" className="block w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#1A1A1A] font-bold text-center py-4 rounded-xl shadow-md hover:scale-[1.02] transition-transform">
              Proceed to Checkout →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
