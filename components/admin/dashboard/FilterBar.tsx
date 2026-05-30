"use client";

import React from "react";
import { Search, ChevronDown, Calendar } from "lucide-react";

interface Props {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    timeFilter: string;
    setTimeFilter: (time: any) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    setSelectedOrderIds: (ids: string[]) => void;
}

export default function FilterBar({ activeTab, setActiveTab, timeFilter, setTimeFilter, searchTerm, setSearchTerm, setSelectedOrderIds }: Props) {
    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setSelectedOrderIds([]); 
    };

    return (
        <div className="bg-background border border-border p-4 md:p-5 rounded-xl shadow-sm space-y-4">
            {/* Top Row: Time Filter & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                    <Calendar size={16} className="text-muted-foreground hidden md:block" />
                    {(["weekly", "monthly", "yearly"] as const).map((time) => (
                        <button key={time} onClick={() => setTimeFilter(time)} className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-colors whitespace-nowrap ${timeFilter === time ? "bg-primary text-white shadow-sm" : "bg-secondary text-muted-foreground hover:text-primary"}`}>
                            {time}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input type="text" placeholder="Search Order ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-secondary/50 outline-none focus:ring-2 focus:ring-primary font-sans text-sm" />
                </div>
            </div>

            <div className="border-t border-border pt-4">
                {/* Desktop Tabs */}
                <div className="hidden md:flex flex-row flex-wrap gap-2">
                    {(["all", "pending", "processing", "shipped", "delivered", "canceled", "returned", "archived"] as const).map((tab) => (
                        <button key={tab} onClick={() => handleTabChange(tab)} className={`px-4 py-2 rounded-lg text-xs font-sans uppercase tracking-wider border transition-all cursor-pointer ${activeTab === tab ? "bg-primary/10 border-primary text-primary font-bold shadow-sm" : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary"}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Mobile Dropdown */}
                <div className="md:hidden relative w-full">
                    <select value={activeTab} onChange={(e) => handleTabChange(e.target.value)} className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-sm font-sans font-medium outline-none focus:ring-2 focus:ring-primary appearance-none capitalize cursor-pointer">
                        <option value="all">📦 All Orders</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="processing">⚙️ Processing</option>
                        <option value="shipped">🚚 Shipped</option>
                        <option value="delivered">🚀 Delivered</option>
                        <option value="canceled">❌ Canceled</option>
                        <option value="returned">↩️ Returned</option>
                        <option value="archived">🗄️ Archived Tab</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}