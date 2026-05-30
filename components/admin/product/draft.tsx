"use client";

import React, { useState, useTransition } from "react";
import { Search, Plus, Trash2, Edit3, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { deleteProduct } from "@/lib/actions/product.actions";
import { useRouter } from "next/navigation";

export default function ProductTableClient({ products }: { products: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.id.toString().includes(searchTerm)
  );

  const handleDelete = async (id: number, imageUrls: string[]) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setDeletingId(id);
    try {
      const res = await deleteProduct(id, imageUrls);
      if (res.success) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || "Failed to delete product.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8 relative">
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pt-4 pb-2 -mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-background border border-border p-5 md:p-6 shadow-sm rounded-lg gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary">Manage Products</h1>
            <p className="text-sm font-sans text-muted-foreground mt-1">
              Add, update, or remove products from your catalog.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-secondary/50 outline-none focus:ring-2 focus:ring-primary font-sans text-sm transition-all"
              />
            </div>
            
            <Link 
              href="/admin/products/new"
              className="w-full sm:w-auto bg-primary text-white px-6 py-2 font-sans text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} /> Add New
            </Link>
          </div>
        </div>
      </div>

      {/* Main List Area (Scrollable Box) */}
      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
        
        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-[60px_minmax(0,1fr)_120px_100px] gap-6 px-6 py-4 bg-secondary/50 border-b border-border">
          <div className="text-xs font-heading font-bold text-primary uppercase tracking-wider">Image</div>
          <div className="text-xs font-heading font-bold text-primary uppercase tracking-wider">Product Name</div>
          <div className="text-xs font-heading font-bold text-primary uppercase tracking-wider">Price</div>
          <div className="text-xs font-heading font-bold text-primary uppercase tracking-wider text-right">Actions</div>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto max-h-[calc(100vh-260px)] min-h-[400px] divide-y divide-border">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground font-sans text-sm italic">
                {searchTerm ? `No products found for "${searchTerm}"` : "No products found. Click 'Add New' to get started."}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="flex flex-col md:grid md:grid-cols-[60px_minmax(0,1fr)_120px_100px] gap-4 md:gap-6 md:items-center px-4 py-4 md:px-6 hover:bg-secondary/30 transition-colors">
                
                {/* Mobile: Top Section (Image + Info) / Desktop: Columns 1 & 2 */}
                <div className="flex items-start md:contents gap-4">
                  {/* Image */}
                  <div className="w-16 h-20 md:w-12 md:h-14 rounded-md overflow-hidden bg-secondary border border-border shrink-0">
                    {product.images && (product.images as string[])[0] ? (
                      <Image src={(product.images as string[])[0]} alt={product.name} width={64} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-full h-full p-3 md:p-2.5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 md:flex-none flex flex-col justify-center">
                    <div className="font-sans text-sm font-semibold md:font-normal text-foreground line-clamp-2">{product.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">ID: {product.id}</div>
                    {/* Mobile Price */}
                    <div className="md:hidden font-sans text-primary font-bold mt-2 text-sm">৳ {product.price}</div>
                  </div>
                </div>

                {/* Desktop Price */}
                <div className="hidden md:flex items-center font-sans text-primary whitespace-nowrap">
                  ৳ {product.price}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 items-center w-full border-t border-border/60 pt-3 mt-1 md:border-0 md:pt-0 md:mt-0">
                  <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary/80 rounded-md transition-colors cursor-pointer border border-transparent">
                    <Edit3 size={18} />
                  </Link>
                  
                  <button 
                    onClick={() => handleDelete(product.id, product.images as string[])}
                    disabled={deletingId === product.id}
                    className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-transparent"
                  >
                    {deletingId === product.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}