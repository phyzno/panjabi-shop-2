import Link from 'next/link';

export const metadata = {
  title: 'Shipping Information',
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Shipping Information</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>We deliver nationwide across Bangladesh using premium courier services.</p>
        <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Delivery Charges</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Inside Dhaka: ৳60</li>
          <li>Outside Dhaka: ৳120</li>
          <li>Free Delivery: On orders above ৳2,000</li>
        </ul>
      </div>
      <div className="mt-12">
        <Link href="/" className="text-primary font-bold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
