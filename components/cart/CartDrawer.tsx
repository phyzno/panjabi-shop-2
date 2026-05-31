"use client";

import React, { useEffect, useState } from "react";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { initCartCrossTabSync, useCartStore } from "@/store/cartStore";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initCartCrossTabSync();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const subTotal = getSubTotal();

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-[#111410]/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        onClick={closeCart}
      />

      <div
        className={`fixed z-[110] bg-[#F8F9F5] shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          /* Size and default Mobile position (Bottom) */
          w-full h-[85vh] bottom-0 left-0 rounded-t-[32px]
          /* Desktop position (Right Side) - md:left-auto is crucial here! */
          md:w-[420px] md:h-screen md:top-0 md:bottom-auto md:left-auto md:right-0 md:rounded-none
          /* Open/Close Animation State */
          ${isOpen
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
          }
        `}
      >
        <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
          <div className="w-12 h-1.5 bg-[#D4D7C9] rounded-full opacity-50" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 md:py-6 border-b border-[#D4D7C9]/40 bg-white/50 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#4A5D23]" />
            <h2 className="font-heading text-lg md:text-xl font-bold uppercase tracking-widest text-[#17210C]">
              Your Cart
            </h2>
            <span className="bg-[#4A5D23]/10 text-[#4A5D23] font-sans text-[12px] px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-[#1C221A]/50 hover:text-[#C25934] hover:bg-[#C25934]/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-[#EBECE3] rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-8 h-8 text-[#1C221A]/30" />
              </div>
              <p className="font-heading text-lg font-bold uppercase tracking-wider text-[#17210C]">
                Your cart is empty
              </p>
              <p className="font-sans text-sm text-[#1C221A]/60 pb-4">
                Looks like you haven&apos;t added any items yet.
              </p>
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-2 rounded-full border border-[#4A5D23] px-6 py-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white transition-all cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 bg-white p-3 md:p-4 rounded-2xl border border-[#D4D7C9]/40 shadow-sm">
                  <div className="w-20 h-24 md:w-24 md:h-28 bg-[#EBECE3] rounded-xl overflow-hidden shrink-0 border border-[#D4D7C9]/30">
                    <img src={item.image || '/placeholder-image.jpg'} alt={item.productName} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-heading text-[13px] md:text-sm font-bold uppercase tracking-wide text-[#17210C] truncate">
                          {item.productName}
                        </h3>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-[#1C221A]/40 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.productType === 'readymade' && (
                        <p className="font-sans text-[10px] md:text-[11px] text-[#4A5D23] font-medium uppercase tracking-widest mt-1">
                          Size: {item.sizeValue}
                        </p>
                      )}

                      {item.productType === 'custom_fabric_only' && (
                        <p className="font-sans text-[10px] md:text-[11px] text-[#4A5D23] font-medium uppercase tracking-widest mt-1">
                          Required: {item.yardage} Yards (Fabric Only)
                        </p>
                      )}

                      {item.productType === 'custom_tailored' && (
                        <>
                          <p className="font-sans text-[10px] md:text-[11px] text-[#4A5D23] font-medium uppercase tracking-widest mt-1">
                            Size: {item.sizeValue || 'Custom'} ({item.yardage} Yards Fabric)
                          </p>

                          {item.collarType && (
                            <p className="font-sans text-[11px] text-[#1C221A]/70 mt-0.5 flex items-center gap-1">
                              <span className="font-medium text-[#4A5D23]">Collar:</span> {item.collarType}
                            </p>
                          )}

                          {item.customMeasurements && (
                            <div className="text-[10px] text-[#1C221A]/50 font-sans mt-1 bg-[#F8F9F5] p-1.5 rounded-md border border-[#D4D7C9]/20 grid grid-cols-2 gap-x-2">
                              <span>L: {item.customMeasurements.length}&quot;</span>
                              <span>C: {item.customMeasurements.chest}&quot;</span>
                              <span>Sh: {item.customMeasurements.shoulder}&quot;</span>
                              <span>Sl: {item.customMeasurements.sleeve}&quot;</span>
                            </div>
                          )}
                        </>
                      )}

                      {item.fabricName && item.productType !== 'custom_fabric_only' && (
                        <p className="font-sans text-[11px] text-[#1C221A]/70 mt-0.5 flex items-center gap-1">
                          <span className="font-medium text-[#4A5D23]">Fabric:</span> {item.fabricName}
                        </p>
                      )}

                      {item.stitchingCharge > 0 && item.productType === 'custom_tailored' && (
                        <p className="font-sans text-[11px] text-[#1C221A]/70 mt-1 flex items-center justify-between bg-[#F8F9F5] p-1.5 rounded-md border border-[#D4D7C9]/20">
                          <span className="font-medium text-[#4A5D23]">Stitching Charge:</span>
                          <span>৳ {item.stitchingCharge.toLocaleString('en-IN')}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center border border-[#D4D7C9] rounded-lg bg-[#F8F9F5]">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-2.5 py-1 text-[#1C221A]/60 hover:text-[#17210C] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-sans text-xs font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-2.5 py-1 text-[#1C221A]/60 hover:text-[#17210C] cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-sans text-[14px] md:text-sm text-[#C25934]">
                        ৳ {(item.totalPrice ?? 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#D4D7C9]/60 bg-white p-6 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-sans text-sm uppercase tracking-widest text-[#1C221A]/70">
                Subtotal
              </span>
              <span className="font-heading text-xl font-bold text-[#17210C]">
                ৳ {(subTotal ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="font-sans text-[10px] text-[#1C221A]/50 text-center mb-4 uppercase tracking-wider">
              Shipping & taxes calculated at checkout
            </p>
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#4A5D23] py-4 font-sans text-sm uppercase tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(74,93,35,0.2)] hover:bg-[#3D4C1D] active:scale-[0.98] transition-all cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
