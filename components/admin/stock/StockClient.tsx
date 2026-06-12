"use client";

import React, { useState, useTransition, useMemo } from "react";
import { Search, Plus, Minus, Edit3, Package, Shirt, Palette, X, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProductStock } from "@/lib/actions/product.actions";
import { updateFabricStock } from "@/lib/actions/fabric.actions";

export default function StockClient({ 
    initialProducts, 
    initialFabrics,
    categories
}: { 
    initialProducts: any[]; 
    initialFabrics: any[]; 
    categories: any[];
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<"products" | "fabrics">("products");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [actionType, setActionType] = useState<"add" | "sub" | "edit">("add");
    const [quantities, setQuantities] = useState<Record<string, number | "">>({});

    // ক্যাটাগরি ট্রি-কে ফ্ল্যাট লিস্টে রূপান্তর করার অপ্টিমাইজড হেল্পার
    const flatCategories = useMemo(() => {
        const flatten = (nodes: any[], depth = 0): any[] => {
            let result: any[] = [];
            nodes.forEach((node) => {
                result.push({ id: node.id, name: node.name, depth });
                if (node.children && node.children.length > 0) {
                    result.push(...flatten(node.children, depth + 1));
                }
            });
            return result;
        };
        return flatten(categories);
    }, [categories]);

    // রিকার্সিভলি সাব-ক্যাটাগরির ID কালেকশন করার ফাংশন
    const getDescendantIds = (catId: number): number[] => {
        const ids: number[] = [];
        const findNode = (nodes: any[]): any => {
            for (const node of nodes) {
                if (node.id === catId) return node;
                if (node.children && node.children.length > 0) {
                    const found = findNode(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const collectIds = (node: any) => {
            if (!node) return;
            ids.push(node.id);
            if (node.children && node.children.length > 0) {
                node.children.forEach((child: any) => collectIds(child));
            }
        };
        const targetNode = findNode(categories);
        collectIds(targetNode);
        return ids;
    };

    const allowedCategoryIds = useMemo(() => {
        if (selectedCategoryId === "all") return [];
        return getDescendantIds(Number(selectedCategoryId));
    }, [selectedCategoryId, categories]);

    // সার্চ এবং কম্বাইনড ক্যাটাগরি ফিল্টার লজিক
    const filteredProducts = initialProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm);
        if (selectedCategoryId === "all") return matchesSearch;
        return matchesSearch && allowedCategoryIds.includes(p.category_id);
    });

    const filteredFabrics = initialFabrics.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toString().includes(searchTerm)
    );

    const openModal = (item: any, type: "add" | "sub" | "edit") => {
        setSelectedItem(item);
        setActionType(type);
        setQuantities({});
        setIsModalOpen(true);
    };

    const handleQuantityChange = (sizeOrId: string, value: string) => {
        setQuantities(prev => ({
            ...prev,
            [sizeOrId]: value === "" ? "" : Number(value)
        }));
    };

    const handleStockSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                if (activeTab === "products") {
                    const newStockObj = { ...(selectedItem.stock || {}) };
                    let hasChanges = false;

                    selectedItem.sizes.forEach((size: string) => {
                        const inputVal = quantities[size] || 0;
                        if (inputVal === 0 && actionType !== "edit") return;

                        let currentStock = Number(newStockObj[size]) || 0;
                        let newStock = currentStock;

                        if (actionType === "add") newStock = currentStock + Number(inputVal);
                        if (actionType === "sub") newStock = Math.max(0, currentStock - Number(inputVal));
                        if (actionType === "edit") newStock = quantities[size] === "" ? currentStock : Number(inputVal);

                        if (currentStock !== newStock) {
                            newStockObj[size] = newStock;
                            hasChanges = true;
                        }
                    });

                    if (hasChanges) {
                        const res = await updateProductStock(selectedItem.id, newStockObj);
                        if (!res.success) alert(res.error || "Failed to update product stock");
                    }
                } else {
                    const inputVal = quantities["fabric"] || 0;
                    if (inputVal !== 0 || actionType === "edit") {
                        let newYards = Number(selectedItem.yards) || 0;
                        if (actionType === "add") newYards += Number(inputVal);
                        if (actionType === "sub") newYards = Math.max(0, newYards - Number(inputVal));
                        if (actionType === "edit") newYards = quantities["fabric"] === "" ? newYards : Number(inputVal);

                        if (newYards !== selectedItem.yards) {
                            const res = await updateFabricStock(selectedItem.id, newYards);
                            if (!res.success) alert(res.error || "Failed to update fabric yards");
                        }
                    }
                }

                setIsModalOpen(false);
                router.refresh();
            } catch (error) {
                console.error(error);
                alert("Something went wrong while updating stock.");
            }
        });
    };

    const standardSizes = selectedItem?.sizes?.filter((s: string) => isNaN(Number(s))) || [];
    const numberSizes = selectedItem?.sizes?.filter((s: string) => !isNaN(Number(s))) || [];

    const actionDetails = {
        add: { title: "Add Stock", color: "text-green-600", bgBtn: "bg-green-600 hover:bg-green-700" },
        sub: { title: "Reduce Stock", color: "text-red-600", bgBtn: "bg-red-600 hover:bg-red-700" },
        edit: { title: "Replace Stock", color: "text-primary", bgBtn: "bg-primary hover:bg-primary/90" }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Top Inventory Header and Controls */}
            <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-5">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-primary">Inventory & Stock</h1>
                    <p className="text-sm font-sans text-muted-foreground mt-1">
                        Manage your ready-made product sizes and customizer fabric yards.
                    </p>
                </div>

                <div className="border-t border-border" />

                {/* Controls Row: Tabs, Filters, and Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-secondary p-1 rounded-md border border-border w-full sm:w-auto shrink-0 order-1">
                        <button
                            onClick={() => { setActiveTab("products"); setSearchTerm(""); setSelectedCategoryId("all"); }}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded text-sm transition-colors ${activeTab === "products" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-primary cursor-pointer"}`}
                        >
                            <Shirt size={16} /> Products
                        </button>
                        <button
                            onClick={() => { setActiveTab("fabrics"); setSearchTerm(""); setSelectedCategoryId("all"); }}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded text-sm transition-colors ${activeTab === "fabrics" ? "bg-accent text-white shadow-sm" : "text-muted-foreground hover:text-primary cursor-pointer"}`}
                        >
                            <Palette size={16} /> Fabrics
                        </button>
                    </div>

                    {/* Category Filter Dropdown - Only visible in Products Tab */}
                    {activeTab === "products" && (
                        <div className="w-full sm:w-48 order-2 animate-in fade-in duration-200">
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedCategoryId(val === "all" ? "all" : Number(val));
                                }}
                                className="w-full px-3 py-2 border border-border rounded-md bg-secondary/50 outline-none focus:ring-2 focus:ring-primary font-sans text-sm cursor-pointer h-10"
                            >
                                <option value="all">All Categories</option>
                                {flatCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {"\u00A0\u00A0".repeat(cat.depth)}
                                        {cat.depth > 0 ? "└─ " : ""}
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Search Input Bar - Kept at bottom on Mobile view via order-3 & sm:ml-auto for PC alignment */}
                    <div className="relative w-full sm:w-64 order-3 sm:ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-secondary/50 outline-none focus:ring-2 focus:ring-primary font-sans text-sm h-10"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100dvh-250px)]">
                    <table className="w-full text-left table-auto border-collapse">
                        <thead>
                            <tr className="bg-secondary border-b border-border sticky top-0 z-10">
                                <th className="px-4 md:px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider">Item Info</th>
                                <th className="hidden md:table-cell px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider w-[60%]">Stock Details & Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">

                            {activeTab === "products" && (
                                filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="py-16 text-center text-muted-foreground font-sans text-sm italic">
                                            No products found matching the criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-secondary/10 transition-colors">
                                            <td className="px-4 md:px-6 py-5 align-top">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-14 bg-secondary border border-border rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                                                            {product.images && product.images[0] ? (
                                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover z-10" />
                                                            ) : (
                                                                <Shirt size={20} className="text-muted-foreground z-0" />
                                                            )}
                                                        </div>
                                                        <div className="w-full">
                                                            <div className="font-sans text-md text-foreground">{product.name}</div>
                                                            <div className="w-fit text-xs text-muted-foreground mt-1 font-mono px-2 py-0.5 bg-secondary text-primary rounded-sm border border-border">ID: {product.id}</div>
                                                        </div>
                                                    </div>

                                                    <div className="md:hidden w-full flex flex-col gap-2 pt-2 border-t border-border">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => openModal(product, "add")} className="flex-1 flex justify-center items-center gap-1 bg-green-50 border border-green-200 text-green-700 py-2 rounded text-xs hover:bg-green-100 transition-colors cursor-pointer">
                                                                <Plus size={14} /> Add
                                                            </button>
                                                            <button onClick={() => openModal(product, "sub")} className="flex-1 flex justify-center items-center gap-1 bg-red-50 border border-red-200 text-red-700 py-2 rounded text-xs hover:bg-red-100 transition-colors cursor-pointer">
                                                                <Minus size={14} /> Sub
                                                            </button>
                                                            <button onClick={() => openModal(product, "edit")} className="flex-1 flex justify-center items-center gap-1 bg-primary border border-border text-white py-2 rounded text-xs hover:bg-primary/70 transition-colors cursor-pointer">
                                                                <Edit3 size={14} /> Edit
                                                            </button>
                                                        </div>
                                                        {product.sizes.some((s: string) => (product.stock as any)[s] < 5) && (
                                                            <div className="bg-red-50 text-red-500 text-[10px] uppercase tracking-widest text-center py-1.5 rounded flex justify-center items-center gap-1 mt-1">
                                                                <Info size={12} /> Low Stock Alert
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="hidden md:table-cell px-6 py-5 align-top">
                                                <div className="flex flex-col gap-3 w-full">
                                                    <table className="w-full border-collapse border border-border rounded-md text-sm font-sans overflow-hidden">
                                                        <tbody>
                                                            <tr className="bg-secondary/50">
                                                                <td className="px-3 py-2 border-r border-border text-primary w-20">Size</td>
                                                                {product.sizes.map((size: string) => (
                                                                    <td key={size} className="px-3 py-2 border-r last:border-r-0 border-border text-center text-muted-foreground">{size}</td>
                                                                ))}
                                                            </tr>
                                                            <tr>
                                                                <td className="px-3 py-2 border-r border-border text-primary">Stock</td>
                                                                {product.sizes.map((size: string) => {
                                                                    const stockCount = (product.stock as any)[size] || 0;
                                                                    return (
                                                                        <td key={size} className={`px-3 py-2 border-r last:border-r-0 border-border text-center ${stockCount < 5 ? 'text-red-500 bg-red-50' : 'text-foreground'}`}>
                                                                            {stockCount}
                                                                        </td>
                                                                    )
                                                                })}
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div className="flex gap-2">
                                                        <button onClick={() => openModal(product, "add")} className="flex-1 flex justify-center items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-xs font-sans rounded-md hover:bg-green-100 transition-colors cursor-pointer">
                                                            <Plus size={14} /> Add
                                                        </button>
                                                        <button onClick={() => openModal(product, "sub")} className="flex-1 flex justify-center items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-xs font-sans rounded-md hover:bg-red-100 transition-colors cursor-pointer">
                                                            <Minus size={14} /> Sub
                                                        </button>
                                                        <button onClick={() => openModal(product, "edit")} className="flex-1 flex justify-center items-center gap-2 bg-primary border border-border text-white px-4 py-2 text-xs font-sans rounded-md hover:bg-primary/90 transition-colors cursor-pointer">
                                                            <Edit3 size={14} /> Replace
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}

                            {activeTab === "fabrics" && (
                                filteredFabrics.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="py-16 text-center text-muted-foreground font-sans text-sm italic">
                                            No fabrics found matching the criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFabrics.map((fabric) => (
                                        <tr key={fabric.id} className="hover:bg-secondary/10 transition-colors">
                                            <td className="px-4 md:px-6 py-5 align-middle">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-secondary border border-border rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                                                            {fabric.raw_image_url ? (
                                                                <Image src={fabric.raw_image_url} alt={fabric.name} fill className="object-cover z-10" />
                                                            ) : (
                                                                <Palette size={20} className="text-muted-foreground z-0" />
                                                            )}
                                                        </div>
                                                        <div className="w-full">
                                                            <div className="font-sans text-md text-foreground">{fabric.name}</div>
                                                            <div className="w-fit text-xs text-muted-foreground mt-1 font-mono px-2 py-0.5 bg-secondary text-primary rounded-sm border border-border">ID: {fabric.id}</div>
                                                        </div>
                                                    </div>

                                                    <div className="md:hidden w-full flex gap-2 pt-2 border-t border-border">
                                                        <button onClick={() => openModal(fabric, "add")} className="flex-1 flex justify-center items-center gap-1 bg-green-50 border border-green-200 text-green-700 py-2 rounded text-xs hover:bg-green-100"><Plus size={14} /> Add</button>
                                                        <button onClick={() => openModal(fabric, "sub")} className="flex-1 flex justify-center items-center gap-1 bg-red-50 border border-red-200 text-red-700 py-2 rounded text-xs hover:bg-red-100"><Minus size={14} /> Sub</button>
                                                        <button onClick={() => openModal(fabric, "edit")} className="flex-1 flex justify-center items-center gap-1 bg-primary border border-border text-white py-2 rounded text-xs hover:bg-primary/70"><Edit3 size={14} /> Edit</button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-5 align-middle">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Total:</span>
                                                        <span className={`text-lg font-heading font-black ${fabric.yards < 10 ? 'text-red-500' : 'text-primary'}`}>
                                                            {fabric.yards} <span className="text-xs">Yards</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openModal(fabric, "add")} className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 text-xs font-bold rounded-md hover:bg-green-100 transition-colors cursor-pointer"><Plus size={16} /></button>
                                                        <button onClick={() => openModal(fabric, "sub")} className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-xs font-bold rounded-md hover:bg-red-100 transition-colors cursor-pointer"><Minus size={16} /></button>
                                                        <button onClick={() => openModal(fabric, "edit")} className="bg-primary text-white px-5 py-2 text-xs rounded-md hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                                                            <Edit3 size={14} /> Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Components */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-2xl border border-border rounded-xl shadow-2xl relative flex flex-col max-h-[90vh]">

                        <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
                            <h2 className={`font-heading font-bold flex items-center gap-2 uppercase tracking-wide ${actionDetails[actionType].color}`}>
                                <Package size={20} /> {actionDetails[actionType].title}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleStockSubmit} className="p-6 overflow-y-auto space-y-6">

                            <div className="bg-secondary/30 border border-border rounded-lg p-4">
                                <h3 className="font-sans text-md text-foreground">{selectedItem.name}</h3>
                                <p className="font-mono text-xs text-muted-foreground mb-4">{selectedItem.id}</p>

                                {activeTab === "products" ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs font-sans border-collapse border border-border bg-background">
                                            <tbody>
                                                <tr className="bg-secondary/50">
                                                    <td className="px-3 py-1.5 border-r border-border">Size</td>
                                                    {selectedItem.sizes.map((s: string) => <td key={s} className="px-3 py-1.5 border-r last:border-r-0 border-border text-center">{s}</td>)}
                                                </tr>
                                                <tr>
                                                    <td className="px-3 py-1.5 border-r border-border">Current</td>
                                                    {selectedItem.sizes.map((s: string) => (
                                                        <td key={s} className={`px-3 py-1.5 border-r last:border-r-0 border-border text-center ${(selectedItem.stock[s] || 0) < 5 ? 'text-red-500' : ''}`}>
                                                            {selectedItem.stock[s] || 0}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 font-sans text-sm">
                                        <span className="text-muted-foreground">Current Available Yards:</span>
                                        <span className="text-primary text-lg">{selectedItem.yards}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                                    <Info size={14} />
                                    {actionType === "edit"
                                        ? "Leave blank to keep current stock unchanged."
                                        : "Leave blank to add/subtract zero (0)."}
                                </div>

                                {activeTab === "products" ? (
                                    <div className="space-y-6">
                                        {standardSizes.length > 0 && (
                                            <div>
                                                <h4 className={`text-sm font-heading font-bold mb-3 ${actionDetails[actionType].color}`}>Standard Sizes</h4>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                    {standardSizes.map((size: string) => (
                                                        <div key={size}>
                                                            <label className="block text-md text-muted-foreground mb-1 text-center">{size}</label>
                                                            <input
                                                                type="number" min="0" placeholder={actionType === "edit" ? String(selectedItem.stock[size] || 0) : "0"}
                                                                value={quantities[size] ?? ""} onChange={(e) => handleQuantityChange(size, e.target.value)}
                                                                className={`w-full border bg-secondary/50 rounded p-2 text-center text-sm outline-none transition-colors focus:ring-2 focus:ring-primary ${actionType === 'add' ? 'border-green-200' : actionType === 'sub' ? 'border-red-200' : 'border-border'}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {numberSizes.length > 0 && (
                                            <div>
                                                <h4 className={`text-sm font-heading font-bold mb-3 ${actionDetails[actionType].color}`}>Number Sizes</h4>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                    {numberSizes.map((size: string) => (
                                                        <div key={size}>
                                                            <label className="block text-md text-muted-foreground mb-1 text-center">{size}</label>
                                                            <input
                                                                type="number" min="0" placeholder={actionType === "edit" ? String(selectedItem.stock[size] || 0) : "0"}
                                                                value={quantities[size] ?? ""} onChange={(e) => handleQuantityChange(size, e.target.value)}
                                                                className={`w-full border bg-secondary/50 rounded p-2 text-center text-sm outline-none transition-colors focus:ring-2 focus:ring-primary ${actionType === 'add' ? 'border-green-200' : actionType === 'sub' ? 'border-red-200' : 'border-border'}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className={`block text-sm font-heading font-bold mb-2 ${actionDetails[actionType].color}`}>
                                            {actionType === "add" ? "Yards to Add (+)" : actionType === "sub" ? "Yards to Remove (-)" : "New Total Yards"}
                                        </label>
                                        <input
                                            type="number" min="0" placeholder={actionType === "edit" ? String(selectedItem.yards) : "0"}
                                            value={quantities["fabric"] ?? ""} onChange={(e) => handleQuantityChange("fabric", e.target.value)}
                                            className={`w-full max-w-xs border bg-secondary/50 rounded p-3 text-lg outline-none transition-colors focus:ring-2 focus:ring-primary ${actionType === 'add' ? 'border-green-200' : actionType === 'sub' ? 'border-red-200' : 'border-border'}`}
                                        />
                                    </div>
                                )}
                            </div>

                        </form>

                        <div className="p-6 border-t border-border shrink-0 flex justify-end gap-3 bg-secondary/20 rounded-b-xl">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" disabled={isPending} onClick={handleStockSubmit} className={`px-6 py-2.5 rounded-md text-sm text-white shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${actionDetails[actionType].bgBtn}`}>
                                {isPending ? <Loader2 size={16} className="animate-spin" /> : `Confirm ${actionType === "add" ? "Addition" : actionType === "sub" ? "Reduction" : "Replacement"}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}