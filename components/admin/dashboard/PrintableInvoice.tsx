import React from "react";
import { Order } from "./order.types";

export default function PrintableInvoice({ order }: { order: Order | null }) {
  if (!order) return null;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-12 mx-auto text-black font-sans box-border">
      <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
        <div>
          <h1 className="text-4xl uppercase tracking-widest text-gray-900">Invoice</h1>
          <p className="text-sm text-gray-500 mt-2 font-mono">Order ID: {order.id}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl text-gray-800">Panjabi Shop</h2>
          <p className="text-sm text-gray-500 mt-1">123 Commerce Avenue, Dhaka</p>
          <p className="text-sm text-gray-500">Phone: +880 1XXX XXXXXX</p>
        </div>
      </div>

      <div className="mb-10 flex justify-between">
        <div>
          <h3 className="text-sm font-normal text-primary uppercase tracking-wider mb-2">Billed To:</h3>
          <p className="text-xl text-gray-800">{order.customerName}</p>
          <p className="text-sm text-gray-600 mt-1">Phone: {order.customerPhone}</p>
          <p className="text-sm text-gray-600">Address: {order.customerAddress}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm font-normal text-primary uppercase tracking-wider mb-2">Details:</h3>
          <p className="text-sm text-gray-600">Date: {order.date}</p>
          <p className="text-sm text-gray-600 mt-1">
            Payment: <span className={`uppercase ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{order.paymentStatus}</span>
          </p>
        </div>
      </div>

      <table className="w-full text-left mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-3 text-md uppercase text-primary font-normal">Description</th>
            <th className="py-3 text-md uppercase text-primary font-normal text-center">Qty</th>
            <th className="py-3 text-md uppercase text-primary font-normal text-right">Price</th>
            <th className="py-3 text-md uppercase text-primary font-normal text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-4 text-sm text-gray-800 font-medium">
                {idx + 1}. {item.name}
                <div className="text-xs text-gray-500 font-normal mt-1">
                  Type: {item.productType.replace(/_/g, ' ')}

                  {item.measurements
                    ? ' | Size: Custom'
                    : item.sizeValue
                      ? ` | Size: ${item.sizeValue}`
                      : ''}

                  {item.productType === 'custom_tailored' && item.measurements && (
                    <div className="text-[11px] text-amber-800 font-mono mt-0.5 bg-gray-50 px-2 py-0.5 rounded inline-block">
                      Meas: Ln: {item.measurements.length || '-'} | Ch: {item.measurements.chest || '-'} | Sh: {item.measurements.shoulder || '-'} | Sl: {item.measurements.sleeve || '-'}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4 text-sm text-center text-gray-800">{item.quantity}</td>
              <td className="py-4 text-sm text-right text-gray-800">৳ {item.unitPrice}</td>
              <td className="py-4 text-sm text-gray-800 text-right">৳ {item.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between py-2 text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>৳ {order.subTotal}</span>
          </div>
          <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
            <span>Delivery Charge:</span>
            <span>+ ৳ {order.deliveryCharge}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between py-2 text-sm text-green-600 border-b border-gray-200">
              <span>Discount:</span>
              <span>- ৳ {order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-xl border-t-2 border-black pt-4 mt-2">
            <span>Grand Total:</span>
            <span>৳ {order.grandTotal}</span>
          </div>
        </div>
      </div>

      <div className="mt-24 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
        <p>Thank you for shopping with us!</p>
        <p className="mt-1">This is a system-generated document and does not require a signature.</p>
      </div>
    </div>
  );
}