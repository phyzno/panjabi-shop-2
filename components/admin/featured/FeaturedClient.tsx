"use client";

import React, { useState, useTransition } from "react";
import { Search, Star, Shirt, Palette, Trash2, Plus, X, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toggleProductFeatured } from "@/lib/actions/product.actions";
import { toggleFabricFeatured } from "@/lib/actions/fabric.actions";

export default function FeaturedClient({ 
  initialProducts, 
  initialFabrics 
}: { 
  initialProducts: any[], 
  initialFabrics: any[] 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"products" | "fabrics">("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const displayedFeaturedProducts = initialProducts.filter(p => 
    p.is_featured && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm))
  );
  const displayedFeaturedFabrics = initialFabrics.filter(f => 
    f.is_featured && (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toString().includes(searchTerm))
  );
  const modalAvailableProducts = initialProducts.filter(p => 
    !p.is_featured && (p.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || p.id.toString().includes(modalSearchTerm))
  );
  const modalAvailableFabrics = initialFabrics.filter(f => 
    !f.is_featured && (f.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || f.id.toString().includes(modalSearchTerm))
  );
  const featuredProductsCount = initialProducts.filter(p => p.is_featured).length;
  const featuredFabricsCount = initialFabrics.filter(f => f.is_featured).length;

  const handleRemoveFeatured = (id: number) => {
    if (!confirm("Are you sure you want to remove this from featured?")) return;
    
    startTransition(async () => {
      if (activeTab === "products") {
        await toggleProductFeatured(id, false);
      } else {
        await toggleFabricFeatured(id, false);
      }
      router.refresh();
    });
  };

  const openModal = () => {
    setModalSearchTerm("");
    setSelectedToAdd([]);
    setIsModalOpen(true);
  };

  const toggleModalSelection = (id: number) => {
    setSelectedToAdd(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleAddSelected = () => {
    startTransition(async () => {
      if (activeTab === "products") {
        await Promise.all(selectedToAdd.map(id => toggleProductFeatured(id, true)));
      } else {
        await Promise.all(selectedToAdd.map(id => toggleFabricFeatured(id, true)));
      }
      setIsModalOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-background border border-border p-4 sm:p-6 rounded-lg shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-primary flex items-center gap-2">
              <Star className="text-accent fill-accent" size={24} /> Featured Showcases
            </h1>
            <p className="text-sm font-sans text-muted-foreground mt-1">
              Manage items appearing on the homepage spotlight.
            </p>
          </div>
          
          <div className="flex gap-4 text-xs font-sans uppercase tracking-wider bg-secondary/50 px-4 py-2 rounded-md border border-border w-full md:w-auto justify-center">
            <span className="text-primary">{featuredProductsCount} Products</span>
            <span className="text-border">|</span>
            <span className="text-primary">{featuredFabricsCount} Fabrics</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-border">
          <div className="flex bg-secondary p-1 rounded-md border border-border w-full md:w-auto shrink-0">
            <button 
              onClick={() => { setActiveTab("products"); setSearchTerm(""); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded text-sm transition-colors ${activeTab === "products" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-primary cursor-pointer"}`}
            >
              <Shirt size={16} /> Products
            </button>
            <button 
              onClick={() => { setActiveTab("fabrics"); setSearchTerm(""); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded text-sm transition-colors ${activeTab === "fabrics" ? "bg-accent text-white shadow-sm" : "text-muted-foreground hover:text-primary cursor-pointer"}`}
            >
              <Palette size={16} /> Fabrics
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 order-2 sm:order-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder={`Search featured ${activeTab}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-secondary/50 outline-none focus:ring-2 focus:ring-primary font-sans text-sm"
              />
            </div>

            <button 
              onClick={openModal}
              disabled={isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors shadow-sm shrink-0 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
            >
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-background border border-border rounded-lg shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100dvh-220px)] w-full">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border sticky top-0 z-10">
                <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider min-w-[250px]">Item Info</th>
                <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider whitespace-nowrap">Price</th>
                <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider text-right whitespace-nowrap">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              
              {activeTab === "products" && displayedFeaturedProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-secondary/30 transition-colors ${isPending ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 bg-secondary border border-border rounded shrink-0 flex items-center justify-center overflow-hidden relative">
                        {product.images && product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} width={48} height={56} className="w-full h-full object-cover z-10" />
                        ) : (
                          <Shirt size={20} className="text-muted-foreground z-0" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-sans text-sm text-foreground truncate max-w-xs">{product.name}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground font-mono">ID: {product.id}</span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-secondary text-primary rounded-sm border border-border">
                            Cat: {product.category_id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle font-sans text-primary whitespace-nowrap">
                    ৳ {product.price}
                  </td>
                  <td className="px-6 py-4 align-middle text-right whitespace-nowrap">
                    <button 
                      onClick={() => handleRemoveFeatured(product.id)}
                      disabled={isPending}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer inline-flex disabled:opacity-50"
                      title="Remove from featured"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {activeTab === "fabrics" && displayedFeaturedFabrics.map((fabric) => (
                <tr key={fabric.id} className={`hover:bg-secondary/30 transition-colors ${isPending ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 bg-secondary border border-border rounded shrink-0 flex items-center justify-center overflow-hidden relative">
                        {fabric.raw_image_url ? (
                          <Image src={fabric.raw_image_url} alt={fabric.name} width={48} height={56} className="w-full h-full object-cover z-10" />
                        ) : (
                          <Palette size={20} className="text-muted-foreground z-0" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-sans text-sm text-foreground truncate max-w-xs">{fabric.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">ID: {fabric.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle font-sans text-primary whitespace-nowrap">
                    ৳ {fabric.price} / Yard
                  </td>
                  <td className="px-6 py-4 align-middle text-right whitespace-nowrap">
                    <button 
                      onClick={() => handleRemoveFeatured(fabric.id)}
                      disabled={isPending}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors inline-flex cursor-pointer disabled:opacity-50"
                      title="Remove from featured"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {displayedFeaturedProducts.length === 0 && activeTab === "products" && (
                <tr><td colSpan={3} className="py-16 text-center text-sm font-sans text-muted-foreground italic">No featured products found.</td></tr>
              )}
              {displayedFeaturedFabrics.length === 0 && activeTab === "fabrics" && (
                <tr><td colSpan={3} className="py-16 text-center text-sm font-sans text-muted-foreground italic">No featured fabrics found.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      <div className="block md:hidden space-y-4 overflow-x-auto overflow-y-auto max-h-[calc(100dvh-195px)] w-full">
        
        {activeTab === "products" && (
          displayedFeaturedProducts.length === 0 ? (
            <div className="bg-background border border-border p-12 text-center rounded-lg shadow-sm">
              <p className="text-muted-foreground font-sans text-sm italic">No featured products found.</p>
            </div>
          ) : (
            displayedFeaturedProducts.map((product) => (
              <div 
                key={product.id} 
                className={`bg-background border border-border rounded-lg p-4 flex gap-4 relative shadow-sm hover:border-muted-foreground/30 transition-colors ${isPending ? 'opacity-50' : ''}`}
              >
                <div className="w-16 h-20 rounded-md overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center relative">
                  {product.images && product.images[0] ? (
                    <Image src={product.images[0]} alt={product.name} width={64} height={80} className="w-full h-full object-cover z-10" />
                  ) : (
                    <Shirt size={24} className="text-muted-foreground z-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-sans text-sm font-medium text-foreground line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground font-mono">ID: {product.id}</p>
                  </div>
                  <p className="font-sans text-primary text-base mt-2">৳ {product.price}</p>
                </div>

                <div className="absolute top-2 right-2">
                  <button 
                    onClick={() => handleRemoveFeatured(product.id)}
                    disabled={isPending}
                    className="p-2 text-muted-foreground hover:text-red-500 bg-secondary/50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === "fabrics" && (
          displayedFeaturedFabrics.length === 0 ? (
            <div className="bg-background border border-border p-12 text-center rounded-lg shadow-sm">
              <p className="text-muted-foreground font-sans text-sm italic">No featured fabrics found.</p>
            </div>
          ) : (
            displayedFeaturedFabrics.map((fabric) => (
              <div 
                key={fabric.id} 
                className={`bg-background border border-border rounded-lg p-4 flex gap-4 relative shadow-sm hover:border-muted-foreground/30 transition-colors ${isPending ? 'opacity-50' : ''}`}
              >
                <div className="w-16 h-20 rounded-md overflow-hidden bg-secondary border border-border shrink-0 flex items-center justify-center relative">
                  {fabric.raw_image_url ? (
                    <Image src={fabric.raw_image_url} alt={fabric.name} width={64} height={80} className="w-full h-full object-cover z-10" />
                  ) : (
                    <Palette size={24} className="text-muted-foreground z-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-sans text-sm font-medium text-foreground line-clamp-2 leading-snug">
                    {fabric.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {fabric.id}</p>
                  <p className="font-sans text-primary text-base mt-2">৳ {fabric.price} / Yard</p>
                </div>

                <div className="absolute top-2 right-2">
                  <button 
                    onClick={() => handleRemoveFeatured(fabric.id)}
                    disabled={isPending}
                    className="p-2 text-muted-foreground hover:text-red-500 bg-secondary/50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-lg border border-border rounded-xl shadow-2xl relative flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border shrink-0">
              <div>
                <h2 className="font-heading font-bold text-lg text-primary">
                  Add Featured {activeTab === "products" ? "Products" : "Fabrics"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Select items to showcase on the homepage</p>
              </div>
              <button onClick={() => !isPending && setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 sm:p-4 border-b border-border bg-secondary/20 shrink-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder={`Search available ${activeTab}...`} 
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-border rounded-md bg-background outline-none focus:ring-2 focus:ring-primary font-sans text-sm"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto p-2 flex-1">
              {activeTab === "products" && modalAvailableProducts.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No available products found.</div>
              )}
              {activeTab === "fabrics" && modalAvailableFabrics.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No available fabrics found.</div>
              )}

              <div className="flex flex-col gap-1">
                {(activeTab === "products" ? modalAvailableProducts : modalAvailableFabrics).map((item) => {
                  const isSelected = selectedToAdd.includes(item.id);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => !isPending && toggleModalSelection(item.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                        isSelected 
                          ? "bg-primary/5 border-primary" 
                          : "bg-transparent border-transparent hover:bg-secondary/50"
                      } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-secondary border border-border rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                           {activeTab === "products" ? (
                              item.images && item.images[0] ? <Image src={item.images[0]} alt={item.name} width={40} height={40} className="w-full h-full object-cover z-10" /> : <Shirt size={16} className="text-muted-foreground z-0" />
                           ) : (
                              item.raw_image_url ? <Image src={item.raw_image_url} alt={item.name} width={40} height={40} className="w-full h-full object-cover z-10" /> : <Palette size={16} className="text-muted-foreground z-0" />
                           )}
                        </div>
                        <div className="min-w-0 pr-2">
                          <div className="font-sans text-sm text-foreground truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">ID: {item.id}</div>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "border-primary bg-primary text-white" : "border-border text-transparent"
                      }`}>
                        <Check size={14} className={isSelected ? "opacity-100" : "opacity-0"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-border shrink-0 flex justify-between items-center bg-background rounded-b-xl">
              <span className="text-sm text-muted-foreground">
                {selectedToAdd.length} selected
              </span>
              <div className="flex gap-2 sm:gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isPending}
                  className="px-3 sm:px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddSelected}
                  disabled={selectedToAdd.length === 0 || isPending}
                  className="px-4 sm:px-6 py-2 rounded-md text-sm text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}