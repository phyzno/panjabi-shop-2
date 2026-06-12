"use client";

import React, { useState, useTransition } from "react";
import { updateSiteSettings } from "@/lib/actions/settings.actions";
import { addCategory, deleteCategory, updateCategory } from "@/lib/actions/category.actions";
import { Plus, Trash2, Megaphone, Shirt, Palette, Loader2, Check, ChevronRight, ChevronDown, Folder, Edit2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsFormClient({ initialSettings, initialCategories }: { initialSettings: any, initialCategories: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newOffer, setNewOffer] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const currentOffers = initialSettings?.offers || [];
  const activeOfferId = initialSettings?.active_offer_id || "";
  const currentColors = initialSettings?.fabric_colors || [];
  const currentPatterns = initialSettings?.fabric_patterns || [];
  const isOfferLiveGlobally = activeOfferId !== "";
  const [selectedParentId, setSelectedParentId] = useState<number | "">("");
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedCats);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCats(newSet);
  };

  const handleAddSubcategoryClick = (parentId: number) => {
    setSelectedParentId(parentId);
    setExpandedCats(prev => new Set(prev).add(parentId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditing = (cat: any) => {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
  };

  const saveEditCategory = (id: number) => {
    if (!editCategoryName.trim()) return;
    startTransition(async () => {
      const res = await updateCategory(id, editCategoryName.trim());
      if (res.success) {
        setEditingCategoryId(null);
        router.refresh();
      }
    });
  };
  const buildCategoryTree = (categories: any[]) => {
    const map = new Map();
    const tree: any[] = [];
    categories.forEach(c => map.set(c.id, { ...c, children: [] }));
    categories.forEach(c => {
      if (c.parent_id) {
        const parent = map.get(c.parent_id);
        if (parent) parent.children.push(map.get(c.id));
      } else {
        tree.push(map.get(c.id));
      }
    });
    return tree;
  };
  const categoryTree = buildCategoryTree(initialCategories);
  const renderCategoryOptions = (cats: any[], prefix = "") => {
    return cats.map((cat) => (
      <React.Fragment key={`opt-${cat.id}`}>
        <option value={cat.id}>{prefix} {cat.name}</option>
        {cat.children && cat.children.length > 0 && renderCategoryOptions(cat.children, prefix + "— ")}
      </React.Fragment>
    ));
  };
  const renderVSCodeTree = (cats: any[], depth = 0) => {
    return cats.map((cat) => {
      const isExpanded = expandedCats.has(cat.id);
      const isEditing = editingCategoryId === cat.id;
      const hasChildren = cat.children && cat.children.length > 0;

      return (
        <div key={`tree-${cat.id}`} className="w-full">
          <div 
            className={`flex items-center justify-between py-2 px-3 border-b border-border/50 hover:bg-secondary/50 group transition-colors ${depth === 0 ? 'bg-background' : 'bg-secondary/10'}`}
            style={{ paddingLeft: `${(depth * 1.5) + 0.5}rem` }}
          >
            <div className="flex items-center gap-2 flex-1">
              <button onClick={() => toggleExpand(cat.id)} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                 {hasChildren ? (
                   isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                 ) : (
                   <span className="w-3.5 h-[1px] bg-border/80 inline-block" />
                 )}
              </button>

              {isEditing ? (
                 <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                   <input autoFocus value={editCategoryName} onChange={e => setEditCategoryName(e.target.value)} disabled={isPending} className="w-full bg-background border border-primary px-2 py-1 text-sm rounded outline-none" />
                   <button onClick={() => saveEditCategory(cat.id)} disabled={isPending} className="text-green-600 hover:bg-green-50 p-1 rounded cursor-pointer"><Check size={14}/></button>
                   <button onClick={() => setEditingCategoryId(null)} disabled={isPending} className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"><X size={14}/></button>
                 </div>
              ) : (
                 <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleExpand(cat.id)}>
                   <Folder size={14} className="text-accent shrink-0" fill="currentColor" fillOpacity={0.2} />
                   <span className="text-sm font-sans font-medium text-foreground">{cat.name}</span>
                   <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[120px]">/{cat.slug}</span>
                 </div>
              )}
            </div>

            {!isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleAddSubcategoryClick(cat.id)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded cursor-pointer" title="Add Subcategory"><Plus size={14}/></button>
                <button onClick={() => startEditing(cat)} className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-secondary rounded cursor-pointer" title="Edit Name"><Edit2 size={14}/></button>
                <button onClick={() => handleRemoveCategory(cat.id)} disabled={isPending} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded cursor-pointer disabled:opacity-50" title="Delete"><Trash2 size={14}/></button>
              </div>
            )}
          </div>

          {isExpanded && hasChildren && (
            <div className="w-full border-l border-border/50 ml-[1.125rem]">
              {renderVSCodeTree(cat.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  const handleToggleGlobalOffer = () => {
    startTransition(async () => {
      if (isOfferLiveGlobally) {
        await updateSiteSettings({ active_offer_id: "" });
      } else {
        const firstOfferId = currentOffers.length > 0 ? currentOffers[0].id : "";
        await updateSiteSettings({ active_offer_id: firstOfferId });
      }
      router.refresh();
    });
  };

  const handleAddOffer = () => {
    if (!newOffer.trim()) return;
    startTransition(async () => {
      const updatedOffers = [...currentOffers, { id: Date.now().toString(), text: newOffer.trim() }];
      const res = await updateSiteSettings({ offers: updatedOffers });
      if (res.success) {
        setNewOffer("");
        router.refresh();
      } else {
        console.error(res.error);
      }
    });
  };

  const handleDeleteOffer = (id: string) => {
    startTransition(async () => {
      const updatedOffers = currentOffers.filter((o: any) => o.id !== id);
      let nextActiveId = activeOfferId;

      if (activeOfferId === id) {
        nextActiveId = "";
      }

      const res = await updateSiteSettings({ offers: updatedOffers, active_offer_id: nextActiveId });
      if (res.success) {
        router.refresh();
      }
    });
  };

  const handleSetLiveOffer = (id: string) => {
    startTransition(async () => {
      const res = await updateSiteSettings({ active_offer_id: id });
      if (res.success) {
        router.refresh();
      }
    });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    startTransition(async () => {
      const res = await addCategory({ 
        name: newCategoryName.trim(), 
        parent_id: selectedParentId ? Number(selectedParentId) : null
      });
      if (res.success) {
        setNewCategoryName("");
        setSelectedParentId(""); 
        router.refresh();
      } else {
        console.error(res.error);
      }
    });
  };

  const handleRemoveCategory = (id: number) => {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.success) {
        router.refresh();
      }
    });
  };

  const handleAddColor = () => {
    if (!newColor.trim() || currentColors.includes(newColor.trim())) return;
    startTransition(async () => {
      const updated = [...currentColors, newColor.trim()];
      const res = await updateSiteSettings({ fabric_colors: updated });
      if (res.success) {
        setNewColor("");
        router.refresh();
      }
    });
  };

  const handleRemoveColor = (colorName: string) => {
    startTransition(async () => {
      const updated = currentColors.filter((c: string) => c !== colorName);
      const res = await updateSiteSettings({ fabric_colors: updated });
      if (res.success) {
        router.refresh();
      }
    });
  };

  const handleAddPattern = () => {
    if (!newPattern.trim() || currentPatterns.includes(newPattern.trim())) return;
    startTransition(async () => {
      const updated = [...currentPatterns, newPattern.trim()];
      const res = await updateSiteSettings({ fabric_patterns: updated });
      if (res.success) {
        setNewPattern("");
        router.refresh();
      }
    });
  };

  const handleRemovePattern = (patternName: string) => {
    startTransition(async () => {
      const updated = currentPatterns.filter((p: string) => p !== patternName);
      const res = await updateSiteSettings({ fabric_patterns: updated });
      if (res.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6 md:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
          <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
            <Megaphone size={20} /> Header Announcement Offers
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-sm font-sans text-muted-foreground font-medium">
              {isOfferLiveGlobally ? "Offer Bar is Live" : "Offer Bar is Hidden"}
            </span>
            <button
              onClick={handleToggleGlobalOffer}
              disabled={isPending || currentOffers.length === 0}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isOfferLiveGlobally ? "bg-primary" : "bg-secondary border border-border"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOfferLiveGlobally ? "translate-x-6" : "translate-x-1"
                  } ${!isOfferLiveGlobally && "shadow-sm border border-border/50"}`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newOffer}
            onChange={(e) => setNewOffer(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Eid Special: Get 10% off on all Punjabi sets!"
            className="flex-grow border border-border bg-secondary/30 rounded-md px-4 py-3 outline-none text-sm font-sans disabled:opacity-50"
          />
          <button onClick={handleAddOffer} disabled={isPending} className="w-full sm:w-auto bg-primary text-white px-5 py-3 sm:py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-sans text-sm font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Offer
          </button>
        </div>

        <div className="space-y-3">
          {currentOffers.map((offer: any) => {
            const isLive = activeOfferId === offer.id;
            return (
              <div key={offer.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 sm:gap-2 border rounded-md transition-all ${isLive ? 'border-primary bg-secondary/40 ring-1 ring-primary/20' : 'border-border bg-background'}`}>
                <span className="text-sm font-sans text-foreground">{offer.text}</span>
                <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t border-border sm:border-0">
                  <button
                    onClick={() => handleSetLiveOffer(offer.id)}
                    disabled={isPending || isLive}
                    className={`w-full sm:w-auto justify-center px-3 py-1.5 rounded text-xs font-sans flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isLive ? 'bg-primary text-white' : 'bg-secondary hover:bg-primary text-muted-foreground hover:text-white border border-border'}`}
                  >
                    {isLive ? <><Check size={12} /> Live Now</> : "Make Live"}
                  </button>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    disabled={isPending}
                    className="w-full sm:w-auto flex justify-center items-center gap-1.5 px-3 py-1.5 rounded text-xs font-sans border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
          <Shirt size={20} /> Product Categories
        </h2>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            {/* Parent Category Selection Dropdown */}
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isPending}
              className="w-full sm:w-1/3 border border-border bg-secondary/30 rounded-md px-3 py-2 outline-none text-sm font-sans disabled:opacity-50 cursor-pointer"
            >
              <option value="">No Parent (Root)</option>
              {renderCategoryOptions(categoryTree)}
            </select>

            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={isPending}
              placeholder="New Category Name (e.g. Premium)"
              className="flex-grow border border-border bg-secondary/30 rounded-md px-4 py-2 outline-none text-sm font-sans disabled:opacity-50"
            />
            <button onClick={handleCreateCategory} disabled={isPending} className="w-full sm:w-auto bg-primary text-white px-5 py-3 sm:py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center font-sans text-sm font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add</>}
            </button>
          </div>
        </div>

        {/* Tree Structured Category List */}
        <div className="pt-2 max-h-[350px] overflow-y-auto pr-1">
          {categoryTree.length > 0 ? (
            renderVSCodeTree(categoryTree)
          ) : (
            <p className="text-sm text-muted-foreground p-4 text-center italic">No categories found.</p>
          )}
        </div>
      </div>

      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
        <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
          <Palette size={20} /> Fabric Options Builder
        </h2>

        <div className="space-y-3">
          <label className="block text-xs font-heading font-bold text-primary uppercase tracking-wider">Manage Colors Checklist</label>
          <div className="flex gap-2">
            <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} disabled={isPending} placeholder="e.g. Royal Blue" className="flex-grow border border-border bg-secondary/30 rounded-md px-3 py-1.5 outline-none text-xs font-sans disabled:opacity-50" />
            <button onClick={handleAddColor} disabled={isPending} className="bg-accent text-white px-3 rounded-md hover:bg-accent/90 text-xs font-sans font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentColors.map((color: string) => (
              <span key={color} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-primary text-sm rounded-md font-sans">
                {color}
                <button onClick={() => handleRemoveColor(color)} disabled={isPending} className="text-muted-foreground hover:text-red-500 text-[19px] ml-2 font-sans font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <label className="block text-xs font-heading font-bold text-primary uppercase tracking-wider">Manage Patterns Checklist</label>
          <div className="flex gap-2">
            <input type="text" value={newPattern} onChange={(e) => setNewPattern(e.target.value)} disabled={isPending} placeholder="e.g. Silk, Geometic" className="flex-grow border border-border bg-secondary/30 rounded-md px-3 py-1.5 outline-none text-xs font-sans disabled:opacity-50" />
            <button onClick={handleAddPattern} disabled={isPending} className="bg-accent text-white px-3 rounded-md hover:bg-accent/90 text-xs font-sans font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentPatterns.map((pattern: string) => (
              <span key={pattern} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border text-primary text-sm rounded-md font-sans">
                {pattern}
                <button onClick={() => handleRemovePattern(pattern)} disabled={isPending} className="text-muted-foreground hover:text-red-500 text-[19px] ml-2 font-sans font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}