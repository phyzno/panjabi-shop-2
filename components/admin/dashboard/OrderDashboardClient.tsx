"use client";

import React, { useEffect, useState, useMemo } from "react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
    Search, Filter, ShoppingBag, DollarSign, Users, Archive,
    Truck, CheckCircle, XCircle, Clock, Printer, ChevronDown, LayoutList, BarChart3, Eye, X, Loader2, User, Phone, MapPin, Download
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

    const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

    const toggleNote = (itemId: string) => {
        setExpandedNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const formatText = (text?: string) => {
        if (!text) return '';
        return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

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

    const handleExportExcel = async () => {
        if (selectedOrderIds.length === 0) return;

        // লোডিং বা অ্যালার্ট দেখাতে পারেন চাইলে
        // alert("Exporting orders, please wait...");

        const ordersToExport = orders.filter(order => selectedOrderIds.includes(order.id));

        // নতুন এক্সেল ওয়ার্কবুক তৈরি
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders_Production_Sheet');

        // কলামগুলোর নির্দিষ্ট সাইজ (Width) নির্ধারণ
        worksheet.columns = [
            { width: 22 }, // A
            { width: 18 }, // B
            { width: 25 }, // C
            { width: 15 }, // D
            { width: 28 }, // E
            { width: 18 }, // F
            { width: 15 }, // G
            { width: 15 }, // H
            { width: 25 }, // I
        ];

        // অবজেক্ট ফরম্যাটার ফাংশন (মেজারমেন্ট বা স্টাইল সুন্দরভাবে দেখানোর জন্য)
        const formatObjectData = (obj: any) => {
            if (!obj || Object.keys(obj).length === 0) return "N/A";
            return Object.entries(obj)
                .map(([key, val]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${val}`)
                .join("\n"); // লাইন ব্রেক দিয়ে নিচে নিচে দেখাবে
        };

        ordersToExport.forEach((order) => {
            // ==========================================
            // ১. Master Header (অর্ডার লেভেলের মূল হেডার)
            // ==========================================
            const masterHeader = worksheet.addRow([
                "ORDER ID", "DATE", "CUSTOMER NAME", "PHONE", "ADDRESS", "PAYMENT STATUS", "ORDER STATUS", "TOTAL ITEMS", "GRAND TOTAL (৳)"
            ]);

            masterHeader.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // নেভি ব্লু ব্যাকগ্রাউন্ড
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 }; // সাদা টেক্সট
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
            });

            // ==========================================
            // ২. Master Data (অর্ডারের মূল ডেটা)
            // ==========================================
            const masterData = worksheet.addRow([
                order.id,
                order.date,
                order.customerName,
                order.customerPhone,
                order.customerAddress,
                order.paymentStatus.toUpperCase(),
                order.orderStatus.toUpperCase(),
                order.items.length, // Item Count যুক্ত করা হয়েছে
                order.grandTotal
            ]);

            masterData.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.font = { size: 11, bold: true };
            });

            // ==========================================
            // ৩. Item Header (আইটেম লেভেলের সাব-হেডার)
            // ==========================================
            const itemHeader = worksheet.addRow([
                "Item Name", "Product Type", "Qty", "Unit Price", "Stitching Charge", "Fabric & Size", "Advanced Specs", "Measurements", "Note"
            ]);

            itemHeader.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; // হালকা ধূসর ব্যাকগ্রাউন্ড
                cell.font = { color: { argb: 'FF1F2937' }, bold: true, size: 10, italic: true };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = { top: { style: 'thin', color: { argb: 'FFD1D5DB' } }, bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
            });

            // ==========================================
            // ৪. Item Data (অর্ডারের ভেতরের প্রতিটি আইটেম)
            // ==========================================
            order.items.forEach((item: any) => {
                const fabricDetails = `Fabric: ${item.fabricName || 'N/A'}\nLength: ${item.fabricYards ? item.fabricYards + ' Yards' : 'N/A'}\nSize: ${item.sizeValue || 'N/A'}`;
                const specs = Object.keys(item.tailoringDetails || {}).length > 0
                    ? formatObjectData(item.tailoringDetails)
                    : formatObjectData(item.productStyles);

                const itemRow = worksheet.addRow([
                    item.name,
                    item.productType?.replace(/_/g, ' ').toUpperCase() || "N/A",
                    item.quantity,
                    `৳ ${item.unitPrice}`,
                    `৳ ${item.stitchingCharge || 0}`,
                    fabricDetails,
                    specs,
                    formatObjectData(item.measurements),
                    item.specialInstructions || "None"
                ]);

                itemRow.eachCell((cell) => {
                    cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true }; // wrapText ট্রু করা হয়েছে যাতে লাইন ব্রেক কাজ করে
                    cell.font = { size: 10 };
                });
            });

            // ==========================================
            // ৫. Gap / Separator (পরবর্তী অর্ডারের আগে ফাঁকা সারি)
            // ==========================================
            const gapRow = worksheet.addRow([]);
            gapRow.height = 15; // ফাঁকা সারির উচ্চতা কিছুটা কমিয়ে দেওয়া
        });

        // ফাইল জেনারেট এবং ডাউনলোড ট্রিগার
        const dateString = new Date().toISOString().split('T')[0];
        const fileName = `Production_Orders_${dateString}.xlsx`;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        saveAs(blob, fileName);
    };

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
    <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-auto z-50 animate-in slide-in-from-bottom-4 duration-300 print:hidden">
        
        {/* কন্টেইনার: মোবাইলে পুরো স্ক্রিন জুড়ে থাকবে (মার্জিন সহ), পিসিতে অটোমেটিক সাইজ হবে */}
        <div className="bg-background border border-border shadow-2xl rounded-2xl md:rounded-full p-2.5 md:px-3 md:py-3 flex items-center justify-between md:justify-start gap-2 md:gap-4 max-w-sm mx-auto md:max-w-none">
            
            {/* সিলেক্টেড কাউন্ট: মোবাইলে একটু ছোট টেক্সট হবে */}
            <span className="flex-shrink-0 text-[11px] md:text-sm font-sans font-medium text-primary bg-secondary px-2.5 py-2 md:px-3 md:py-1.5 rounded-xl md:rounded-full whitespace-nowrap">
                <span className="sm:hidden">{selectedOrderIds.length} Sel</span>
                <span className="hidden sm:inline">{selectedOrderIds.length} Selected</span>
            </span>

            {/* এক্সপোর্ট বাটন: মোবাইলে flex-1 দিয়ে জায়গা ভাগ করে নেবে */}
            <button
                onClick={() => {
                    handleExportExcel().catch(err => {
                        console.error("Error exporting to Excel:", err);
                        alert("Failed to export. Please try again.");
                    });
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 md:px-5 py-2 rounded-xl md:rounded-full text-[11px] md:text-sm font-sans font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap bg-green-600 border border-green-600 text-white hover:bg-green-700"
            >
                <Download size={14} className="md:w-4 md:h-4" />
                <span>Export</span>
            </button>

            {/* আর্কাইভ/রিস্টোর বাটন */}
            <button
                onClick={handleBulkAction}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 md:px-5 py-2 rounded-xl md:rounded-full text-[11px] md:text-sm font-sans font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                    activeTab === "archived"
                        ? "bg-blue-600 border border-blue-600 text-white hover:bg-blue-700"
                        : "bg-amber-500 border border-amber-500 text-white hover:bg-amber-600"
                }`}
            >
                <Archive size={14} className="md:w-4 md:h-4" />
                <span>{activeTab === "archived" ? "Restore" : "Archive"}</span>
            </button>

            {/* ক্লিয়ার বাটন */}
            <button
                onClick={() => setSelectedOrderIds([])}
                className="flex-shrink-0 p-2 md:p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 bg-secondary rounded-xl md:rounded-full transition-colors cursor-pointer"
                title="Clear Selection"
            >
                <XCircle size={16} className="md:w-5 md:h-5" />
            </button>
        </div>
    </div>
)}
            </div>

            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    {(() => {
                        // 🎯 NEW: Calculate original subtotal and total savings dynamically
                        const originalSubTotal = viewingOrder.items?.reduce((acc: number, item: any) => {
                            const originalUnit = item.originalUnitPrice || item.unitPrice || 0;
                            const stitch = item.stitchingCharge || 0;
                            return acc + ((originalUnit + stitch) * item.quantity);
                        }, 0) || viewingOrder.subTotal;

                        const totalSavings = originalSubTotal > viewingOrder.subTotal ? originalSubTotal - viewingOrder.subTotal : 0;

                        return (
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

                                                        {/* 🎯 NEW: Dynamic Item Pricing (Original vs Discounted) */}
                                                        <div className="text-right font-sans shrink-0">
                                                            {item.discountPercentage > 0 ? (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="inline-block px-1.5 py-0.5 mb-1.5 text-[10px] uppercase tracking-widest text-amber-600 bg-amber-500/10 rounded border border-amber-500/20">
                                                                        {item.discountPercentage}% OFF
                                                                    </span>
                                                                    <p className="font-mono text-[12px] text-muted-foreground flex items-center justify-end gap-1.5">
                                                                        Qty: {item.quantity} ×
                                                                        <span className="line-through decoration-red-400/40 text-muted-foreground/60">
                                                                            ৳{(item.originalUnitPrice || item.unitPrice).toLocaleString('en-IN')}
                                                                        </span>
                                                                        <span className="font-medium text-foreground">
                                                                            ৳{item.unitPrice.toLocaleString('en-IN')}
                                                                        </span>
                                                                    </p>
                                                                    <div className="font-mono flex items-baseline justify-end gap-2 mt-1">
                                                                        <span className="text-[13px] text-muted-foreground/60 line-through decoration-red-400/40">
                                                                            ৳{(((item.originalUnitPrice || item.unitPrice) + (item.stitchingCharge || 0)) * item.quantity).toLocaleString('en-IN')}
                                                                        </span>
                                                                        <span className="text-[14px] font-bold text-primary">
                                                                            ৳{item.totalPrice.toLocaleString('en-IN')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="font-mono text-[11px] font-medium text-muted-foreground">Qty: {item.quantity} × ৳ {item.unitPrice.toLocaleString('en-IN')}</div>
                                                                    <div className="font-mono font-bold text-primary mt-0.5 text-[13px]">৳ {item.totalPrice.toLocaleString('en-IN')}</div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 🎯 Details Grid - Size Mode Removed, Only Size Kept */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/10 p-3 rounded border border-border/40 text-[13px] text-muted-foreground mt-2">
                                                        {item.fabricName && <div><span className="font-medium text-foreground">Fabric:</span> {item.fabricName}</div>}
                                                        {item.fabricYards && <div><span className="font-medium text-foreground">Length:</span> {item.fabricYards} Yards</div>}
                                                        {item.sizeValue && <div><span className="font-medium text-foreground">Size:</span> {item.sizeValue}</div>}
                                                        {item.stitchingCharge > 0 && <div><span className="font-medium text-foreground">Stitching:</span> ৳ {item.stitchingCharge} × {item.quantity}</div>}
                                                    </div>

                                                    {/* 🎯 NEW: Basic Styles */}
                                                    {item.productStyles && Object.keys(item.productStyles).length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Basic Styles</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {Object.entries(item.productStyles).map(([key, val]) => (
                                                                    <div key={key} className="px-2.5 py-1.5 bg-secondary/40 rounded border border-border/60 flex flex-col justify-center">
                                                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-0.5">{formatText(key)}</span>
                                                                        <span className="text-[12px] text-foreground capitalize">{formatText(val as string)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 🎯 NEW: Advanced Tailoring Specs */}
                                                    {item.tailoringDetails && Object.keys(item.tailoringDetails).length > 0 && (
                                                        <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                                            <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-2 flex items-center gap-1.5">
                                                                Advanced Specs
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {Object.entries(item.tailoringDetails).map(([key, val]) => (
                                                                    <div key={key} className="px-2.5 py-1.5 bg-background/80 rounded border border-primary/15 flex flex-col justify-center">
                                                                        <span className="text-[10px] uppercase tracking-widest text-primary/60 mb-0.5">{formatText(key)}</span>
                                                                        <span className="text-[12px] text-foreground capitalize">{formatText(val as string)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tailoring Measurements */}
                                                    {item.measurements && Object.keys(item.measurements).length > 0 && (
                                                        <div className="bg-amber-50/40 border border-amber-100 p-3 rounded space-y-1.5">
                                                            <div className="text-[11px] uppercase tracking-wider text-amber-800">Tailoring Measurements (Inches)</div>
                                                            {/* মেজারমেন্টের সংখ্যার ওপর ভিত্তি করে পিসিতে ৫ বা ৬ কলামের গ্রিড তৈরি হবে */}
                                                            <div className={`grid grid-cols-3 sm:grid-cols-4 ${Object.keys(item.measurements).length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-6'} gap-2 text-foreground text-center font-mono`}>
                                                                {Object.entries(item.measurements).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <div className="text-muted-foreground capitalize">
                                                                            {key.replace(/_/g, ' ')}
                                                                        </div>
                                                                        <div className="font-bold">{String(value)}"</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 🎯 NEW: Minimal View Note Button */}
                                                    {item.specialInstructions && (
                                                        <div className="mt-3">
                                                            <button
                                                                onClick={() => toggleNote(item.id)}
                                                                className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                                {expandedNotes[item.id] ? 'Hide Note' : 'View Note'}
                                                            </button>

                                                            {expandedNotes[item.id] && (
                                                                <div className="mt-2 p-2.5 bg-amber-50/50 rounded-lg border border-amber-500/20 animate-in slide-in-from-top-2 duration-200">
                                                                    <p className="font-sans text-[11px] text-amber-900/80 leading-relaxed italic">
                                                                        "{item.specialInstructions}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-4 flex justify-end">
                                        <div className="w-full max-w-sm space-y-2.5 font-sans text-muted-foreground text-[13px]">

                                            {/* 🎯 NEW: Savings Badge */}
                                            {totalSavings > 0 && (
                                                <div className="flex justify-end mb-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-red-500/10 text-red-700 rounded text-[11px] font-medium uppercase tracking-wider border border-red-500/20">
                                                        Total Discount: ৳ {totalSavings.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <span>Subtotal:</span>
                                                <div className="flex items-center gap-2">
                                                    {/* 🎯 NEW: Original Strikethrough Subtotal */}
                                                    {totalSavings > 0 && (
                                                        <span className="text-[12px] text-muted-foreground/50 line-through">
                                                            ৳ {originalSubTotal.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                    <span className="font-mono text-foreground font-medium">৳ {viewingOrder.subTotal.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Delivery Charge:</span>
                                                <span className="font-mono text-foreground">+ ৳ {viewingOrder.deliveryCharge.toLocaleString('en-IN')}</span>
                                            </div>

                                            {viewingOrder.discount > 0 && (
                                                <div className="flex justify-between text-amber-600">
                                                    <span>Discount:</span>
                                                    <span className="font-mono">- ৳ {viewingOrder.discount.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center border-t border-border pt-3 mt-3 text-sm text-primary">
                                                <span className="uppercase tracking-widest">Grand Total:</span>
                                                <span className="font-mono text-[16px] font-bold">৳ {viewingOrder.grandTotal.toLocaleString('en-IN')}</span>
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
                        );
                    })()}
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