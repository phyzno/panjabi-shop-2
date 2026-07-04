'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer, MapPin, Package, Scissors, Phone, User } from 'lucide-react';

export default function OrderDetailsModal({ order, isOpen, onClose, onPrint }: { order: any, isOpen: boolean, onClose: () => void, onPrint: () => void }) {

  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const toggleNote = (itemId: string) => {
    setExpandedNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const formatText = (text?: string) => {
    if (!text) return '';
    return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const originalSubTotal = order.items?.reduce((acc: number, item: any) => {
    const originalUnit = item.originalUnitPrice || item.unitPrice || 0;
    const stitch = item.stitchingCharge || 0;
    return acc + ((originalUnit + stitch) * item.quantity);
  }, 0) || order.subTotal;

  const totalSavings = originalSubTotal > order.subTotal ? originalSubTotal - order.subTotal : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#F8F9F5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">

        <div className="relative px-4 sm:px-6 py-4 sm:py-5 bg-white border-b border-[#D4D7C9]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 print-hidden">

          <div className="pr-12 sm:pr-0">
            <h2 className="font-heading text-base sm:text-lg font-bold uppercase tracking-widest text-[#17210C]">
              Order Details
            </h2>
            <p className="font-sans text-[10px] sm:text-[11px] text-[#1C221A]/60 mt-0.5 tracking-wider">#{order.id}</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onPrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-primary border border-primary rounded-full text-[11px] sm:text-xs font-sans uppercase tracking-wider text-white hover:bg-[#4A5D23] hover:border-[#4A5D23] transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 sm:w-4 sm:h-4" /> Print Invoice
            </button>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:static p-2 bg-[#EBECE3] rounded-full text-accent hover:bg-red-50 transition-colors cursor-pointer shrink-0 shadow-sm sm:shadow-none"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 print-section bg-white">

          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b border-[#D4D7C9]/40 pb-6">
            <div>
              <p className="font-sans text-[11px] font-medium underline uppercase tracking-widest text-[#4A5D23] mb-3">Shipping To</p>
              <div className="space-y-2 font-sans">
                <h3 className="font-heading text-base font-bold text-[#17210C] uppercase flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4A5D23]/80" /> {order.customerName}
                </h3>
                <p className="text-xs text-[#1C221A]/80 flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#4A5D23]/60" />
                  <span className="max-w-[280px]">{order.customerAddress}</span>
                </p>
                <p className="text-xs text-[#1C221A]/80 flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0 text-[#4A5D23]/60" />
                  {order.customerPhone}
                </p>
              </div>
            </div>
            <div className="md:text-right mt-4 md:mt-0">
              <p className="font-sans text-[11px] font-medium underline uppercase tracking-widest text-[#4A5D23] mb-3">Order Info</p>
              <div className="space-y-1.5 font-sans text-xs text-[#1C221A]/70">
                <p>Date: <span className="text-[#17210C]">{order.date}</span></p>
                <p>Payment: <span className="uppercase text-[#17210C]">{order.paymentStatus}</span></p>
                <p>Status: <span className="uppercase text-[#17210C]">{order.orderStatus}</span></p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#17210C] mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#4A5D23]" /> Ordered Items
            </h3>

            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={item.id} className="p-4 md:p-5 rounded-2xl border border-[#D4D7C9]/50 bg-[#F8F9F5]/30">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 mb-2">
                        <h4 className="text-sm text-[#17210C] uppercase tracking-wide">
                          {idx + 1}.  {item.name}
                        </h4>
                        <span className="w-fit px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-widest bg-[#EBECE3] text-[#4A5D23]">
                          {item.productType.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {item.productType === 'custom_tailored' && (
                        <div className="mt-3 font-sans text-[13px] text-[#1C221A]/70">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-2">
                            {item.fabricName && <p><span className="text-[#17210C]">Fabric:</span> {item.fabricName}</p>}
                            {item.fabricYards && <p><span className="text-[#17210C]">Length:</span> {item.fabricYards} Yards</p>}
                          </div>

                          {/* 🎯 বেসিক স্টাইলস */}
                          {item.productStyles && Object.keys(item.productStyles).length > 0 && (
                            <div className="mb-4">
                              <p className="text-[9px] uppercase tracking-widest text-[#1C221A]/50 mb-2">Basic Styles</p>
                              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                {Object.entries(item.productStyles).map(([key, val]) => (
                                  <div key={key} className="px-3 py-2 bg-white rounded-lg border border-[#D4D7C9]/60 shadow-sm flex flex-col justify-center sm:min-w-[120px]">
                                    <span className="text-[9px] uppercase tracking-widest text-[#1C221A]/50 mb-0.5">{formatText(key)}</span>
                                    <span className="text-[12px] text-[#17210C] capitalize">{formatText(val as string)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 🎯 অ্যাডভান্সড স্পেকস */}
                          {item.tailoringDetails && Object.keys(item.tailoringDetails).length > 0 && (
                            <div className="mb-4 p-3.5 bg-[#4A5D23]/[0.03] rounded-xl border border-[#4A5D23]/10">
                              <p className="text-[9px] uppercase tracking-widest text-[#4A5D23]/70 mb-2.5 flex items-center gap-1.5">
                                Advanced Specs
                              </p>
                              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                {Object.entries(item.tailoringDetails).map(([key, val]) => (
                                  <div key={key} className="px-3 py-2 bg-white/80 rounded-lg border border-[#4A5D23]/15 flex flex-col justify-center sm:min-w-[120px]">
                                    <span className="text-[9px] uppercase tracking-widest text-[#4A5D23]/60 mb-0.5">{formatText(key)}</span>
                                    <span className="text-[12px] text-[#17210C] capitalize">{formatText(val as string)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 🎯 মেজারমেন্টস */}
                          {item.measurements ? (
                            <>
                              <p><span className="text-[#17210C]">Size:</span> Custom</p>
                              <div className="mt-2 mb-2 py-3 bg-white rounded-xl border border-[#D4D7C9]/40 shadow-sm w-fit">
                                <p className="px-4 text-[10px] font-medium uppercase tracking-widest mb-3 text-[#4A5D23] flex items-center gap-1.5">
                                  <Scissors className="w-3.5 h-3.5" /> Measurements
                                </p>
                                <div className={`grid grid-cols-3 ${Object.keys(item.measurements).length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-6'} gap-y-3 font-mono`}>
                                  {Object.entries(item.measurements).map(([key, val], i, arr) => (
                                    <div
                                      key={key}
                                      className={`flex flex-col items-center justify-center px-4 border-[#D4D7C9]/80 border-r [&:nth-child(3n)]:border-r-0 ${arr.length === 5
                                        ? 'md:border-r md:[&:nth-child(3n)]:border-r md:[&:nth-child(5n)]:border-r-0'
                                        : 'md:border-r md:[&:nth-child(3n)]:border-r md:[&:nth-child(6n)]:border-r-0'
                                        } [&:last-child]:border-r-0`}
                                    >
                                      <div className="text-[10px] text-[#1C221A]/60 capitalize mb-1 text-center leading-tight">
                                        {key.replace(/_/g, ' ')}
                                      </div>
                                      <div className="text-[#17210C] text-[13px]">{String(val)}"</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : item.sizeValue ? (
                            <p className="mb-2"><span className="text-[#17210C]">Size:</span> {item.sizeValue}</p>
                          ) : null}

                          {/* 🎯 মিনিমাল নোট ভিউ বাটন */}
                          {item.specialInstructions && (
                            <div className="mt-2 mb-2">
                              <button
                                onClick={() => toggleNote(item.id)}
                                className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-[#C25934] hover:text-[#A04525] transition-colors cursor-pointer"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                {expandedNotes[item.id] ? 'Hide Note' : 'View Note'}
                              </button>

                              {expandedNotes[item.id] && (
                                <div className="mt-2 p-3 bg-[#FFF9F5] rounded-lg border border-[#C25934]/20 animate-in slide-in-from-top-2 duration-200">
                                  <p className="font-sans text-[12px] text-[#1C221A]/80 leading-relaxed italic">
                                    "{item.specialInstructions}"
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {item.stitchingCharge > 0 && (
                            <p className="text-primary mt-2 font-medium">
                              + Stitching Charge: ৳ {item.stitchingCharge.toLocaleString()} × {item.quantity}
                            </p>
                          )}
                        </div>
                      )}

                      {item.productType !== 'custom_tailored' && item.sizeValue && (
                        <p className="font-sans text-[13px] text-[#1C221A]/70 mt-1.5"><span className="text-[#17210C]">Size:</span> {item.sizeValue}</p>
                      )}
                      {item.productType === 'custom_fabric_only' && item.fabricYards && (
                        <p className="font-sans text-[13px] text-[#1C221A]/70 mt-1.5"><span className="text-[#17210C]">Length:</span> {item.fabricYards} Yards</p>
                      )}
                    </div>

                    <div className="text-right font-sans shrink-0 mt-2 md:mt-0 border-t md:border-t-0 border-[#D4D7C9]/40 pt-3 md:pt-0">
                      {item.discountPercentage > 0 ? (
                        <div className="flex flex-col items-end">
                          {/* 🎯 ডিসকাউন্ট ব্যাজ */}
                          <span className="inline-block px-1.5 py-0.5 mb-1.5 text-[10px] uppercase tracking-widest text-[#C25934] bg-[#C25934]/10 rounded border border-[#C25934]/20">
                            {item.discountPercentage}% OFF
                          </span>

                          {/* 🎯 Qty × Unit Price (Original vs Discounted) */}
                          <p className="text-[12px] text-[#1C221A]/60 flex items-center justify-end gap-1.5">
                            Qty: {item.quantity} ×
                            <span className="line-through decoration-[#C25934]/40 text-[#1C221A]/40">
                              ৳{(item.originalUnitPrice || item.unitPrice).toLocaleString()}
                            </span>
                            <span className="font-medium text-[#17210C]">
                              ৳{item.unitPrice.toLocaleString()}
                            </span>
                          </p>

                          {/* 🎯 Total Price (Original vs Discounted) */}
                          <div className="flex items-baseline justify-end gap-2 mt-1">
                            <span className="text-[13px] text-[#1C221A]/40 line-through decoration-[#C25934]/40">
                              {/* অরিজিনাল টোটাল = (অরিজিনাল প্রাইস + স্টিচিং চার্জ) × পরিমাণ */}
                              ৳{(((item.originalUnitPrice || item.unitPrice) + (item.stitchingCharge || 0)) * item.quantity).toLocaleString()}
                            </span>
                            <span className="text-[15px] text-[#C25934]">
                              ৳{item.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-[11px] text-[#1C221A]/60">Qty: {item.quantity} × ৳ {item.unitPrice.toLocaleString()}</p>
                          <p className="text-[15px] text-[#17210C] mt-0.5 font-medium">৳ {item.totalPrice.toLocaleString()}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-[#D4D7C9]/40 font-sans">
  <div className="w-full md:w-1/2 lg:w-1/3 space-y-2.5 text-[13px] ">
    
    {/* 🎯 স্টাইল ১: টপ প্লেসমেন্ট ব্যাজ */}
    {totalSavings > 0 && (
      <div className="flex justify-end">
        <span className="inline-flex items-center px-2 py-0.5 bg-[#4A5D23]/10 text-[#4A5D23] rounded text-[10px] font-medium uppercase tracking-wider border border-[#4A5D23]/20">
          Total Savings: ৳ {totalSavings.toLocaleString()}
        </span>
      </div>
    )}

    <div className="flex justify-between items-center text-[#1C221A]/70">
      <span>Subtotal:</span>
      <div className="flex items-center gap-2">
        {totalSavings > 0 && (
          <span className="text-[12px] text-[#1C221A]/40 line-through">
            ৳ {originalSubTotal.toLocaleString()}
          </span>
        )}
        <span className="text-[#17210C]">৳ {order.subTotal.toLocaleString()}</span>
      </div>
    </div>

    <div className="flex justify-between text-[#1C221A]/70">
      <span>Delivery Charge:</span>
      <span>+ ৳ {order.deliveryCharge.toLocaleString()}</span>
    </div>
    
    {order.discount > 0 && (
      <div className="flex justify-between text-[#4A5D23]">
        <span>Discount:</span>
        <span>- ৳ {order.discount.toLocaleString()}</span>
      </div>
    )}
    
    <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#D4D7C9]/60">
      <span className="text-sm uppercase tracking-widest text-[#17210C]">Grand Total:</span>
      <span className="text-[18px] text-[#C25934]">৳ {order.grandTotal.toLocaleString()}</span>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}