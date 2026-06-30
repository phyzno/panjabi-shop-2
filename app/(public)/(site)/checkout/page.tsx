"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, CreditCard, ShieldCheck, Loader2, Wallet, User } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/actions/checkout.actions";
import { useAuthStore } from "@/store/authStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubTotal, getTotalSavings, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const toggleNote = (cartItemId: string) => {
    setExpandedNotes(prev => ({ ...prev, [cartItemId]: !prev[cartItemId] }));
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    deliveryLocation: "inside_dhaka",
    paymentMethod: "cod",
  });

  useEffect(() => {
    document.title = 'Checkout | Panjabi Shop';
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || prev.name,
        phone: user.user_metadata?.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-[#EBECE3] rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-[#1C221A]/30" />
        </div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-[#17210C] mb-2">
          Your Cart is Empty
        </h1>
        <p className="font-sans text-sm text-[#1C221A]/60 mb-6">
          You need to add products to your cart before checking out.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="rounded-full bg-[#4A5D23] px-6 py-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const deliveryCharge = formData.deliveryLocation === "inside_dhaka" ? 60 : 120;
  const subTotal = getSubTotal();
  const totalSavings = getTotalSavings();
  const discount = 0;
  const grandTotal = subTotal + deliveryCharge - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setDeliveryLocation = (location: string) => {
    setFormData((prev) => ({ ...prev, deliveryLocation: location }));
  };

  const formatText = (text?: string) => {
    if (!text) return '';
    return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.name || !formData.phone || !formData.address) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      userId: user?.id || null,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      deliveryCharge,
      discount,
      paymentMethod: formData.paymentMethod as "cod" | "online",
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productType: item.productType,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        originalUnitPrice: item.originalUnitPrice,
        stitchingCharge: item.stitchingCharge || 0,
        totalPrice: item.totalPrice,
        sizeMode: item.sizeMode || null,
        sizeValue: item.sizeValue || null,
        fabricId: item.fabricId || null,
        fabricName: item.fabricName || null,
        yardage: item.yardage || null,
        customMeasurements: item.customMeasurements || null,
        productStyles: item.productStyles || null,
        tailoringDetails: item.tailoringDetails || null,
        specialInstructions: item.specialInstructions || null,
      })),
    };

    const result = await createOrder(payload);

    if (result.success) {
      clearCart();
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F9F5] min-h-screen pt-15 md:pt-24 pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#17210C] mb-10 border-b border-[#D4D7C9]/40 pb-4">
          Checkout Process
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-[#D4D7C9]/40 shadow-sm space-y-8">
            <div>
              <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#17210C] flex items-center gap-2 mb-6">
                <Truck className="w-5 h-5 text-[#4A5D23]" /> Delivery Details
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-sans mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-5 font-sans text-xs">

                {!user && (
                  <div className="mb-6 bg-[#F8F9F5] border border-[#D4D7C9] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#D4D7C9] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <User className="w-4 h-4 text-[#4A5D23]" />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-bold text-[#17210C]">Checking out as a Guest</p>
                        <p className="font-sans text-[11px] text-[#1C221A]/60 mt-0.5 leading-relaxed">
                          To save this order to your profile and track easily, log in before placing the order.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/login?redirect=/checkout"
                      className="shrink-0 flex items-center justify-center px-5 py-2.5 bg-white border-2 border-[#D4D7C9]/60 text-[#17210C] text-[12px] uppercase tracking-widest rounded-lg hover:border-[#4A5D23] hover:text-[#4A5D23] transition-colors"
                    >
                      Log In Now
                    </Link>
                  </div>
                )}

                <div>
                  <label className="block uppercase tracking-wider text-[#1C221A]/70 font-medium mb-3">Shipping Area *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation("inside_dhaka")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${formData.deliveryLocation === "inside_dhaka"
                        ? "border-[#4A5D23] bg-[#F8F9F5] shadow-sm"
                        : "border-[#D4D7C9]/50 bg-white hover:border-[#4A5D23]/40"
                        }`}
                    >
                      <span className="font-heading font-extrabold uppercase tracking-widest text-[#17210C] mb-1 text-[13px]">
                        Inside Dhaka
                      </span>
                      <span className="font-sans text-[11px] text-[#1C221A]/70 font-medium">
                        ৳ 60 | 2-3 Days
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryLocation("outside_dhaka")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${formData.deliveryLocation === "outside_dhaka"
                        ? "border-[#4A5D23] bg-[#F8F9F5] shadow-sm"
                        : "border-[#D4D7C9]/50 bg-white hover:border-[#4A5D23]/40"
                        }`}
                    >
                      <span className="font-heading font-extrabold uppercase tracking-widest text-[#17210C] mb-1 text-[13px]">
                        Outside Dhaka
                      </span>
                      <span className="font-sans text-[11px] text-[#1C221A]/70 font-medium">
                        ৳ 120 | 3-5 Days
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#1C221A]/70 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A5D23] transition-colors"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#1C221A]/70 font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 01XXXXXXXXX"
                    className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A5D23] transition-colors"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#1C221A]/70 font-medium mb-2">Full Shipping Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="House no, Road no, Area, City..."
                    className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-3 rounded-xl focus:outline-none focus:border-[#4A5D23] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#D4D7C9]/40">
              <label className="block uppercase tracking-wider text-[#1C221A]/70 font-medium mb-4 text-xs">
                Select Payment Method *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#4A5D23] bg-[#F8F9F5] shadow-sm relative overflow-hidden">
                  <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center border border-[#D4D7C9]/60">
                    <Truck className="w-5 h-5 text-[#4A5D23]" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-heading font-extrabold uppercase tracking-widest text-[#17210C] text-[12px] mb-0.5">
                      Cash on Delivery
                    </span>
                    <span className="block font-sans text-[10px] text-[#1C221A]/60">
                      Ponno hate peye taka porishodh
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 w-3 h-3 bg-[#4A5D23] rounded-full border-2 border-white shadow-sm"></div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#D4D7C9]/40 bg-white opacity-60 cursor-not-allowed">
                  <div className="w-10 h-10 shrink-0 bg-[#F8F9F5] rounded-full flex items-center justify-center border border-[#D4D7C9]/40">
                    <Wallet className="w-5 h-5 text-[#1C221A]/40" />
                  </div>
                  <div>
                    <span className="block font-heading font-extrabold uppercase tracking-widest text-[#1C221A]/50 text-[12px] mb-0.5">
                      Digital Payment
                    </span>
                    <span className="block font-sans text-[10px] text-[#1C221A]/40">
                      bKash, Nagad (Coming Soon)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D4D7C9]/40 flex items-center gap-3 text-[#4A5D23] bg-[#F8F9F5]/50 p-4 rounded-xl">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p className="font-sans text-[11px] leading-relaxed text-[#1C221A]/60">
                Your data is secure. By placing the order you agree with our terms of service and tailoring conditions.
              </p>
            </div>
          </form>

          <div className="bg-white p-6 rounded-2xl border border-[#D4D7C9]/40 shadow-sm space-y-6 lg:sticky top-24">
            <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#17210C] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#4A5D23]" /> Order Summary
            </h2>

            <div className="divide-y divide-[#D4D7C9]/30 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-start py-3 gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading text-xs font-bold uppercase text-[#17210C] truncate">
                      {item.productName}
                    </h4>

                    <p className="font-sans text-[10px] text-[#1C221A]/50 uppercase tracking-wider mt-0.5">
                      Qty: {item.quantity} | {item.productType === 'custom_fabric_only' ? `Yards: ${item.yardage}` : `Size: ${item.sizeValue || "Custom"}`}
                    </p>

                    {item.productType === 'custom_tailored' && (
                      <div className="mt-2 space-y-2">

                        {item.fabricName && (
                          <p className="font-sans text-[10px] text-[#1C221A]/70 flex items-center gap-1 truncate">
                            <span className="font-medium text-[#4A5D23]">Fabric:</span> {item.fabricName}
                          </p>
                        )}

                        {/* 🎯 ১. ডাইনামিক বেসিক স্টাইলস */}
                        {item.productStyles && Object.keys(item.productStyles).length > 0 && (
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {Object.entries(item.productStyles).map(([key, val]) => (
                              <p key={key} className="font-sans text-[9px] text-[#1C221A]/70 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-[#D4D7C9]/40">
                                <span className="font-medium text-[#4A5D23]">{formatText(key)}:</span> {formatText(val as string)}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* 🎯 ২. ডাইনামিক অ্যাডভান্সড টেইলারিং ডিটেইলস */}
                        {item.tailoringDetails && Object.keys(item.tailoringDetails).length > 0 && (
                          <div className="flex flex-wrap gap-x-2 gap-y-1 p-1.5 bg-[#4A5D23]/5 rounded-md border border-[#4A5D23]/10">
                            <span className="w-full font-heading text-[8px] font-bold uppercase tracking-widest text-[#4A5D23]">Adv. Specs</span>
                            {Object.entries(item.tailoringDetails).map(([key, val]) => (
                              <p key={key} className="font-sans text-[9px] text-[#1C221A]/70 flex items-center gap-1">
                                <span className="font-medium text-[#4A5D23]">{formatText(key)}:</span> {formatText(val as string)}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* 🎯 ৩. ডাইনামিক মেজারমেন্টস */}
                        {item.customMeasurements && Object.keys(item.customMeasurements).length > 0 && (
                          <div className="text-[9px] text-[#1C221A]/60 font-sans bg-[#F8F9F5] p-1.5 rounded-md border border-[#D4D7C9]/40 flex flex-wrap gap-x-2 gap-y-1">
                            {Object.entries(item.customMeasurements).map(([key, val]) => (
                              <span key={key} className="flex items-center gap-0.5">
                                <span className="font-medium text-[#4A5D23] uppercase tracking-wider">{formatText(key)}:</span> {String(val)}&quot;
                              </span>
                            ))}
                          </div>
                        )}

                        {item.specialInstructions && (
                          <div className="mt-2 mb-2">
                            <button
                              onClick={() => toggleNote(item.cartItemId)}
                              type="button" // ⚠️ ফর্ম সাবমিট যেন না হয় তাই type="button" দেওয়া জরুরি
                              className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-[#C25934] hover:text-[#A04525] transition-colors cursor-pointer"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                              {expandedNotes[item.cartItemId] ? 'Hide Note' : 'View Note'}
                            </button>

                            {expandedNotes[item.cartItemId] && (
                              <div className="mt-2 p-2 bg-[#FFF9F5] rounded-md border border-[#C25934]/20 animate-in slide-in-from-top-2 duration-200">
                                <p className="font-sans text-[10px] text-[#1C221A]/80 leading-relaxed italic">
                                  "{item.specialInstructions}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {(item.stitchingCharge ?? 0) > 0 && (
                          <p className="font-sans text-[10px] text-[#1C221A]/70 mt-1 flex items-center justify-between bg-[#F8F9F5] p-1.5 rounded-md border border-[#D4D7C9]/30">
                            <span className="font-medium text-[#4A5D23]">Stitching Charge:</span>
                            <span>৳ {item.stitchingCharge?.toLocaleString('en-IN')}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0 mt-0.5">
                    <span className="block font-sans text-xs text-[#17210C] font-medium">
                      ৳ {item.totalPrice.toLocaleString("en-IN")}
                    </span>
                    {(item.discountPercentage ?? 0) > 0 && (
                      <span className="block font-sans text-[10px] text-[#1C221A]/40 line-through mt-0.5">
                        ৳ {(item.originalTotalPrice ?? 0).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#D4D7C9]/40 pt-4 space-y-3 font-sans text-xs text-[#1C221A]/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#17210C]">৳ {subTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between transition-all duration-300">
                <span>Delivery Charge</span>
                <span className="text-[#17210C]">৳ {deliveryCharge}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ৳ {discount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#D4D7C9]/40 pt-3 text-sm text-[#17210C] items-center">
                <span className="uppercase tracking-wider">Grand Total</span>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    {totalSavings > 0 && (
                      <span className="font-sans text-xs text-[#1C221A]/40 line-through font-normal">
                        ৳ {(subTotal + deliveryCharge).toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="text-[#C25934] text-base transition-all duration-300">
                      ৳ {grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#4A5D23]/10 text-[#4A5D23] rounded text-[9px] font-medium uppercase tracking-wider border border-[#4A5D23]/20">
                      Total Savings: ৳ {totalSavings.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-[#4A5D23] text-white hover:bg-[#3D4C1D] disabled:bg-[#EBECE3] disabled:text-[#1C221A]/40 rounded-full font-sans text-xs uppercase tracking-[0.2em] shadow-[0_12px_30px_rgba(74,93,35,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>Confirm & Place Order</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
