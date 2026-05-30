'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Search, ShoppingBag } from 'lucide-react';
import OrderDetailsModal from '@/components/dashboard/OrderDetailsModal';
import PrintableInvoice from '@/components/admin/dashboard/PrintableInvoice';

export default function OrdersClient({ orders }: { orders: any[] }) {
  const [printingOrder, setPrintingOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-[#4A5D23]/10 text-[#4A5D23] border-[#4A5D23]/20';
      case 'processing': return 'bg-[#C25934]/10 text-[#C25934] border-[#C25934]/20';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'canceled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-[#F8F9F5] text-[#1C221A]/70 border-[#D4D7C9]/60';
    }
  };

  useEffect(() => {
    if (printingOrder) {
      setTimeout(() => {
        window.print();
      }, 150);
    }
    const handleAfterPrint = () => setPrintingOrder(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [printingOrder]);

  return (
    <>
      {/* Main Container: 
        max-h-[75vh] এবং flex-col ব্যবহার করা হয়েছে যাতে কন্টেইনারের নির্দিষ্ট হাইট থাকে 
        এবং পেজ ওভার-স্ক্রোল না হয়। 
      */}
      <div className="bg-white rounded-2xl border border-[#D4D7C9]/50 shadow-[0_4px_20px_rgba(14,20,9,0.02)] flex flex-col max-h-none md:max-h-[75vh] overflow-visible md:overflow-hidden">

        {/* ২. স্টিকি টুলবার (Search Box Section):
        top-0 দিয়ে এটিকে স্ক্রিনের একদম উপরে স্টিকি করা হয়েছে। z-30 দেওয়া হয়েছে যেন কার্ডগুলো এর নিচ দিয়ে স্ক্রোল করে।
        মোবাইলে একটি হালকা শ্যাডো (shadow-sm) দেওয়া হয়েছে যাতে স্ক্রোল করার সময় এটি আলাদা দেখায়।
        (নোট: আপনার ওয়েবসাইটে যদি মোবাইলের জন্য কোনো গ্লোবাল টপ নেভবার থাকে, তবে top-0 এর জায়গায় top-16 বা সেই নেভবারের হাইট অনুযায়ী সেট করতে হতে পারে)।
      */}
      <div className="sticky top-16 md:top-0 lg:top-0 z-30 p-4 sm:p-6 border-b border-[#D4D7C9]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F9F5] shadow-sm md:shadow-none">
        <div className="relative w-full sm:w-72 shrink-0">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#D4D7C9] pl-10 pr-4 py-2.5 rounded-xl text-xs font-sans focus:outline-none focus:border-[#4A5D23] transition-colors shadow-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/40" />
        </div>
        <div className="font-sans text-[11px] sm:text-[12px] uppercase tracking-widest text-[#1C221A]/60 flex items-center justify-between sm:justify-end w-full">
          <span>Total Orders:</span>
          <span className="text-[#17210C] ml-2 bg-white px-3 py-1 rounded-full border border-[#D4D7C9]/60">
            {orders.length}
          </span>
        </div>
      </div>

        {/* Scrollable Orders List Container */}
        <div className="overflow-y-visible md:overflow-y-auto custom-scrollbar flex-1 bg-white relative">
          {filteredOrders.length > 0 ? (
            <>
              {/* ================= DESKTOP TABLE VIEW ================= */}
              <table className="hidden md:table w-full text-left font-sans">
                <thead className="bg-[#F8F9F5] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-[12px] uppercase tracking-widest text-primary font-normal">Order ID</th>
                    <th className="px-6 py-4 text-[12px] uppercase tracking-widest text-primary font-normal">Date</th>
                    <th className="px-6 py-4 text-[12px] uppercase tracking-widest text-primary font-normal">Status</th>
                    <th className="px-6 py-4 text-[12px] uppercase tracking-widest text-primary text-right font-normal">Total</th>
                    <th className="px-6 py-4 text-[12px] uppercase tracking-widest text-primary text-center font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4D7C9]/30">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8F9F5]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-heading text-xs font-bold text-[#17210C] uppercase tracking-wide">
                          {order.id}
                        </span>
                        <p className="text-[10px] text-[#1C221A]/50 mt-1">{order.items?.length || 0} Items</p>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-[#1C221A]/70 font-medium">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest border inline-block ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#17210C] text-right">
                        ৳ {order.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center justify-center w-10 h-8 rounded-full bg-[#F8F9F5] text-primary hover:bg-[#4A5D23] hover:text-white transition-all border border-[#D4D7C9]/50 cursor-pointer shadow-sm"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 stroke-[2]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ================= MOBILE CARD VIEW ================= */}
              <div className="md:hidden flex flex-col p-4 gap-4 bg-[#F8F9F5]/30">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-[#D4D7C9]/60 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-heading text-sm font-bold text-[#17210C] uppercase tracking-wide">
                          {order.id}
                        </span>
                        <p className="text-[12px] text-[#1C221A]/50 mt-1">{order.items?.length || 0} Items</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-accent">৳ {order.grandTotal.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-[#D4D7C9]/40">
                      <div className="text-[12px] text-[#1C221A]/70 font-medium">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border inline-block ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-[#F8F9F5] text-primary hover:bg-[#4A5D23] hover:text-white transition-all border border-[#D4D7C9]/50 cursor-pointer text-[12px] uppercase tracking-wider shadow-sm"
                    >
                      <Eye className="w-4 h-4" /> View Order Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-[#F8F9F5] rounded-full flex items-center justify-center mb-4 border border-[#D4D7C9]/50">
                <ShoppingBag className="w-8 h-8 text-[#4A5D23]/60" />
              </div>
              <p className="font-heading text-sm font-bold uppercase tracking-wider text-[#17210C]">No orders found</p>
              <p className="font-sans text-[11px] text-[#1C221A]/60 mt-2 max-w-[200px]">Try adjusting your search ID or explore our new collection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          onPrint={() => {
            setPrintingOrder(selectedOrder);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* 🔴 Bulletproof Print Logic */}
      {printingOrder && (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
          @media print {
            body * { visibility: hidden !important; }
            #printable-invoice-container, #printable-invoice-container * { visibility: visible !important; }
            #printable-invoice-container { 
              position: absolute !important; 
              left: 0 !important; 
              top: 0 !important; 
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}} />

          <div id="printable-invoice-container" className="hidden print:block w-full bg-white z-[9999]">
            <PrintableInvoice order={printingOrder} />
          </div>
        </>
      )}
    </>
  );
}