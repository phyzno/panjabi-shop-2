"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, LayoutDashboard, ShoppingBag, Copy, Check } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "Unknown Order";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (orderId && orderId !== "Unknown Order") {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 select-none">
      <div className="bg-white max-w-lg w-full p-6 sm:p-8 md:p-12 rounded-[24px] sm:rounded-[32px] border border-[#D4D7C9]/40 shadow-xl shadow-[#4A5D23]/5 text-center animate-in zoom-in-95 fade-in duration-500">
        
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-[6px] border-green-100/50">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
        </div>
        <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-widest text-[#17210C] mb-3">
          Order Successful!
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#1C221A]/60 mb-8 leading-relaxed px-2 sm:px-4">
          Thank you for your purchase. We have received your order and our team will begin processing it right away.
        </p>
        <div 
          onClick={handleCopy}
          className="group bg-[#F8F9F5] hover:bg-[#EBECE3] border border-[#D4D7C9]/50 rounded-2xl p-4 sm:p-5 mb-8 sm:mb-10 relative overflow-hidden cursor-pointer transition-colors"
          title="Click to copy Order ID"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-[#4A5D23]"></div>
          <p className="font-sans text-[10px] sm:text-[11px] text-[#1C221A]/50 uppercase tracking-widest mb-1.5 font-medium">
            Your Order ID
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-[#4A5D23]">
              {orderId}
            </p>
            <div className="text-[#1C221A]/40 group-hover:text-[#4A5D23] transition-colors">
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </div>
          </div>
          {copied && (
            <p className="absolute bottom-1 right-2 text-[9px] text-green-600 font-sans uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
              Copied!
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href={`/track-order?id=${orderId}`}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4A5D23] text-white py-3.5 sm:py-4 px-6 rounded-full font-sans text-xs uppercase tracking-[0.15em] hover:bg-[#3D4C1D] transition-all shadow-[0_8px_25px_rgba(74,93,35,0.25)] active:scale-[0.98]"
          >
            <Package className="w-4 h-4" />
            Track Order
          </Link>
          
          <Link
            href="/dashboard/orders"
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-[#D4D7C9]/60 text-[#17210C] py-3.5 sm:py-4 px-6 rounded-full font-sans text-xs uppercase tracking-[0.15em] hover:border-[#4A5D23] hover:text-[#4A5D23] transition-all active:scale-[0.98]"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t border-[#D4D7C9]/40">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-sans text-[11px] sm:text-xs uppercase tracking-widest text-[#1C221A]/50 hover:text-[#C25934] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
export default function OrderSuccessPage() {
  useEffect(() => {
    document.title = 'Order Successful | Panjabi Shop';
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-sans text-sm text-[#4A5D23] uppercase tracking-widest">Loading Details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
