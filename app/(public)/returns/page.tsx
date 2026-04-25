import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Returns & Exchanges</h1>
      <p className="text-muted-foreground mb-6">Since our items are custom-stitched to your measurements, we have a specific return policy.</p>
      <div className="space-y-4 text-muted-foreground">
        <p>✅ <b>Measurement Correction:</b> If the Panjabi doesn&apos;t fit due to our mistake, we will fix it for free.</p>
        <p>❌ <b>No Refunds:</b> We do not offer cash refunds for custom items once production starts.</p>
      </div>
      <div className="mt-12">
        <Link href="/" className="text-primary font-bold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
