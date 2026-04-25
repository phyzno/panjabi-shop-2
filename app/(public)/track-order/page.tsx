import Link from 'next/link';

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <h1 className="font-heading text-4xl font-bold mb-4">Track Your Order</h1>
      <p className="text-muted-foreground mb-10">Enter your order number to see the current status of your Panjabi.</p>
      
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-border">
        <input 
          type="text" 
          placeholder="Order Number (e.g. PJ-1234)" 
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-primary outline-none"
        />
        <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-[#8B2222] transition-colors">
          Track Now
        </button>
      </div>
      
      <div className="mt-12">
        <Link href="/" className="text-primary font-bold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
