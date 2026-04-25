"use client";

import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const delivery = subtotal > 2000 ? 0 : 60;
  const total = subtotal + delivery;
  const advance = Math.round(total * 0.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate order placement
    const orderId = `PS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    clearCart();
    router.push(`/order-confirmation/${orderId}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-[#FAF7F2] min-h-screen">
      <h1 className="font-heading text-4xl font-bold mb-10 text-center">Checkout</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        
        {/* LEFT: Forms */}
        <div className="lg:w-[60%] space-y-8">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span>
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone (01XXXXXXXXX)</label>
                <input required type="tel" pattern="^01[3-9]\d{8}$" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Email (Optional)</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">2</span>
              Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                <textarea required rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">City/District</label>
                <select required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                  <option value="">Select District...</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">3</span>
              Payment Method
            </h2>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-sm text-amber-800">
              <p>⚠️ Custom stitched items require a 30% advance payment (৳{advance}) via bKash or Nagad before we start stitching.</p>
            </div>
            
            <div className="space-y-4">
              <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-pink-500" />
                  <span className="font-bold text-lg">bKash</span>
                </div>
                {paymentMethod === 'bkash' && (
                  <div className="mt-4 pl-8">
                    <p className="text-sm mb-2 text-gray-600">Send <b>৳{advance}</b> to <b>01XXXXXXXXX</b> (Personal)</p>
                    <input type="text" placeholder="Enter Transaction ID" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-pink-500 outline-none" />
                  </div>
                )}
              </label>

              <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-lg">Nagad</span>
                </div>
                {paymentMethod === 'nagad' && (
                  <div className="mt-4 pl-8">
                    <p className="text-sm mb-2 text-gray-600">Send <b>৳{advance}</b> to <b>01XXXXXXXXX</b> (Personal)</p>
                    <input type="text" placeholder="Enter Transaction ID" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                  </div>
                )}
              </label>
            </div>
          </div>
          
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:w-[40%]">
          <div className="bg-white border border-border rounded-2xl p-8 sticky top-24 shadow-lg">
            <h2 className="font-heading text-2xl font-bold mb-6">Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-gray-800 line-clamp-1">{item.productName}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.fabricName}</p>
                  </div>
                  <span className="font-medium">৳{item.total}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>{delivery === 0 ? 'Free' : `৳${delivery}`}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-lg">Total</span>
                <span className="font-heading text-3xl font-bold text-primary">৳{total}</span>
              </div>
              <div className="flex justify-between items-end text-sm text-gray-500">
                <span>Advance Required</span>
                <span className="font-bold text-amber-600">৳{advance}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-[#8B2222] text-white font-bold text-lg py-4 rounded-xl shadow-md transition-colors">
              Place Order
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              By placing your order, you agree to our Terms & Conditions.
            </p>
          </div>
        </div>
        
      </form>
    </div>
  );
}
