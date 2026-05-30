'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Ruler, Heart, Menu, X, Scissors, Truck, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Measurements', href: '/dashboard/measurements', icon: Ruler },
  { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
];

const quickLinks = [
  { name: 'Browse Shop', href: '/shop', icon: ShoppingBag },
  { name: 'Customize Panjabi', href: '/customize/new', icon: Scissors },
  { name: 'Track Order', href: '/track-order', icon: Truck },
];

function notifyAuthChange() {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('panjabi-shop-auth');
      channel.postMessage({ type: 'auth-changed', at: Date.now() });
      channel.close();
    }

    localStorage.setItem('panjabi-shop-auth-event', String(Date.now()));
  } catch {
    // Auth is already cleared in this tab; cross-tab fallback can fail silently.
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded, setUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    setUser(null);

    const supabase = createClient();
    await supabase.auth.signOut();

    notifyAuthChange();
    router.replace('/login');
    router.refresh();
  };

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      router.refresh();
    }
  }, [isLoaded, user, pathname, router]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#17210C] font-sans pb-20 md:pb-0 select-none">
      
      {/* Desktop Top Header Container */}
      <header className="hidden md:block bg-white border-b border-[#D4D7C9]/60 sticky top-0 z-40 shadow-[0_4px_20px_rgba(14,20,9,0.02)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="font-heading text-xl font-bold uppercase tracking-widest text-[#17210C]">
            My Atelier
          </Link>
          
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full font-sans text-xs uppercase tracking-wider transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#4A5D23] text-white shadow-md' 
                      : 'text-[#1C221A]/70 hover:bg-[#EBECE3] hover:text-[#4A5D23]'
                  }`}
                >
                  <item.icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-[#D4D7C9]/60 px-5 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link href="/dashboard" className="font-heading text-lg font-bold uppercase tracking-widest text-[#17210C]">
          My Atelier
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-10 h-10 bg-[#F8F9F5] rounded-full flex items-center justify-center text-[#1C221A] border border-[#D4D7C9]/50"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          
          <main className="w-full min-w-0">
            {children}
          </main>

          {/* Right Side: Hidden on mobile (lg:block), visible on desktop */}
          <aside className="hidden lg:block w-full">
            <div className="bg-white rounded-2xl border border-[#D4D7C9]/50 p-6 shadow-sm sticky top-28">
              <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#17210C] mb-5 border-b border-[#D4D7C9]/40 pb-3">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-3">
                {quickLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-[#D4D7C9]/40 hover:border-[#4A5D23] bg-[#F8F9F5] hover:bg-white transition-all group"
                  >
                    <div className="bg-white group-hover:bg-[#4A5D23]/10 p-2 rounded-lg transition-colors">
                      <link.icon className="w-4 h-4 text-[#4A5D23]" />
                    </div>
                    <span className="font-sans text-xs uppercase tracking-wider text-[#1C221A]/80 group-hover:text-[#4A5D23]">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 p-3.5 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-sans text-xs uppercase tracking-wider cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

        </div>
      </div>

      {/* Mobile Bottom Sheet Modal */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#111410]/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        
        <div className={`absolute bottom-0 left-0 w-full bg-white rounded-t-[32px] p-6 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'} flex flex-col max-h-[85vh]`}>
          
          <div className="flex items-center justify-between mb-4 border-b border-[#D4D7C9]/40 pb-4 shrink-0">
            <span className="font-heading text-lg font-bold uppercase tracking-widest text-[#17210C]">
              Menu
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-[#F8F9F5] rounded-full text-[#1C221A]/60">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Scrollable Content Area for smaller phones */}
          <div className="flex flex-col gap-2 pb-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            
            {/* Main Navigation */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-xl font-sans text-xs uppercase tracking-wider transition-all ${
                    isActive 
                      ? 'bg-[#4A5D23] text-white shadow-md' 
                      : 'bg-[#F8F9F5] text-[#1C221A]/80 border border-[#D4D7C9]/40'
                  }`}
                >
                  <item.icon className="w-5 h-5 stroke-[1.5]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="h-px bg-[#D4D7C9]/40 my-3"></div>
            
            {/* Quick Actions Header */}
            <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-[#1C221A]/50 px-2 mb-1">
              Quick Actions
            </span>

            {/* Quick Links Map */}
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 rounded-xl font-sans text-xs uppercase tracking-wider text-[#1C221A]/80 hover:bg-[#F8F9F5] transition-colors"
              >
                <div className="bg-[#F8F9F5] p-2 rounded-lg text-[#4A5D23]">
                  <link.icon className="w-4 h-4" />
                </div>
                <span>{link.name}</span>
              </Link>
            ))}

            <div className="h-px bg-[#D4D7C9]/40 my-3"></div>

            {/* Mobile Sign Out Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 font-sans text-xs uppercase tracking-wider w-full mb-4"
            >
              <LogOut className="w-5 h-5 stroke-[1.5]" />
              <span>Sign Out</span>
            </button>
            
          </div>
        </div>
      </div>

    </div>
  );
}
