"use client";

import React, { useState } from "react";
import { Printer, MoreVertical, Eye, Archive } from "lucide-react";
import { Order } from "./order.types";

interface Props {
    filteredOrders: Order[];
    selectedOrderIds: string[];
    setSelectedOrderIds: React.Dispatch<React.SetStateAction<string[]>>;
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setPrintingOrder: (order: Order) => void;
    setViewingOrder: (order: Order) => void;
    activeTab: string;
}

export default function OrderListLayout({
    filteredOrders,
    selectedOrderIds,
    setSelectedOrderIds,
    setOrders,
    setPrintingOrder,
    setViewingOrder,
    activeTab
}: Props) {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    // সম্পূর্ণ আলাদা (Decoupled) স্ট্যাটাস আপডেটার
    const updateOrderStatus = (id: string, newStatus: Order['orderStatus']) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus: newStatus } : o));
    };

    const updatePaymentStatus = (id: string, newStatus: Order['paymentStatus']) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: newStatus } : o));
    };

    return (
        <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            {/* ডেস্কটপ ভিউ */}
            <div className="hidden md:block overflow-x-auto w-full max-h-[60vh] overflow-y-auto relative custom-scrollbar">
                <table className="w-full text-left table-auto border-collapse">
                    <thead className="sticky top-0 z-10 bg-secondary shadow-sm">
                        <tr className="border-b border-border">
                            <th className="px-6 py-4 w-10 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-primary rounded"
                                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider">Order ID & Date</th>
                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider">Total Amount</th>
                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider">Order Status</th>
                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm italic">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className={`hover:bg-secondary/20 transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-secondary/40' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                                            checked={selectedOrderIds.includes(order.id)}
                                            onChange={() => toggleSelectOne(order.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-sans text-sm text-foreground font-mono font-semibold">{order.id}</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5">{order.date}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-sans text-sm text-foreground">{order.customerName}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5 bg-secondary inline-block px-2 py-0.5 rounded-md border border-border">
                                            {order.items.length} {order.items.length > 1 ? 'Items' : 'Item'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-sans text-primary font-bold">৳ {order.grandTotal}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.paymentStatus}
                                            onChange={(e) => updatePaymentStatus(order.id, e.target.value as Order['paymentStatus'])}
                                            className={`px-2 py-1 border rounded text-[11px] uppercase tracking-wider font-semibold outline-none cursor-pointer ${
                                                order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                order.paymentStatus === 'refunded' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}
                                        >
                                            <option value="unpaid">Unpaid</option>
                                            <option value="paid">Paid</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['orderStatus'])}
                                            className="px-2.5 py-1.5 border rounded-md text-xs font-sans cursor-pointer outline-none bg-background text-foreground"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="canceled">Canceled</option>
                                            <option value="returned">Returned</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button 
                                            onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* ৩-ডট মেন্যু ড্রপডাউন */}
                                        {openDropdownId === order.id && (
                                            <div className="absolute right-8 top-10 w-40 bg-background border border-border shadow-lg rounded-md overflow-hidden z-50 text-left">
                                                <button onClick={() => { setViewingOrder(order); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs hover:bg-secondary transition-colors">
                                                    <Eye size={14} /> View Details
                                                </button>
                                                <button onClick={() => { setPrintingOrder(order); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs hover:bg-secondary transition-colors">
                                                    <Printer size={14} /> Print Invoice
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* মোবাইল কার্ড ভিউ */}
            <div className="md:hidden flex flex-col gap-3 p-4 max-h-[65vh] overflow-y-auto bg-secondary/10">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-background border border-border rounded-xl shadow-sm flex flex-col gap-3 relative">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <input type="checkbox" className="w-4 h-4 mt-1 accent-primary rounded" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleSelectOne(order.id)} />
                                <div>
                                    <div className="font-mono text-sm font-bold">{order.id}</div>
                                    <div className="text-sm font-semibold">{order.customerName} <span className="text-xs text-muted-foreground font-normal">({order.items.length} items)</span></div>
                                </div>
                            </div>
                            <button onClick={() => setViewingOrder(order)} className="p-1.5 bg-secondary text-primary rounded-md"><Eye size={16} /></button>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-border/60 pt-3">
                            <div className="font-sans font-bold text-primary">৳ {order.grandTotal}</div>
                            <select
                                value={order.paymentStatus}
                                onChange={(e) => updatePaymentStatus(order.id, e.target.value as Order['paymentStatus'])}
                                className="px-2 py-0.5 border rounded text-[10px] uppercase font-bold outline-none"
                            >
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}