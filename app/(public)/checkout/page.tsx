'use client';

import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { placeOrder } from '@/lib/actions/orders';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');

  if (items.length === 0) {
    if (typeof window !== 'undefined') router.push('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const delivery = subtotal > 2000 ? 0 : 60;
  const total = subtotal + delivery;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const orderData = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        city: selectedCity, // Use the state instead of formData
        email: formData.get('email') as string || undefined,
        items,
        subtotal,
        delivery,
        total,
      };

      const orderNumber = await placeOrder(orderData);
      clearCart();
      router.push(`/order-confirmation/${orderNumber}`);
    } catch (error) {
      console.error(error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
    'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur',
    'Chapainawabganj', 'Chuadanga', 'Cumilla', 'Cox\'s Bazar', 'Dinajpur', 'Faridpur', 'Feni',
    'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah',
    'Joypurhat', 'Khagrachhari', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat',
    'Madaripur', 'Magura', 'Manikganj', 'Maulvibazar', 'Meherpur', 'Munshiganj', 'Naogaon', 'Narail',
    'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh',
    'Patuakhali', 'Pirojpur', 'Rajbari', 'Rangamati', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj',
    'Sunamganj', 'Tangail', 'Thakurgaon'
  ];

  return (
    <div className="container mx-auto px-4 py-12 bg-[#FAF7F2] min-h-screen">
      <h1 className="font-heading text-4xl font-bold mb-10 text-center">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">

        {/* LEFT: Forms */}
        <div className="lg:w-[60%] space-y-8">

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-sans">1</span>
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700" htmlFor="name">Full Name</label>
                <input required id="name" name="name" type="text" placeholder="John Doe" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700" htmlFor="phone">Phone (01XXXXXXXXX)</label>
                <input required id="phone" name="phone" type="tel" pattern="^01[3-9]\d{8}$" placeholder="01712345678" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700" htmlFor="email">Email (Optional)</label>
                <input id="email" name="email" type="email" placeholder="john@example.com" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-sans">2</span>
              Delivery Address
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700" htmlFor="address">Full Address</label>
                <textarea required id="address" name="address" rows={3} placeholder="House, Road, Area, Thana..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">City/District</label>
                <Select required value={selectedCity} onValueChange={(val) => setSelectedCity(val || '')}>
                  <SelectTrigger className="w-full h-12 bg-white border-gray-300">
                    <SelectValue placeholder="Select District..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {districts.sort().map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" required name="city" value={selectedCity} />
              </div>
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary hover:bg-[#8B2222] text-white font-bold text-lg py-4 rounded-xl shadow-md transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
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
