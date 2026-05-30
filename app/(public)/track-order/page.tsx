"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle2, Clock, XCircle, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { getOrderById } from '@/lib/actions/order.actions';
import OrderDetailsModal from '@/components/dashboard/OrderDetailsModal';
import PrintableInvoice from '@/components/admin/dashboard/PrintableInvoice'; // 👈 প্রিন্টেবল ইনভয়েস ইমপোর্ট করা হলো

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [orderId, setOrderId] = useState(initialId);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 👈 প্রিন্টের জন্য নতুন স্টেট
  const [printingOrder, setPrintingOrder] = useState<any>(null);

  useEffect(() => {
    if (initialId) {
      handleTrackOrder(initialId);
    }
  }, [initialId]);

  // 👈 প্রিন্ট ট্রিগার এবং ডায়নামিক টাইটেল ক্লিনআপ লজিক
  useEffect(() => {
    // ওয়েবসাইটের আসল টাইটেলটি সেভ করে রাখা হচ্ছে
    let originalTitle = document.title;

    if (printingOrder) {
      // প্রিন্ট হওয়ার ঠিক আগে টাইটেল চেঞ্জ করে অর্ডার আইডি বসানো হচ্ছে
      document.title = `invoice-${printingOrder.id}`;
      
      setTimeout(() => {
        window.print();
      }, 150);
    }

    const handleAfterPrint = () => {
      // প্রিন্ট শেষে আবার আগের টাইটেল ফিরিয়ে আনা হচ্ছে এবং স্টেট ক্লিয়ার করা হচ্ছে
      document.title = originalTitle;
      setPrintingOrder(null);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      // কম্পোনেন্ট আনমাউন্ট হলে ক্লিনআপ
      document.title = originalTitle;
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printingOrder]);

  const handleTrackOrder = async (idToSearch: string) => {
    if (!idToSearch.trim()) {
      setError("Please enter a valid order number.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setOrderData(null);

    const res = await getOrderById(idToSearch.trim());
    
    if (res.success && res.data) {
      setOrderData(res.data);
    } else {
      setError("We couldn't find any order with this ID. Please check and try again.");
    }
    setIsLoading(false);
  };

  // 👈 মডালের প্রিন্ট বাটনে ক্লিক করলে যা হবে
  const handlePrint = () => {
    setIsModalOpen(false); // মডাল ক্লোজ করে দেবে
    setPrintingOrder(orderData); // প্রিন্টারের জন্য ডেটা সেট করবে
  };

  const statusSteps = ["pending", "processing", "shipped", "delivered"];
  const currentStepIndex = orderData ? statusSteps.indexOf(orderData.orderStatus) : -1;
  const isCanceledOrReturned = orderData && ["canceled", "returned"].includes(orderData.orderStatus);

  return (
    <>
      {/* 👈 প্রিন্ট হওয়ার সময় মূল পেজটি হাইড রাখার জন্য `print:hidden` কন্ডিশন যোগ করা হলো */}
      <div className={`min-h-screen bg-[#F8F9F5] pt-12 sm:pt-16 pb-16 sm:pb-20 select-none ${printingOrder ? 'print:hidden' : ''}`}>
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#4A5D23]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-[#4A5D23]/20">
              <Package className="w-7 h-7 sm:w-8 sm:h-8 text-[#4A5D23]" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-widest text-[#17210C] mb-2 sm:mb-3">
              Track Your Order
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#1C221A]/60 max-w-sm mx-auto leading-relaxed px-2 sm:px-0">
              Enter your order number below to see the real-time status of your tailored items.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="bg-white p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] shadow-xl shadow-[#4A5D23]/5 border border-[#D4D7C9]/50 mb-6 sm:mb-8 relative z-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1C221A]/40" />
                <input 
                  type="text" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder(orderId)}
                  placeholder="e.g. ORD-20260525-XYZ" 
                  className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-mono text-xs sm:text-sm transition-all"
                />
              </div>
              <button 
                onClick={() => handleTrackOrder(orderId)}
                disabled={isLoading}
                className="w-full sm:w-auto bg-[#4A5D23] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-[0_8px_20px_rgba(74,93,35,0.2)] hover:bg-[#3D4C1D] transition-all font-sans text-[12px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Now"}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start sm:items-center gap-2 text-red-600 text-[11px] sm:text-xs font-sans animate-in slide-in-from-top-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Status Display Area */}
          {orderData && !isLoading && (
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[24px] border border-[#D4D7C9]/50 shadow-sm animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-[#D4D7C9]/40">
                <div>
                  <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-[#1C221A]/50 mb-1">Order Details</p>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-[#17210C]">{orderData.id}</h3>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-[#1C221A]/50 mb-1">Amount</p>
                  <p className="font-sans text-base sm:text-lg text-[#C25934]">৳ {orderData.grandTotal.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Timeline UI */}
              {!isCanceledOrReturned ? (
                <div className="relative mb-8 sm:mb-10">
                  {/* Connecting Line */}
                  <div className="absolute top-4 sm:top-5 left-[12%] right-[12%] sm:left-[10%] sm:right-[10%] h-[2px] bg-[#EBECE3] -z-10">
                    <div 
                      className="h-full bg-[#4A5D23] transition-all duration-1000 ease-out" 
                      style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  {/* Step Indicators */}
                  <div className="flex justify-between relative z-10">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      
                      return (
                        <div key={step} className="flex flex-col items-center w-1/4">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-[3px] sm:border-4 transition-all duration-500 ${isCompleted ? "bg-[#4A5D23] border-[#E6E8DF] text-white shadow-md scale-110" : "bg-[#F8F9F5] border-[#EBECE3] text-[#1C221A]/30"}`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </div>
                          <p className={`mt-2 sm:mt-3 font-sans text-[8px] sm:text-[11px] uppercase tracking-widest text-center ${isCurrent ? "text-[#4A5D23]" : isCompleted ? "text-[#17210C]" : "text-[#1C221A]/40"}`}>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Canceled / Returned State */
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 sm:p-5 text-center mb-6 sm:mb-8">
                  <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mx-auto mb-2" />
                  <h3 className="font-heading font-bold text-red-700 uppercase tracking-wider text-xs sm:text-sm mb-1">
                    Order {orderData.orderStatus}
                  </h3>
                  <p className="font-sans text-[11px] sm:text-xs text-red-600/80 px-2">
                    This order has been {orderData.orderStatus}. Please contact support if you have any questions.
                  </p>
                </div>
              )}

              {/* View Full Details Button */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 sm:py-4 rounded-xl border-2 border-[#D4D7C9]/60 text-[#17210C] font-sans text-[11px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-[#4A5D23] hover:text-[#4A5D23] hover:bg-[#F8F9F5] transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" /> View Full Order Details
              </button>
            </div>
          )}

          {/* Back Link */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link href="/shop" className="inline-flex items-center gap-2 font-sans text-[11px] sm:text-xs uppercase tracking-widest text-[#1C221A]/50 hover:text-[#4A5D23] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Continue Shopping
            </Link>
          </div>

        </div>

        {/* Reuse Admin's Order Details Modal */}
        {orderData && (
          <OrderDetailsModal 
            order={orderData} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onPrint={handlePrint} // 👈 এখন এটি সঠিক ফাংশন কল করবে
          />
        )}
      </div>

      {/* 👈 Printable Invoice Component rendering (শুধুমাত্র যখন প্রিন্ট বাটনে ক্লিক করা হবে) */}
      {printingOrder && (
        <div className="hidden print:block w-full bg-white absolute top-0 left-0 z-50">
          <PrintableInvoice order={printingOrder} />
        </div>
      )}
    </>
  );
}

// Next.js SearchParams requires Suspense wrapper
export default function TrackOrderPage() {
  useEffect(() => {
    document.title = 'Track Order | Panjabi Shop';
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9F5] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#4A5D23] animate-spin" />
        <p className="font-sans text-[11px] sm:text-xs uppercase tracking-widest text-[#4A5D23]">Loading Tracker...</p>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
