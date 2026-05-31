'use client';

import React, { useEffect } from 'react';
import { X, Printer, MapPin, Package, Scissors, Phone, User } from 'lucide-react';

export default function OrderDetailsModal({ order, isOpen, onClose, onPrint }: { order: any, isOpen: boolean, onClose: () => void, onPrint: () => void }) {

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !order) return null;

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
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1 font-sans text-[13px] text-[#1C221A]/70">
                          {item.fabricName && <p><span className="text-[#17210C]">Fabric:</span> {item.fabricName}</p>}
                          {item.collarType && <p><span className="text-[#17210C]">Collar:</span> {item.collarType}</p>}
                          {item.fabricYards && <p><span className="text-[#17210C]">Fabric Length:</span> {item.fabricYards} Yards</p>}

                          {item.measurements ? (
                            <>
                              <p><span className="text-[#17210C]">Size:</span> Custom</p>
                              <div className="col-span-full mt-2 px-5 py-4 bg-white rounded-xl border border-[#D4D7C9]/40 shadow-sm w-fit justify-self-center sm:justify-self-start">
                                <p className="text-[10px] font-medium uppercase tracking-widest mb-1.5 text-[#4A5D23] flex items-center gap-1.5">
                                  <Scissors className="w-3.5 h-3.5" /> Tailoring Measurements
                                </p>
                                <div className="grid grid-cols-2 justify-items-start text-left w-fit mx-auto sm:mx-0 gap-x-8 gap-y-1.5 sm:flex sm:flex-row sm:gap-y-0 sm:divide-x sm:divide-[#D4D7C9]/80 font-mono text-xs text-[#1C221A]/80 tracking-tight sm:items-center">
                                  <div className="sm:pr-3">Ln: {item.measurements.length}"</div>
                                  <div className="sm:px-3">Ch: {item.measurements.chest}"</div>
                                  <div className="sm:px-3">Sh: {item.measurements.shoulder}"</div>
                                  <div className="sm:pl-3">Sl: {item.measurements.sleeve}"</div>
                                </div>
                              </div>
                            </>
                          ) : item.sizeValue ? (
                            <p><span className="text-[#17210C]">Size:</span> {item.sizeValue}</p>
                          ) : null}

                          {item.stitchingCharge > 0 && (
                            <p className="col-span-full text-[#C25934] mt-1.5">
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
                      <p className="text-[11px] text-[#1C221A]/60">Qty: {item.quantity} × ৳ {item.unitPrice.toLocaleString()}</p>
                      <p className="text-[15px] text-[#17210C] mt-0.5">৳ {item.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-[#D4D7C9]/40 font-sans">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#1C221A]/70">
                <span>Subtotal:</span>
                <span>৳ {order.subTotal.toLocaleString()}</span>
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