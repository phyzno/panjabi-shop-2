import Link from 'next/link';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#C9A84C] mb-6">Panjabi Shop</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium custom tailored Panjabi stitched to your exact measurements. Experience the finest South Asian luxury fashion from Bangladesh.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A84C] hover:text-white transition-colors text-xs font-bold">
                FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A84C] hover:text-white transition-colors text-xs font-bold">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A84C] hover:text-white transition-colors">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-gray-400 hover:text-[#C9A84C] transition-colors">Shop Collection</Link></li>
              <li><Link href="/customize/new" className="text-gray-400 hover:text-[#C9A84C] transition-colors">Custom Tailoring</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-[#C9A84C] transition-colors">About Us</Link></li>
              <li><Link href="/track-order" className="text-gray-400 hover:text-[#C9A84C] transition-colors">Track Order</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-[#C9A84C] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-6">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-gray-400 hover:text-[#C9A84C] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-[#C9A84C] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-[#C9A84C] transition-colors">Return Policy</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-[#C9A84C] transition-colors">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-[#C9A84C] shrink-0 mt-1" />
                <span className="text-gray-400">123 Premium Fashion Ave, Gulshan, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-[#C9A84C] shrink-0" />
                <span className="text-gray-400">+880 1XXX XXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-[#C9A84C] shrink-0" />
                <span className="text-gray-400">support@panjabishop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Panjabi Shop. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="bg-white/10 px-3 py-1 rounded text-xs font-semibold">bKash</span>
            <span className="bg-white/10 px-3 py-1 rounded text-xs font-semibold">Nagad</span>
            <span className="bg-white/10 px-3 py-1 rounded text-xs font-semibold">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
