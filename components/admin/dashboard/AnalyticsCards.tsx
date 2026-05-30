"use client";

import React from "react";
import { DollarSign, Users, Archive } from "lucide-react";
import { Order } from "./order.types";

export default function AnalyticsCards({ orders }: { orders: Order[] }) {
    // ডাইনামিক ক্যালকুলেশন লজিক
    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.grandTotal, 0);

    const totalRefunded = orders
        .filter(o => o.paymentStatus === 'refunded' || o.paymentStatus === 'partially_refunded')
        .reduce((sum, order) => sum + order.grandTotal, 0);

    const activeCustomersCount = new Set(orders.map(o => o.customerPhone)).size; // নামের বদলে ফোন নাম্বার দিয়ে ইউনিক করা ভালো

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div className="bg-background border border-border p-6 rounded-xl flex items-center justify-between shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="space-y-1">
                    <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Active Customers</p>
                    <h3 className="text-2xl font-heading font-black text-primary">
                        {activeCustomersCount} <span className="text-xs font-normal text-muted-foreground font-sans">/ {orders.length} Orders</span>
                    </h3>
                </div>
                <div className="p-4 bg-secondary/60 text-primary rounded-lg border border-border"><Users size={24} /></div>
            </div>
        </div>
    );
}