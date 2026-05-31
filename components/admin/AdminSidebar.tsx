"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, Shirt, Palette, Settings, Menu, X, LogOut, Star, Package, 
  ChevronLeft, ChevronRight
} from "lucide-react";
import { logoutAdmin } from "@/lib/actions/admin";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { id: "orders", label: "Manage Orders", icon: ShoppingBag, href: "/admin/orders" },
    { id: "featured", label: "Featured", icon: Star, href: "/admin/featured" },
    { id: "products", label: "Products", icon: Shirt, href: "/admin/products" },
    { id: "fabrics", label: "Fabrics", icon: Palette, href: "/admin/fabrics" },
    { id: "stock", label: "Stock", icon: Package, href: "/admin/stock" },
    { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-background border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-heading text-primary font-bold">
            PANJABI <span className="text-accent">ADMIN</span>
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-primary hover:bg-secondary rounded-md transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 bg-background border-r border-border flex flex-col shadow-2xl md:shadow-none transition-all duration-300 ease-in-out
        md:static md:translate-x-0 md:flex-none md:shrink-0 md:min-h-screen
        ${isOpen ? "translate-x-0 w-[260px]" : "-translate-x-full"}
        ${isCollapsed ? "md:w-[88px]" : "md:w-[260px]"} 
      `}
      >
        <div className={`border-b border-border flex flex-col items-center relative shrink-0 transition-all duration-300 ${isCollapsed ? 'p-4 md:py-8' : 'p-8'}`}>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-muted-foreground md:hidden hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>

          {!isCollapsed ? (
             <>
               <h2 className="text-2xl font-heading font-bold text-primary tracking-wide mt-2 whitespace-nowrap">
                 PANJABI <span className="text-accent">ADMIN</span>
               </h2>
               <span className="text-xs font-sans text-muted-foreground uppercase tracking-widest mt-2">
                 Control Panel
               </span>
             </>
          ) : (
             <h2 className="text-2xl font-heading font-bold text-primary tracking-wide mt-2 hidden md:block">
               P<span className="text-accent">A</span>
             </h2>
          )}
        </div>

        <nav className="flex-grow py-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.label : ""}
                className={`w-full flex items-center transition-all border-l-4 group ${isCollapsed ? 'justify-center px-0 py-4' : 'gap-4 px-8 py-4'} ${
                  isActive
                    ? "bg-secondary border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                }`}
              >
                <item.icon
                  size={20}
                  className={`transition-colors shrink-0 ${isActive ? "text-primary" : "group-hover:text-primary"}`}
                />
                <span className={`text-sm font-sans font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border shrink-0 flex flex-col gap-3">
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full py-3 bg-background border border-border text-muted-foreground hover:bg-secondary hover:text-primary hover:border-primary/50 transition-all rounded-md font-sans text-sm items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isCollapsed ? (
               <ChevronRight size={20} />
            ) : (
               <>
                 <ChevronLeft size={20} className="shrink-0" />
                 <span>Collapse Menu</span>
               </>
            )}
          </button>

          <button
            onClick={async () => await logoutAdmin()}
            className={`w-full py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-md font-sans text-sm font-medium flex items-center justify-center gap-2 cursor-pointer ${isCollapsed ? 'px-0' : 'px-4'}`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>

        </div>
      </aside>
    </>
  );
}