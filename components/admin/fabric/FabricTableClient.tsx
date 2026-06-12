"use client";

import React, { useState, useTransition } from "react";
import { Search, Plus, Trash2, Edit3, Palette, Loader2, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteFabric } from "@/lib/actions/fabric.actions";

export default function FabricTableClient({ fabrics }: { fabrics: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.id.toString().includes(searchTerm)
  );

  const handleDelete = async (id: string, textureUrl?: string, rawImageUrl?: string) => {
    if (!window.confirm("Are you sure you want to delete this fabric permanently?")) return;

    setDeletingId(id);
    try {
      const imageUrls = [textureUrl, rawImageUrl].filter(Boolean) as string[];
      const res = await deleteFabric(id, imageUrls);

      if (res.success) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || "Failed to delete fabric");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderActionMenu = (fabric: any) => (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpenDropdownId(openDropdownId === fabric.id ? null : fabric.id)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {openDropdownId === fabric.id && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpenDropdownId(null)}
          />
          <div className="absolute right-0 mt-1 w-36 bg-background border border-border rounded-md shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-100">
            <Link
              href={`/admin/fabrics/edit/${fabric.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => setOpenDropdownId(null)}
            >
              <Edit3 size={16} /> Edit
            </Link>
            <button
              onClick={() => {
                setOpenDropdownId(null);
                handleDelete(fabric.id, fabric.texture_url, fabric.raw_image_url);
              }}
              disabled={deletingId === fabric.id}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === fabric.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-background border border-border p-6 shadow-sm rounded-lg gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Manage Fabrics</h1>
          <p className="text-sm font-sans text-muted-foreground mt-1">
            Manage your customization fabric materials, prices, and textures.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 order-2 md:order-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-secondary/50 outline-none focus:ring-2 focus:ring-primary font-sans text-sm"
            />
          </div>

          <Link
            href="/admin/fabrics/new"
            className="w-full sm:w-auto bg-primary text-white px-6 py-2 font-sans text-sm font-medium rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm active:scale-95 whitespace-nowrap order-1 md:order-2"
          >
            <Plus size={18} /> Add New
          </Link>
        </div>
      </div>

      <div className="hidden md:block bg-background border border-border rounded-lg shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100dvh-220px)] w-full">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-secondary border-b border-border sticky top-0 z-10">
                <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider whitespace-nowrap">Texture</th>
                <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider min-w-[200px]">Fabric Name</th>
                <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider whitespace-nowrap">Price/Yard</th>
                <th className="px-6 py-4 text-xs font-heading font-bold text-primary uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFabrics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <p className="text-muted-foreground font-sans text-sm italic">
                      {searchTerm ? `No fabrics found for "${searchTerm}"` : "No fabrics found. Click 'Add New' to start."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFabrics.map((fabric) => (
                  <tr key={fabric.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <div className="w-12 h-14 rounded-md overflow-hidden bg-secondary border border-border shrink-0 relative">
                        {fabric.texture_url ? (
                          <Image src={fabric.texture_url} alt={fabric.name} width={48} height={56} className="w-full h-full object-cover" />
                        ) : (
                          <Palette className="w-full h-full p-3 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="font-sans text-sm text-foreground line-clamp-2">{fabric.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ID: {fabric.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle font-sans text-primary whitespace-nowrap">৳ {fabric.price}</td>
                    <td className="px-6 py-4 align-middle text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/fabrics/edit/${fabric.id}`} className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors cursor-pointer">
                          <Edit3 size={18} />
                        </Link>

                        <button
                          onClick={() => handleDelete(fabric.id, fabric.texture_url, fabric.raw_image_url)}
                          disabled={deletingId === fabric.id}
                          className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {deletingId === fabric.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="block md:hidden space-y-4 overflow-x-auto overflow-y-auto max-h-[calc(100dvh-195px)] w-full">
        {filteredFabrics.length === 0 ? (
          <div className="bg-background border border-border p-12 text-center rounded-lg shadow-sm">
            <p className="text-muted-foreground font-sans text-sm italic">
              {searchTerm ? `No fabrics found for "${searchTerm}"` : "No fabrics found."}
            </p>
          </div>
        ) : (
          filteredFabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="bg-background border border-border rounded-lg p-4 flex gap-4 relative shadow-sm hover:border-muted-foreground/30 transition-colors"
            >
              <div className="w-16 h-20 rounded-md overflow-hidden bg-secondary border border-border shrink-0 relative">
                {fabric.texture_url ? (
                  <Image
                    src={fabric.texture_url}
                    alt={fabric.name}
                    width={64}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Palette className="w-full h-full p-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-sans text-sm font-medium text-foreground line-clamp-2 leading-snug">
                  {fabric.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {fabric.id}
                </p>
                <p className="font-sans text-primary text-base mt-2">৳ {fabric.price}</p>
              </div>

              <div className="absolute top-2 right-2">
                {renderActionMenu(fabric)}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
