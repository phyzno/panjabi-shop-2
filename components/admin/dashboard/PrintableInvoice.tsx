"use client";

import React from "react";
import { Order } from "./order.types";

export default function PrintableInvoice({ order }: { order: Order | null }) {
  if (!order) return null;

  // টেক্সট ফরম্যাট করার ইউটিলিটি ফাংশন
  const formatText = (text?: string) => {
    if (!text) return '';
    return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // অরিজিনাল সাবটোটাল এবং সেভিংস ক্যালকুলেশন
  const originalSubTotal = order.items?.reduce((acc: number, item: any) => {
    const originalUnit = item.originalUnitPrice || item.unitPrice || 0;
    const stitch = item.stitchingCharge || 0;
    return acc + ((originalUnit + stitch) * item.quantity);
  }, 0) || order.subTotal;

  const totalSavings = originalSubTotal > order.subTotal ? originalSubTotal - order.subTotal : 0;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-14 mx-auto text-gray-800 font-sans box-border selection:bg-gray-100">

      {/* 🎯 Header Section: Clean Logo & Invoice Meta */}
      <div className="flex justify-between items-start pb-10">
        <div>
          <h1 className="text-3xl uppercase tracking-[0.2em] text-gray-900 font-normal">Panjabi Shop</h1>
          <div className="text-sm text-gray-500 mt-3 font-light leading-relaxed">
            <p>123 Commerce Avenue, Dhaka</p>
            <p>+880 1XXX XXXXXX</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl uppercase tracking-[0.15em] text-gray-200 font-normal">Invoice</h2>
          <p className="text-sm text-gray-400 mt-2 font-mono font-light tracking-wider">#{order.id}</p>
        </div>
      </div>

      {/* 🎯 Customer & Order Info: Clean Grid Setup */}
      <div className="grid grid-cols-2 gap-8 mb-12 border-t border-gray-100 pt-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-normal">Billed To</h3>
          <p className="text-lg text-gray-800 font-normal">{order.customerName}</p>
          <div className="text-sm text-gray-500 mt-2 font-light leading-relaxed max-w-xs">
            <p>{order.customerPhone}</p>
            <p>{order.customerAddress}</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-normal">Order Details</h3>
          <div className="text-sm text-gray-500 font-light leading-relaxed">
            <p>Date: <span className="text-gray-700">{order.date}</span></p>
            <p>Payment: <span className={`uppercase ${order.paymentStatus === 'paid' ? 'text-gray-700' : 'text-gray-400'}`}>{order.paymentStatus}</span></p>
            <p>Status: <span className="uppercase text-gray-700">{order.orderStatus}</span></p>
          </div>
        </div>
      </div>

      {/* 🎯 Items Table: Minimal Borders, Focus on Whitespace */}
      <table className="w-full text-left mb-12 border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-4 text-[10px] uppercase tracking-widest text-gray-400 font-normal w-3/5">Description</th>
            <th className="py-4 text-[10px] uppercase tracking-widest text-gray-400 font-normal text-center">Qty</th>
            <th className="py-4 text-[10px] uppercase tracking-widest text-gray-400 font-normal text-right">Price</th>
            <th className="py-4 text-[10px] uppercase tracking-widest text-gray-400 font-normal text-right">Total</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {order.items.map((item, idx) => {
            // মেটা ডেটাগুলোকে এক লাইনে সাজানোর জন্য এরে তৈরি
            const basicSpecs = [
              item.fabricName && `Fabric: ${item.fabricName}`,
              item.fabricYards && `Length: ${item.fabricYards} Yds`,
              item.sizeValue ? `Size: ${item.sizeValue}` : (item.productType === 'custom_tailored' ? 'Size: Custom' : null)
            ].filter(Boolean).join(' • ');

            return (
              <tr key={item.id || idx} className="border-b border-gray-100 last:border-0 break-inside-avoid page-break-inside-avoid">

                {/* 1. Description */}
                <td className="py-7 pr-4 align-top">
                  {/* Product Name & Type */}
                  <div className="text-gray-800 font-normal mb-3 flex items-baseline gap-2.5">
                    <span className="text-base">{idx + 1}. {item.name}</span>
                  </div>

                  {/* Details Container with Breathing Space */}
                  <div className="flex flex-col gap-3.5 text-xs text-gray-500 font-light">

                    {/* Basic Specs (Fabric, Length, Size) */}
                    <div className="flex items-center flex-wrap">
                      {[
                        item.fabricName && `Fabric: ${item.fabricName}`,
                        item.fabricYards && `Length: ${item.fabricYards} Yds`,
                        item.sizeValue ? `Size: ${item.sizeValue}` : (item.productType === 'custom_tailored' ? 'Size: Custom' : null)
                      ]
                        .filter(Boolean)
                        .map((spec, i, arr) => (
                          <React.Fragment key={i}>
                            <span className="tracking-wide">{spec}</span>
                            {i < arr.length - 1 && <span className="mx-2 text-gray-300">•</span>}
                          </React.Fragment>
                        ))}
                    </div>

                    {/* Measurements (If available) */}
                    {item.measurements && Object.keys(item.measurements).length > 0 && (
                      <div className="font-mono text-[11px] text-gray-400 tracking-wider flex flex-wrap mt-0.5">
                        <span className="mr-2">[</span>
                        {Object.entries(item.measurements).map(([k, v], i, arr) => (
                          <React.Fragment key={k}>
                            <span>{formatText(k)}: {v}"</span>
                            {i < arr.length - 1 && <span className="mx-2 text-gray-200">|</span>}
                          </React.Fragment>
                        ))}
                        <span className="ml-2">]</span>
                      </div>
                    )}

                    {/* Styles */}
                    {item.productStyles && Object.keys(item.productStyles).length > 0 && (
                      <div className="grid grid-cols-[55px_1fr] gap-4 mt-1">
                        <span className="uppercase text-[9px] tracking-[0.15em] text-gray-400 border-r border-b border-gray-200 pl-1.5 pb-[2px] mt-[2px] rounded-bl-sm rounded-br-sm">
                          Styles
                        </span>
                        <div className="leading-relaxed flex flex-wrap">
                          {Object.entries(item.productStyles).map(([k, v], i, arr) => (
                            <React.Fragment key={k}>
                              <span>{formatText(k)}: {formatText(v as string)}</span>
                              {i < arr.length - 1 && <span className="mx-1.5 text-gray-300">,</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tailoring Specs */}
                    {item.tailoringDetails && Object.keys(item.tailoringDetails).length > 0 && (
                      <div className="grid grid-cols-[55px_1fr] gap-4 mt-1">
                        <span className="uppercase text-[9px] tracking-[0.15em] text-gray-400 border-r border-b border-gray-200 pl-1.5 pb-[2px] mt-[2px] rounded-bl-sm rounded-br-sm">
                          Specs
                        </span>
                        <div className="leading-relaxed flex flex-wrap">
                          {Object.entries(item.tailoringDetails).map(([k, v], i, arr) => (
                            <React.Fragment key={k}>
                              <span>{formatText(k)}: {formatText(v as string)}</span>
                              {i < arr.length - 1 && <span className="mx-1.5 text-gray-300">/</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {item.specialInstructions && (
                      <div className="grid grid-cols-[55px_1fr] gap-4 mt-1">
                        <span className="uppercase text-[9px] tracking-[0.15em] text-gray-400 border-r border-b border-gray-200 pl-1.5 pb-[2px] mt-[2px] rounded-bl-sm rounded-br-sm">
                          Note
                        </span>
                        <p className="italic text-gray-400 leading-relaxed">{item.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                </td>

                {/* 2. Qty */}
                <td className="py-6 text-center text-gray-600 align-top font-light">
                  {item.quantity}
                </td>

                {/* 3. Unit Price */}
                <td className="py-6 text-right align-top font-light text-gray-600">
                  {(item.discountPercentage ?? 0) > 0 && (
                    <div className="text-[10px] text-gray-400 mb-0.5">
                      <span className="line-through mr-1">৳{(item.originalUnitPrice || item.unitPrice).toLocaleString('en-IN')}</span>
                      <span>(-{item.discountPercentage}%)</span>
                    </div>
                  )}
                  <div className="text-gray-800">৳{item.unitPrice.toLocaleString('en-IN')}</div>

                  {(item.stitchingCharge ?? 0) > 0 && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      + ৳{(item.stitchingCharge ?? 0).toLocaleString('en-IN')} stitch
                    </div>
                  )}
                </td>

                {/* 4. Total */}
                <td className="py-6 text-right align-top text-gray-800 font-normal">
                  ৳{item.totalPrice.toLocaleString('en-IN')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="break-inside-avoid page-break-inside-avoid">
        {/* 🎯 Order Summary Section */}
        <div className="flex justify-end pt-4">
          <div className="w-[320px]">
            <div className="flex justify-between py-2.5 text-sm text-gray-500 font-light">
              <span>Subtotal</span>
              <div className="flex items-center gap-2">
                {totalSavings > 0 && (
                  <span className="text-xs text-gray-300 line-through">
                    ৳{originalSubTotal.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-gray-800">৳{order.subTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-between py-2.5 text-sm text-gray-500 font-light">
              <span>Delivery</span>
              <span className="text-gray-800">+ ৳{order.deliveryCharge.toLocaleString('en-IN')}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between py-2.5 text-sm text-gray-500 font-light">
                <span>Discount</span>
                <span className="text-gray-800">- ৳{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between items-end border-t border-gray-200 pt-6 mt-4">
              <div>
                {totalSavings > 0 && (
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                    You Saved: ৳{totalSavings.toLocaleString('en-IN')}
                  </p>
                )}
                <span className="text-sm uppercase tracking-widest text-gray-500 font-normal">Grand Total</span>
              </div>
              <span className="text-2xl text-gray-900 font-normal tracking-wide">
                ৳{order.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 🎯 Premium Footer */}
        <div className="mt-24 pt-8 border-t border-gray-100 flex justify-between items-end">
          <div className="text-[10px] text-gray-400 font-light leading-relaxed">
            <p className="mb-2">Thank you for your purchase.</p>
            <p>This is a system-generated document.</p>
            <p>No signature is required.</p>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-gray-200 mb-2 inline-block"></div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-normal">Authorized Sign</p>
          </div>
        </div>
      </div>
    </div>
  );
}