"use client";

import React, { useState, useTransition } from "react";
import { updateSiteSettings } from "@/lib/actions/settings.actions";
import { addCategory, deleteCategory } from "@/lib/actions/category.actions";
import { Plus, Trash2, Megaphone, Shirt, Palette, Loader2, Check } from "lucide-react";
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
      const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const res = await addCategory({ name: newCategoryName.trim(), slug });
      if (res.success) {
        setNewCategoryName("");
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
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Wedding, Premium, Casual"
            className="flex-grow border border-border bg-secondary/30 rounded-md px-4 py-2 outline-none text-sm font-sans disabled:opacity-50"
          />
          <button onClick={handleCreateCategory} disabled={isPending} className="w-full sm:w-auto bg-primary text-white px-5 py-3 sm:py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center font-sans text-sm font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add</>}
          </button>
        </div>
        <div className="divide-y divide-border pt-2 max-h-[250px] overflow-y-auto pr-1">
          {initialCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between py-3">
              <div>
                <span className="text-md font-sans text-foreground">{cat.name}</span>
                <span className="text-xs text-muted-foreground block font-sans">Slug: {cat.slug}</span>
              </div>
              <button onClick={() => handleRemoveCategory(cat.id)} disabled={isPending} className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
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