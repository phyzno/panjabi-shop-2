import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-6">
          Please read these terms and conditions carefully before placing a custom order with us.
        </p>
        
        <h2 className="text-xl text-primary mt-8 mb-4">General Conditions ➔</h2>
        <ul className="list-decimal pl-6 space-y-6 text-muted-foreground">
          
          {/* Point 1: Advance Payment */}
          <li>
            <strong className="text-foreground font-normal text-lg block mb-2">Advance Payment</strong>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>A 30% non-refundable advance is required for all custom orders.</li>
              <li>Order processing begins only after the advance payment is successfully confirmed.</li>
            </ul>
          </li>

          {/* Point 2: Measurements */}
          <li>
            <strong className="text-foreground font-normal text-lg block mb-2">Measurements</strong>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>The customer is entirely responsible for providing accurate measurements.</li>
              <li>Any alterations required due to incorrect measurements provided by the customer may incur additional charges.</li>
            </ul>
          </li>

          {/* Point 3: Fabric */}
          <li>
            <strong className="text-foreground font-normal text-lg block mb-2">Fabric & Colors</strong>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>Actual fabric colors may vary slightly from digital previews due to screen calibrations.</li>
              <li>Fabric texture and patterns are subject to availability.</li>
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