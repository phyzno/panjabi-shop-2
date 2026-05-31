"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Search, User, ShoppingCart, Menu, X, LayoutDashboard, Package, Ruler, Heart, LogOut } from "lucide-react";

interface HeaderProps {
  activeOfferText?: string | null;
}

function notifyAuthChange() {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('panjabi-shop-auth');
      channel.postMessage({ type: 'auth-changed', at: Date.now() });
      channel.close();
    }

    localStorage.setItem('panjabi-shop-auth-event', String(Date.now()));
  } catch {
  }
}

export function Header({ activeOfferText }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Customize", href: "/customize/new" },
    { name: "Contact", href: "/contact" },
  ];
  const { items, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { user, setUser } = useAuthStore();
  const supabase = createClient();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showMobileAccount, setShowMobileAccount] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleLogout = async () => {
  setIsUserDropdownOpen(false);
  setShowMobileAccount(false);
  setIsMobileMenuOpen(false);
  
  setUser(null); 
  
  await supabase.auth.signOut();
  notifyAuthChange();
};
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isUserDropdownOpen && !(e.target as Element).closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserDropdownOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const showScrolledStyle = !isHomePage || isScrolled;

  return (
    <>
      <div className={isHomePage ? "absolute top-0 left-0 w-full z-50" : "relative w-full z-50"}>

        {activeOfferText && (
          <div className="bg-[#1A1A1A] text-[#C9A84C] text-xs py-2 px-4 text-center font-medium tracking-wide">
            {activeOfferText}
          </div>
        )}

        <header
          className={`w-full transition-colors duration-300 border-b ${isScrolled
            ? "fixed top-0 left-0 z-50 bg-background/90 backdrop-blur-lg border-border/50 shadow-sm"
            : isHomePage
              ? "absolute top-full left-0 bg-transparent border-transparent"
              : "relative bg-background/90 backdrop-blur-lg border-border/50 shadow-sm"
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

            <div className="md:hidden flex flex-1 items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`focus:outline-none ${showScrolledStyle ? "text-foreground hover:text-primary" : "text-white hover:text-neutral-300"
                  }`}
                aria-label="Open Menu"
              >
                <Menu className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            <div className="flex-1 md:flex-none text-center md:text-left">
              <Link
                href="/"
                className={`font-heading text-2xl md:text-3xl font-bold tracking-[0.15em] flex items-center justify-center md:justify-start uppercase transition-colors duration-300 ${showScrolledStyle ? "text-primary" : "text-[#B5C18E]"
                  }`}
              >
                Panjabi<span className="text-accent text-4xl leading-none font-sans">.</span>
              </Link>
            </div>

            <nav className="hidden md:flex flex-1 items-center justify-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-2 text-[13px] font-medium uppercase tracking-[0.15em] font-sans transition-colors duration-300 group ${showScrolledStyle ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white"
                    }`}
                >
                  {link.name}
                  <span className="absolute left-1/2 bottom-0 w-0 h-[1.5px] bg-accent transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                </Link>
              ))}
            </nav>

            <div className={`flex flex-1 md:flex-none items-center justify-end space-x-5 sm:space-x-6 transition-colors duration-300 ${showScrolledStyle ? "text-foreground" : "text-white"
              }`}>
              <button className={`transition-colors duration-300 hidden sm:block focus:outline-none ${showScrolledStyle ? "hover:text-primary" : "hover:text-neutral-300"
                }`}>
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>
              <div className="relative hidden sm:block user-dropdown-container">
                {!mounted ? (
                  <div className="w-5 h-5" />
                ) : user ? (
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={`transition-colors duration-300 focus:outline-none flex items-center cursor-pointer ${showScrolledStyle || isUserDropdownOpen ? "text-primary" : "text-neutral-300 hover:text-white"
                      }`}
                  >
                    <User className="w-5 h-5 stroke-[1.5]" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className={`transition-colors duration-300 focus:outline-none flex items-center cursor-pointer ${showScrolledStyle ? "hover:text-primary" : "text-neutral-300 hover:text-white"}`}
                  >
                    <User className="w-5 h-5 stroke-[1.5]" />
                  </button>
                )}

                {isUserDropdownOpen && user && (
                  <div className="absolute right-0 mt-5 w-60 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[#D4D7C9] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]"><div className="px-5 py-3 border-b border-[#D4D7C9]/40 mb-1 bg-[#F8F9F5]">
                    <p className="font-heading text-sm font-bold text-[#17210C] uppercase tracking-wider">My Account</p>
                    <p className="font-sans text-xs text-[#1C221A]/60 truncate mt-0.5">{user.email}</p>
                  </div>
                    <div className="flex flex-col">
                      <Link href="/dashboard" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8F9F5] text-[#1C221A] transition-colors group">
                        <LayoutDashboard className="w-4 h-4 text-[#1C221A]/50 group-hover:text-[#4A5D23]" />
                        <span className="font-sans text-xs uppercase tracking-widest font-medium">My Dashboard</span>
                      </Link>
                      <Link href="/dashboard/orders" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8F9F5] text-[#1C221A] transition-colors group">
                        <Package className="w-4 h-4 text-[#1C221A]/50 group-hover:text-[#4A5D23]" />
                        <span className="font-sans text-xs uppercase tracking-widest font-medium">My Orders</span>
                      </Link>
                      <Link href="/dashboard/measurements" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8F9F5] text-[#1C221A] transition-colors group">
                        <Ruler className="w-4 h-4 text-[#1C221A]/50 group-hover:text-[#4A5D23]" />
                        <span className="font-sans text-xs uppercase tracking-widest font-medium">Measurements</span>
                      </Link>
                      <Link href="/dashboard/wishlist" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8F9F5] text-[#1C221A] transition-colors group">
                        <Heart className="w-4 h-4 text-[#1C221A]/50 group-hover:text-[#4A5D23]" />
                        <span className="font-sans text-xs uppercase tracking-widest font-medium">My Wishlist</span>
                      </Link>
                      <div className="border-t border-[#D4D7C9]/40 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 text-red-600 transition-colors group cursor-pointer">
                          <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                          <span className="font-sans text-xs uppercase tracking-widest font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={openCart}
                className={`relative transition-colors duration-300 flex items-center group cursor-pointer ${showScrolledStyle ? "hover:text-primary" : "hover:text-neutral-300"
                  }`}>
                <ShoppingCart className="w-5 h-5 stroke-[1.5]" />

                {mounted && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {!isHomePage && isScrolled && <div className="h-16 w-full" />}

      <div
        className={`fixed inset-0 bg-foreground/40 backdrop-blur-[2px] z-50 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`fixed z-[1001] bottom-0 left-0 w-full bg-background border-t border-border rounded-t-3xl z-[60] flex flex-col h-[85vh] p-6 pb-8 md:hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="w-12 h-1 flex-shrink-0 bg-border rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
          <span className="font-heading text-lg font-bold text-primary uppercase tracking-[0.2em] transition-all duration-300">
            {showMobileAccount ? "My Account" : "Explore"}
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-foreground/60 hover:text-foreground transition-colors p-2 bg-secondary/50 hover:bg-secondary rounded-full"
            aria-label="Close Menu"
          >
            <X className="w-12 h-6 stroke-[1.5]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col font-sans px-2">
          {!showMobileAccount ? (
            <div className="flex flex-col space-y-2 mt-2 animate-in slide-in-from-left-4 duration-300">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between text-[14px] font-medium uppercase tracking-widest text-foreground hover:text-accent transition-all duration-300 border-b border-border/40 py-4 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">{link.name}</span>
                  <span className="text-border group-hover:text-accent transition-colors">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col mt-2 animate-in slide-in-from-right-4 duration-300">

              <button
                onClick={() => setShowMobileAccount(false)}
                className="flex items-center gap-3 text-[14px] uppercase tracking-widest text-foreground/70 hover:text-primary mb-4 pb-4 border-b border-border/40 transition-colors w-full text-left"
              >
                <span className="text-lg leading-none mb-0.5">←</span> Main Menu
              </button>

              <div className="mb-4 p-4 bg-secondary/30 rounded-xl border border-border/50">
                <p className="text-xs text-foreground/60 uppercase tracking-widest mb-1">Logged in as</p>
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              </div>

              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-[13px] font-medium uppercase tracking-widest text-foreground border-b border-border/40 py-4 hover:text-accent">
                <LayoutDashboard className="w-5 h-5 text-foreground/50" /> My Dashboard
              </Link>
              <Link href="/dashboard/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-[13px] font-medium uppercase tracking-widest text-foreground border-b border-border/40 py-4 hover:text-accent">
                <Package className="w-5 h-5 text-foreground/50" /> My Orders
              </Link>
              <Link href="/dashboard/measurements" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-[13px] font-medium uppercase tracking-widest text-foreground border-b border-border/40 py-4 hover:text-accent">
                <Ruler className="w-5 h-5 text-foreground/50" /> Measurements
              </Link>
              <Link href="/dashboard/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-[13px] font-medium uppercase tracking-widest text-foreground border-b border-border/40 py-4 hover:text-accent">
                <Heart className="w-5 h-5 text-foreground/50" /> My Wishlist
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-4 text-[13px] font-medium uppercase tracking-widest text-red-500 py-4 mt-2">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          )}
        </nav>

        <div className="flex items-center justify-around mt-6 pt-6 border-t border-border/40 flex-shrink-0">
          {!mounted ? (
            <div className="w-5 h-5" />
          ) : user ? (
            <button
              onClick={() => setShowMobileAccount(!showMobileAccount)}
              className={`flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${showMobileAccount ? 'text-primary' : 'text-foreground/70 hover:text-primary'}`}
            >
              <User className="w-5 h-5 stroke-[1.5]" />
              Account
            </button>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowLoginModal(true);
              }}
              className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:text-primary focus:outline-none"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
              Login
            </button>
          )}

          <button className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:text-primary">
            <Search className="w-5 h-5 stroke-[1.5]" />
            Search
          </button>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6" onClick={() => setShowLoginModal(false)}>
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
          <div
            className="relative bg-background w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 p-2 bg-secondary/50 rounded-full text-foreground/60 hover:text-red-500 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-wide mb-2 mt-4">Login Required</h3>
            <p className="font-sans text-xs text-foreground/70 mb-6 px-2">
              Please log in to view your dashboard, track orders, and manage your custom measurements.
            </p>
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              onClick={() => setShowLoginModal(false)}
              className="flex items-center justify-center w-full py-3 bg-primary text-primary-foreground rounded-xl font-sans text-[11px] font-medium uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Log In Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
