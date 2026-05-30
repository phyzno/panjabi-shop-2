import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Returns & Exchanges</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-6">
          Since our items are custom-stitched strictly to your measurements, we have a specific return and exchange policy.
        </p>
        
        <h2 className="text-xl text-primary mt-8 mb-4">Our Policy Guidelines ➔</h2>
        <ul className="list-decimal pl-6 space-y-6 text-muted-foreground">
          
          {/* Point 1: Measurement Correction */}
          <li>
            <strong className="text-foreground font-normal text-lg mb-2 flex items-center gap-2">
              <span>✅</span> Measurement Correction
            </strong>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground mt-2">
              <li>If the Panjabi doesn&apos;t fit due to a tailoring mistake on our end, we will fix it entirely for free.</li>
              <li>Please notify us within 3 days of receiving the product to claim a free correction.</li>
            </ul>
          </li>

          {/* Point 2: No Refunds */}
          <li>
            <strong className="text-foreground font-normal text-lg mb-2 flex items-center gap-2">
              <span>❌</span> No Refunds
            </strong>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground mt-2">
              <li>We do not offer cash refunds for custom-tailored items once the production has started.</li>
              <li>As each piece is made specifically for you, it cannot be resold to others.</li>
            </ul>
          </li>
          
          {/* Point 3: Damaged or Defective Items (অতিরিক্ত একটি পয়েন্ট যুক্ত করা হয়েছে প্রফেশনাল লুকের জন্য) */}
          <li>
            <strong className="text-foreground font-normal text-lg mb-2 flex items-center gap-2">
              <span>📦</span> Damaged or Defective Items
            </strong>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground mt-2">
              <li>If you receive a defective fabric or incorrect product, contact us immediately with unboxing proof.</li>
              <li>We will arrange a replacement at no additional cost to you.</li>
            </ul>
          </li>

        </ul>
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <Link href="/" className="text-primary underline text-lg hover:underline flex items-center gap-2 w-fit">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}