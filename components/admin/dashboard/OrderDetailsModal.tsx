"use client";

import React from "react";
import { X, Printer, MapPin, Phone, User } from "lucide-react";
import { Order } from "./order.types";

interface Props {
    order: Order;
    onClose: () => void;
    onPrint: () => void;
}

export default function OrderDetailsModal({ order, onClose, onPrint }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-border flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/30 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-heading font-bold text-foreground">Order Details</h2>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{order.id} • {order.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-5 rounded-lg border border-border">
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Customer Info</h3>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2 text-foreground"><User size={14} className="text-muted-foreground"/> {order.customerName}</p>
                                <p className="flex items-center gap-2 text-foreground"><Phone size={14} className="text-muted-foreground"/> {order.customerPhone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 invisible md:visible">Shipping</h3>
                            <p className="flex items-start gap-2 text-sm text-foreground"><MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5"/> {order.customerAddress}</p>
                        </div>
                    </div>

                    {/* Itemized List */}
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Ordered Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={item.id} className="p-4 border border-border rounded-lg bg-background shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-foreground text-sm">{idx + 1}. {item.name}</h4>
                                        <span className="font-bold text-primary text-sm">৳ {item.totalPrice}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-secondary/40 p-3 rounded-md">
                                        <p>Type: <span className="font-medium text-foreground uppercase">{item.productType.replace(/_/g, ' ')}</span></p>
                                        <p>Qty: <span className="font-medium text-foreground">{item.quantity}</span> x ৳ {item.unitPrice}</p>
                                        
                                        {item.sizeMode !== 'custom_measurements' && item.sizeValue && (
                                            <p>Size: <span className="font-medium text-foreground">{item.sizeValue}</span></p>
                                        )}
                                        {item.fabricYards && (
                                            <p>Fabric: <span className="font-medium text-foreground">{item.fabricYards} Yards</span></p>
                                        )}
                                        {item.collarType && (
                                            <p>Collar: <span className="font-medium text-foreground">{item.collarType}</span></p>
                                        )}
                                    </div>

                                    {/* Custom Measurements Display */}
                                    {item.sizeMode === 'custom_measurements' && item.measurements && (
                                        <div className="mt-3 text-xs border-t border-border pt-2">
                                            <p className="font-semibold text-foreground mb-1">Measurements (Inches):</p>
                                            <div className="flex flex-wrap gap-3">
                                                {Object.entries(item.measurements).map(([key, val]) => (
                                                    <span key={key} className="bg-secondary px-2 py-1 rounded text-muted-foreground capitalize">
                                                        {key}: <span className="font-medium text-foreground">{val}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 space-y-2 text-sm border border-border p-4 rounded-lg bg-secondary/10">
                            <div className="flex justify-between text-muted-foreground"><span>Subtotal:</span> <span>৳ {order.subTotal}</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>Delivery:</span> <span>+ ৳ {order.deliveryCharge}</span></div>
                            <div className="flex justify-between text-green-600"><span>Discount:</span> <span>- ৳ {order.discount}</span></div>
                            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border mt-2">
                                <span>Grand Total:</span> <span>৳ {order.grandTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}