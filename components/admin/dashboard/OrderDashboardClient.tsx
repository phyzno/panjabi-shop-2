"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Search, Filter, ShoppingBag, DollarSign, Users, Archive,
    Truck, CheckCircle, XCircle, Clock, Printer, ChevronDown, LayoutList, BarChart3, Eye, X, Loader2, User, Phone, MapPin
} from "lucide-react";

import PrintableInvoice from "./PrintableInvoice";
import {
    getAdminOrders,
    updateOrderStatus,
    updatePaymentStatus,
    bulkToggleArchiveOrders
} from "@/lib/actions/order.actions";
import { Order } from "./order.types";

export default function OrderDashboardClient() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [mainView, setMainView] = useState<"analytics" | "orders">("analytics");

    const [timeFilter, setTimeFilter] = useState<"weekly" | "monthly" | "yearly" | "lifetime">("monthly");

    const [activeTab, setActiveTab] = useState<"all" | "pending" | "delivered" | "canceled" | "archived">("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [printingOrder, setPrintingOrder] = useState<any>(null);
    const [viewingOrder, setViewingOrder] = useState<any>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            const res = await getAdminOrders();
            if (res.success && res.data) {
                setOrders(res.data as Order[]);
            } else {
                console.error("Failed to load orders:", res.error);
            }
            setIsLoading(false);
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        let originalTitle = document.title; 

        if (printingOrder) {
            document.title = `invoice-${printingOrder.id}`;
            
            setTimeout(() => {
                window.print();
            }, 150);
        }

        const handleAfterPrint = () => {
            document.title = originalTitle; 
            setPrintingOrder(null);
        };
        
        window.addEventListener("afterprint", handleAfterPrint);

        return () => {
            document.title = originalTitle;
            window.removeEventListener("afterprint", handleAfterPrint);
        };
    }, [printingOrder]);

    const timeFilteredOrders = useMemo(() => {
        if (timeFilter === "lifetime") return orders;

        const now = new Date();
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            const diffTime = Math.abs(now.getTime() - orderDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (timeFilter === "weekly") return diffDays <= 7;
            if (timeFilter === "monthly") return diffDays <= 30;
            if (timeFilter === "yearly") return diffDays <= 365;
            return true;
        });
    }, [orders, timeFilter]);

    const toggleSelectAll = (filteredOrdersList: Order[]) => {
        if (selectedOrderIds.length === filteredOrdersList.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrdersList.map(o => o.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredTableOrders = timeFilteredOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === "archived") return order.isArchived && matchesSearch;
        if (order.isArchived) return false;

        if (activeTab === "all") return matchesSearch;
        return order.orderStatus === activeTab && matchesSearch;
    });

    const handleStatusChange = async (id: string, newStatus: string) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (order.id === id) {
                    let updatedPayment = order.paymentStatus;
                    if (newStatus === "returned") {
                        updatedPayment = "refunded";
                    } else if (newStatus === "delivered" && order.paymentStatus === "refunded") {
                        updatedPayment = "paid";
                    }
                    return { ...order, orderStatus: newStatus as any, paymentStatus: updatedPayment as any };
                }
                return order;
            })
        );

        const res = await updateOrderStatus(id, newStatus);
        if (!res.success) {
            alert("Failed to update status. Please try again.");
        }
    };

    const handlePaymentStatusChange = async (id: string, newPaymentStatus: string) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === id ? { ...order, paymentStatus: newPaymentStatus as any } : order
            )
        );

        const res = await updatePaymentStatus(id, newPaymentStatus);
        if (!res.success) {
            alert("Failed to update payment status.");
        }
    };

    const totalRevenue = timeFilteredOrders
        .filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'returned' && o.orderStatus !== 'canceled')
        .reduce((sum, order) => sum + order.grandTotal, 0);

    const totalRefunded = timeFilteredOrders
        .filter(o => o.paymentStatus === 'refunded' || o.orderStatus === 'returned')
        .reduce((sum, order) => sum + order.grandTotal, 0);

    const activeCustomersCount = new Set(timeFilteredOrders.map(o => o.customerName)).size;
    const totalOrdersCount = timeFilteredOrders.length;

    const handleBulkAction = async () => {
        if (selectedOrderIds.length === 0) return;

        const isRestoring = activeTab === "archived";
        const targetArchiveState = !isRestoring;

        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                selectedOrderIds.includes(order.id)
                    ? { ...order, isArchived: targetArchiveState }
                    : order
            )
        );

        const savedSelectedIds = [...selectedOrderIds];
        setSelectedOrderIds([]);
        alert(`Processing ${savedSelectedIds.length} orders...`);

        const res = await bulkToggleArchiveOrders(savedSelectedIds, targetArchiveState);
        if (!res.success) {
            alert("Failed to process bulk action.");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 space-y-4 text-muted-foreground animate-in fade-in duration-500">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="font-sans text-sm tracking-wide">Syncing latest orders...</p>
            </div>
        );
    }

    return (
        <>
            <div className={`space-y-8 animate-in fade-in duration-500 ${printingOrder ? 'print:hidden' : ''}`}>

                <div className="bg-background border border-border p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-secondary p-1 rounded-md border border-border w-full md:w-auto">
                        <button
                            onClick={() => { setMainView("analytics"); setSelectedOrderIds([]); }}
                            className={`flex-1 md:flex-none px-6 py-2 rounded text-xs font-sans uppercase tracking-wider transition-colors cursor-pointer ${mainView === "analytics" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-primary"}`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setMainView("orders")}
                            className={`flex-1 md:flex-none px-6 py-2 rounded text-xs font-sans uppercase tracking-wider transition-colors cursor-pointer ${mainView === "orders" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-primary"}`}
                        >
                            Orders List
                        </button>
                    </div>

                    <div className="flex bg-secondary p-1 rounded-md border border-border w-full md:w-auto overflow-x-auto custom-scrollbar">
                        {(["weekly", "monthly", "yearly", "lifetime"] as const).map((time) => (
                            <button
                                key={time}
                                onClick={() => setTimeFilter(time)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded text-xs font-sans uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${timeFilter === time ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-primary"}`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {mainView === "analytics" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-background border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Net Revenue</p>
                                <h3 className="text-2xl font-heading font-black text-primary">৳ {totalRevenue.toLocaleString('en-IN')}</h3>
                            </div>
                            <div className="p-4 bg-secondary/60 text-primary rounded-lg border border-border"><DollarSign size={24} /></div>
                        </div>

                        <div className="bg-background border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Total Refunded</p>
                                <h3 className="text-2xl font-heading font-black text-amber-600">৳ {totalRefunded.toLocaleString('en-IN')}</h3>
                            </div>
                            <div className="p-4 bg-amber-50 text-amber-600 rounded-lg border border-amber-200"><Archive size={24} /></div>
                        </div>

                        <div className="bg-background border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Total Orders</p>
                                <h3 className="text-2xl font-heading font-black text-primary">{totalOrdersCount}</h3>
                            </div>
                            <div className="p-4 bg-secondary/60 text-primary rounded-lg border border-border"><ShoppingBag size={24} /></div>
                        </div>

                        <div className="bg-background border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Active Customers</p>
                                <h3 className="text-2xl font-heading font-black text-primary">
                                    {activeCustomersCount} <span className="text-xs font-normal text-muted-foreground font-sans">/ {totalOrdersCount} Orders</span>
                                </h3>
                            </div>
                            <div className="p-4 bg-secondary/60 text-primary rounded-lg border border-border"><Users size={24} /></div>
                        </div>
                    </div>
                )}

                {mainView === "orders" && (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">

                        <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-4">
                            <div className="hidden md:flex flex-row gap-2 justify-center">
                                {(["all", "pending", "delivered", "canceled", "archived"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => { setActiveTab(tab); setSelectedOrderIds([]); }}
                                        className={`px-4 py-2 rounded text-xs font-sans uppercase tracking-wider border transition-all cursor-pointer ${activeTab === tab
                                            ? "bg-secondary border-primary text-primary shadow-sm"
                                            : "bg-background border-border text-muted-foreground hover:text-primary hover:border-primary"
                                            }`}
                                    >
                                        {tab === "all" && "📦 All Orders"}
                                        {tab === "pending" && "⏳ Pending"}
                                        {tab === "delivered" && "🚀 Delivered"}
                                        {tab === "canceled" && "❌ Canceled"}
                                        {tab === "archived" && "🗄️ Archived Tab"}
                                    </button>
                                ))}
                            </div>

                            <div className="md:hidden relative">
                                <select
                                    value={activeTab}
                                    onChange={(e) => {
                                        setActiveTab(e.target.value as any);
                                        setSelectedOrderIds([]);
                                    }}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-sm font-sans text-foreground outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer"
                                >
                                    <option value="all">📦 All Orders</option>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="delivered"> ✅ Delivered</option>
                                    <option value="canceled">❌ Canceled</option>
                                    <option value="archived">🗄️ Archived Tab</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="flex justify-end w-full">
                                    <div className="relative w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search Order ID or Name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-secondary/50 outline-none focus:ring-2 focus:ring-primary font-sans text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
                            <div className="hidden md:block overflow-x-auto w-full max-h-[60vh] overflow-y-auto relative custom-scrollbar">
                                <table className="w-full text-left table-auto border-collapse">
                                    <thead className="sticky top-0 z-10 bg-secondary shadow-sm">
                                        <tr className="border-b border-border">
                                            <th className="px-6 py-4 w-10 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-primary rounded"
                                                    checked={filteredTableOrders.length > 0 && selectedOrderIds.length === filteredTableOrders.length}
                                                    onChange={() => toggleSelectAll(filteredTableOrders)}
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider whitespace-nowrap">Order ID & Date</th>
                                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider min-w-[150px]">Customer Details</th>
                                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider whitespace-nowrap">Amount</th>
                                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider whitespace-nowrap">Payment Status</th>
                                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider whitespace-nowrap">Order Status</th>
                                            <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredTableOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-16 text-center">
                                                    <p className="text-muted-foreground font-sans text-sm italic">
                                                        No orders found under this filter.
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTableOrders.map((order) => (
                                                <tr key={order.id} className={`hover:bg-secondary/20 transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-secondary/40' : ''}`}>
                                                    <td className="px-6 py-4 align-middle">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                                                            checked={selectedOrderIds.includes(order.id)}
                                                            onChange={() => toggleSelectOne(order.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 align-middle">
                                                        <div className="font-sans text-sm text-foreground font-mono">{order.id}</div>
                                                        <div className="text-[10px] text-muted-foreground font-sans mt-0.5">{order.date}</div>
                                                    </td>
                                                    <td className="px-6 py-4 align-middle">
                                                        <div className="font-sans text-sm text-foreground">{order.customerName}</div>
                                                        <div className="mt-1">
                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-secondary text-muted-foreground border border-border rounded-md text-[10px] font-sans font-medium tracking-wide">
                                                                {order.items.length} {order.items.length > 1 ? 'Items' : 'Item'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-middle font-sans text-primary">
                                                        ৳ {order.grandTotal}
                                                    </td>
                                                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                                                        <select
                                                            value={order.paymentStatus}
                                                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                            className={`inline-flex items-center gap-1.5 px-2 py-1.5 border rounded-md text-xs font-sans cursor-pointer outline-none transition-colors ${order.paymentStatus === 'paid' ? 'bg-green-50 border-green-200 text-green-700' :
                                                                order.paymentStatus === 'refunded' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                                    'bg-red-50 border-red-200 text-red-700'
                                                                }`}
                                                        >
                                                            <option value="unpaid">Unpaid</option>
                                                            <option value="paid">Paid</option>
                                                            <option value="refunded">Refunded</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                                                        <select
                                                            value={order.orderStatus}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-sans cursor-pointer outline-none transition-colors ${order.orderStatus === "pending" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                                                order.orderStatus === "processing" ? "bg-purple-50 border-purple-200 text-purple-700" :
                                                                    order.orderStatus === "shipped" ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                                                                        order.orderStatus === "delivered" ? "bg-green-50 border-green-200 text-green-700" :
                                                                            order.orderStatus === "returned" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                                                                "bg-red-50 border-red-200 text-red-700"
                                                                }`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="returned">Returned</option>
                                                            <option value="canceled">Canceled</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 align-middle text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => setViewingOrder(order)}
                                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors cursor-pointer"
                                                            title="View Order Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md:hidden flex flex-col gap-3 p-4 max-h-[65vh] overflow-y-auto custom-scrollbar bg-secondary/10">
                                {filteredTableOrders.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground font-sans text-sm italic">
                                        No orders found.
                                    </div>
                                ) : (
                                    filteredTableOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className={`p-4 bg-background border rounded-xl shadow-sm flex flex-col gap-3.5 relative transition-all ${selectedOrderIds.includes(order.id) ? 'border-primary ring-1 ring-primary/30 bg-primary/5' : 'border-border'}`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="pt-0.5 shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4.5 h-4.5 accent-primary rounded cursor-pointer"
                                                            checked={selectedOrderIds.includes(order.id)}
                                                            onChange={() => toggleSelectOne(order.id)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="font-mono text-[14px] font-bold text-foreground truncate">{order.id}</div>
                                                        <div className="text-[11px] text-muted-foreground font-sans mt-0.5">{order.date}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 pl-2">
                                                    <div className="font-sans text-[16px] text-primary">৳ {order.grandTotal}</div>
                                                </div>
                                            </div>

                                            <div className="bg-secondary/30 rounded-lg p-3 border border-border/50 flex justify-between items-center gap-2">
                                                <div className="font-sans text-[14px] text-foreground truncate">
                                                    {order.customerName}
                                                </div>
                                                <span className="shrink-0 inline-flex items-center justify-center px-2 py-0.5 bg-background text-muted-foreground border border-border/60 rounded text-[10px] font-sans font-medium tracking-wide shadow-sm">
                                                    {order.items.length} {order.items.length > 1 ? 'Items' : 'Item'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/60">
                                                <select
                                                    value={order.paymentStatus}
                                                    onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                    className={`w-full pr-6 pl-2.5 py-1.5 border rounded-md text-[11px] font-sans cursor-pointer outline-none transition-colors ${order.paymentStatus === 'paid' ? 'bg-green-50 border-green-200 text-green-700' :
                                                        order.paymentStatus === 'refunded' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                            'bg-red-50 border-red-200 text-red-700'
                                                        }`}
                                                >
                                                    <option value="unpaid">Unpaid</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>

                                                <select
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`w-full pr-6 pl-2.5 py-1.5 border rounded-md text-[11px] font-sans cursor-pointer outline-none transition-colors ${order.orderStatus === "pending" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                                        order.orderStatus === "processing" ? "bg-purple-50 border-purple-200 text-purple-700" :
                                                            order.orderStatus === "shipped" ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                                                                order.orderStatus === "delivered" ? "bg-green-50 border-green-200 text-green-700" :
                                                                    order.orderStatus === "returned" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                                                        "bg-red-50 border-red-200 text-red-700"
                                                        }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="returned">Returned</option>
                                                    <option value="canceled">Canceled</option>
                                                </select>

                                                <button
                                                    onClick={() => setViewingOrder(order)}
                                                    className="col-span-2 w-full justify-center px-3 py-2 mt-1 bg-background border border-border/80 text-foreground hover:border-primary hover:text-primary rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-[13px] shadow-sm"
                                                >
                                                    <Eye size={15} /> Details
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedOrderIds.length > 0 && mainView === "orders" && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 z-50 animate-in slide-in-from-bottom-4 duration-300 print:hidden">
                        <div className="bg-background border border-border shadow-2xl rounded-full px-3 py-3 flex items-center gap-3 md:gap-4">
                            <span className="text-xs md:text-sm font-sans text-primary bg-secondary px-3 py-1.5 rounded-full whitespace-nowrap">
                                {selectedOrderIds.length} Selected
                            </span>

                            <button
                                onClick={handleBulkAction}
                                className={`flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-sans font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap ${activeTab === "archived"
                                    ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                                    : "bg-amber-500 border-amber-500 text-white hover:bg-amber-600"
                                    }`}
                            >
                                <Archive size={16} />
                                {activeTab === "archived" ? "Restore" : "Archive"}
                            </button>

                            <button
                                onClick={() => setSelectedOrderIds([])}
                                className="p-1.5 md:p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 bg-secondary rounded-full transition-colors cursor-pointer"
                                title="Clear Selection"
                            >
                                <XCircle size={18} className="md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background border border-border w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

                        <div className="px-6 py-4 bg-secondary/50 border-b border-border flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
                                    <span>Order Details:</span>
                                    <span className="text-primary">{viewingOrder.id}</span>
                                </h2>
                                <p className="text-[11px] text-muted-foreground font-sans mt-0.5">Placed on {viewingOrder.date}</p>
                            </div>
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 font-sans text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 bg-secondary/20 p-4 rounded-lg border border-border/60">
                                    <h3 className="font-heading font-bold text-primary uppercase tracking-wider text-[11px] mb-3">Customer Information</h3>
                                    <div className="space-y-2.5 text-foreground">
                                        <div className="font-medium text-sm flex items-center gap-2.5">
                                            <User size={14} className="text-muted-foreground" />
                                            {viewingOrder.customerName}
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-2.5">
                                            <Phone size={14} />
                                            {viewingOrder.customerPhone}
                                        </div>
                                        <div className="text-muted-foreground leading-relaxed flex items-start gap-2.5">
                                            <MapPin size={14} className="shrink-0 mt-0.5" />
                                            <span>{viewingOrder.customerAddress}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border/60 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-heading font-bold text-primary uppercase tracking-wider text-[11px] mb-2">Workflow Status</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-[10px] text-muted-foreground block mb-1">Order Status</span>
                                                <span className="capitalize font-medium px-2 py-1 bg-background border border-border rounded-md inline-block">
                                                    {viewingOrder.orderStatus}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-muted-foreground block mb-1">Payment Status</span>
                                                <span className="capitalize font-medium px-2 py-1 bg-background border border-border rounded-md inline-block">
                                                    {viewingOrder.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-heading font-bold text-primary uppercase tracking-wider text-[11px]">Ordered Items ({viewingOrder.items.length})</h3>
                                <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                                    {viewingOrder.items.map((item: any, idx: number) => (
                                        <div key={item.id || idx} className="p-4 bg-background space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm text-foreground">{item.name}</h4>
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/60 mt-1 inline-block">
                                                        {item.productType.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono font-medium text-foreground">৳ {item.unitPrice} x {item.quantity}</div>
                                                    <div className="font-mono font-bold text-primary mt-0.5">৳ {item.totalPrice}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-secondary/10 p-3 rounded border border-border/40 text-[11px] text-muted-foreground">
                                                {item.sizeMode && (
                                                    <div><span className="font-medium text-foreground text-[12px]">Size Mode:</span> <span className="capitalize">{item.sizeMode.replace(/_/g, ' ')}</span></div>
                                                )}
                                                {item.sizeValue && (
                                                    <div><span className="font-medium text-foreground text-[12px]">Size:</span> {item.sizeValue}</div>
                                                )}
                                                {item.fabricName && (
                                                    <div><span className="font-medium text-foreground text-[12px]">Fabric:</span> {item.fabricName}</div>
                                                )}
                                                {item.fabricYards && (
                                                    <div><span className="font-medium text-foreground text-[12px]">Length:</span> {item.fabricYards} Yards</div>
                                                )}
                                                {item.collarType && (
                                                    <div><span className="font-medium text-foreground text-[12px]">Collar:</span> {item.collarType}</div>
                                                )}
                                                {item.stitchingCharge > 0 && (
                                                    <div><span className="font-medium text-foreground text-[12px]">Stitching:</span> ৳ {item.stitchingCharge} × {item.quantity}</div>
                                                )}
                                            </div>

                                            {item.measurements && Object.keys(item.measurements).length > 0 && (
                                                <div className="bg-amber-50/40 border border-amber-100 p-3 rounded space-y-1.5">
                                                    <div className="text-[11px] uppercase tracking-wider text-amber-800">Tailoring Measurements (Inches)</div>
                                                    <div className="grid grid-cols-4 gap-2 text-foreground text-center font-mono">
                                                        {item.measurements.length && <div><div className="text-[10px] text-muted-foreground">Length</div><div className="font-bold">{item.measurements.length}"</div></div>}
                                                        {item.measurements.chest && <div><div className="text-[10px] text-muted-foreground">Chest</div><div className="font-bold">{item.measurements.chest}"</div></div>}
                                                        {item.measurements.shoulder && <div><div className="text-[10px] text-muted-foreground">Shoulder</div><div className="font-bold">{item.measurements.shoulder}"</div></div>}
                                                        {item.measurements.sleeve && <div><div className="text-[10px] text-muted-foreground">Sleeve</div><div className="font-bold">{item.measurements.sleeve}"</div></div>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 flex justify-end">
                                <div className="w-full max-w-xs space-y-1.5 font-sans text-muted-foreground">
                                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-mono text-foreground">৳ {viewingOrder.subTotal}</span></div>
                                    <div className="flex justify-between"><span>Delivery Charge:</span> <span className="font-mono text-foreground">৳ {viewingOrder.deliveryCharge}</span></div>
                                    <div className="flex justify-between"><span>Discount:</span> <span className="font-mono text-red-600">- ৳ {viewingOrder.discount}</span></div>
                                    <div className="flex justify-between border-t border-border pt-2 text-sm text-primary">
                                        <span>Grand Total:</span>
                                        <span className="font-mono text-base">৳ {viewingOrder.grandTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-between gap-3">
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="px-4 py-2 bg-background border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-xs font-medium"
                            >
                                Close Window
                            </button>
                            <button
                                onClick={() => {
                                    setPrintingOrder(viewingOrder);
                                    setViewingOrder(null);
                                }}
                                className="px-5 py-2 bg-primary text-white hover:bg-primary/90 rounded-md transition-all cursor-pointer flex items-center gap-2 text-xs font-medium shadow-sm"
                            >
                                <Printer size={14} /> Print Shipping Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {printingOrder && (
                <div className="hidden print:block w-full bg-white absolute top-0 left-0 z-50">
                    <PrintableInvoice order={printingOrder} />
                </div>
            )}
        </>
    );
}