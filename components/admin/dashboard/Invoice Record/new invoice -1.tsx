"use client";

import React from "react";
import { Order } from "./order.types";

export default function PrintableInvoice({ order }: { order: Order | null }) {
  if (!order) return null;

  // টেক্সট ফরম্যাট করার ইউটিলিটি ফাংশন (যেমন: band_collar -> Band Collar)
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
    <div className="w-[210mm] min-h-[297mm] bg-white p-12 mx-auto text-black font-sans box-border">
      {/* 🎯 Header Section */}
      <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
        <div>
          <h1 className="text-4xl uppercase tracking-widest text-gray-900">Invoice</h1>
          <p className="text-sm text-gray-500 mt-2 font-mono">Order ID: {order.id}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl text-gray-800 uppercase tracking-wider">Panjabi Shop</h2>
          <p className="text-sm text-gray-500 mt-1">123 Commerce Avenue, Dhaka</p>
          <p className="text-sm text-gray-500">Phone: +880 1XXX XXXXXX</p>
        </div>
      </div>

      {/* 🎯 Customer & Order Info */}
      <div className="mb-10 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-200 inline-block pb-1">Billed To:</h3>
          <p className="text-xl text-gray-900 font-medium mt-1">{order.customerName}</p>
          <p className="text-sm text-gray-600 mt-1">Phone: {order.customerPhone}</p>
          <p className="text-sm text-gray-600 max-w-xs">Address: {order.customerAddress}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-200 inline-block pb-1">Details:</h3>
          <p className="text-sm text-gray-600 mt-1">Date: <span className="text-gray-900 font-medium">{order.date}</span></p>
          <p className="text-sm text-gray-600 mt-1">
            Payment: <span className={`uppercase ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{order.paymentStatus}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Status: <span className="uppercase font-medium text-gray-900">{order.orderStatus}</span>
          </p>
        </div>
      </div>

      {/* 🎯 Items Table */}
      <table className="w-full text-left mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-3 text-xs uppercase text-gray-800 font-normal tracking-widest w-[55%]">Description</th>
            <th className="py-3 text-xs uppercase text-gray-800 font-normal tracking-widest text-center">Qty</th>
            <th className="py-3 text-xs uppercase text-gray-800 font-normal tracking-widest text-right">Unit Price</th>
            <th className="py-3 text-xs uppercase text-gray-800 font-normal tracking-widest text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={item.id || idx} className="border-b border-gray-200">
              {/* 🎯 1. Description Column */}
              <td className="py-4 align-top pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-900">{idx + 1}. {item.name}</span>
                  <span className="text-[9px] uppercase tracking-widest bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                    {item.productType.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-[11px] text-gray-600 flex gap-3 mb-1.5">
                  {item.fabricName && <span><span className="font-medium text-gray-800">Fabric:</span> {item.fabricName}</span>}
                  {item.fabricYards && <span><span className="font-medium text-gray-800">Length:</span> {item.fabricYards} Yds</span>}
                  {item.sizeValue && <span><span className="font-medium text-gray-800">Size:</span> {item.sizeValue}</span>}
                  {item.productType === 'custom_tailored' && !item.sizeValue && <span><span className="font-medium text-gray-800">Size:</span> Custom</span>}
                </div>

                {/* 🎯 Dynamic Measurements */}
                {item.measurements && Object.keys(item.measurements).length > 0 && (
                  <div className="text-[10px] text-gray-700 font-mono mb-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    <span className="font-bold text-gray-900">Meas: </span> 
                    {Object.entries(item.measurements).map(([k, v]) => `${formatText(k)}: ${v}"`).join(' | ')}
                  </div>
                )}

                {/* 🎯 Styles & Adv. Specs */}
                {(item.productStyles || item.tailoringDetails) && (
                  <div className="text-[10px] text-gray-600 mb-1.5 leading-relaxed">
                    {item.productStyles && Object.keys(item.productStyles).length > 0 && (
                      <span className="block mb-0.5">
                        <span className="text-gray-800">Styles:</span> {Object.entries(item.productStyles).map(([k, v]) => `${formatText(k)} - ${formatText(v as string)}`).join(' • ')}
                      </span>
                    )}
                    {item.tailoringDetails && Object.keys(item.tailoringDetails).length > 0 && (
                      <span className="block">
                        <span className="text-gray-800">Adv. Specs:</span> {Object.entries(item.tailoringDetails).map(([k, v]) => `${formatText(k)} - ${formatText(v as string)}`).join(' • ')}
                      </span>
                    )}
                  </div>
                )}

                {/* 🎯 Notes */}
                {item.specialInstructions && (
                  <div className="text-[11px] text-gray-800 italic mt-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-200/60 inline-block">
                    Note: "{item.specialInstructions}"
                  </div>
                )}
              </td>

              {/* 🎯 2. Quantity Column */}
              <td className="py-4 text-sm text-center text-gray-900 align-top font-medium pt-5">
                {item.quantity}
              </td>

              {/* 🎯 3. Unit Price & Stitching Column */}
              <td className="py-4 text-right align-top pt-5">
                {(item.discountPercentage ?? 0) > 0 ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded mb-1 border border-gray-200">{item.discountPercentage}% OFF</span>
                    <span className="text-xs text-gray-400 line-through">৳ {(item.originalUnitPrice || item.unitPrice).toLocaleString('en-IN')}</span>
                    <span className="text-sm text-gray-900 font-medium">৳ {item.unitPrice.toLocaleString('en-IN')}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-900 font-medium">৳ {item.unitPrice.toLocaleString('en-IN')}</span>
                )}

                {item.stitchingCharge > 0 && (
                  <div className="text-[10px] text-gray-600 mt-1.5 pt-1.5 border-t border-gray-100 border-dashed w-fit ml-auto">
                    + ৳ {item.stitchingCharge.toLocaleString('en-IN')} (Stitch)
                  </div>
                )}
              </td>

              {/* 🎯 4. Total Column */}
              <td className="py-4 text-right align-top pt-5">
                {(item.discountPercentage ?? 0) > 0 && (
                  <div className="text-xs text-gray-400 line-through mb-1">
                    ৳ {(((item.originalUnitPrice || item.unitPrice) + (item.stitchingCharge || 0)) * item.quantity).toLocaleString('en-IN')}
                  </div>
                )}
                <div className="text-sm text-gray-900">
                  ৳ {item.totalPrice.toLocaleString('en-IN')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🎯 Order Summary Section */}
      <div className="flex justify-end">
        <div className="w-1/2 min-w-[300px]">
          
          {totalSavings > 0 && (
            <div className="flex justify-end mb-2">
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[10px] uppercase tracking-wider border border-gray-300">
                Total Savings: ৳ {totalSavings.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="flex justify-between py-2 text-sm text-gray-700">
            <span>Subtotal:</span>
            <div className="flex items-center gap-2">
              {totalSavings > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  ৳ {originalSubTotal.toLocaleString('en-IN')}
                </span>
              )}
              <span className="font-medium">৳ {order.subTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="flex justify-between py-2 text-sm text-gray-700 border-b border-gray-200">
            <span>Delivery Charge:</span>
            <span className="font-medium">+ ৳ {order.deliveryCharge.toLocaleString('en-IN')}</span>
          </div>
          
          {order.discount > 0 && (
            <div className="flex justify-between py-2 text-sm text-gray-700 border-b border-gray-200">
              <span>Extra Discount:</span>
              <span className="font-medium">- ৳ {order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center text-lg border-t-2 border-gray-800 pt-4 mt-2">
            <span className="uppercase tracking-widest text-gray-900">Grand Total:</span>
            <span className="text-gray-900">৳ {order.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 🎯 Footer */}
      <div className="mt-24 text-center text-xs text-gray-500 border-t border-gray-200 pt-6">
        <p className="font-medium text-gray-700 mb-1">Thank you for shopping with us!</p>
        <p>This is a system-generated document and does not require a signature.</p>
      </div>
    </div>
  );
}