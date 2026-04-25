import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>1. <b>Advance Payment:</b> A 30% non-refundable advance is required for all custom orders.</p>
        <p>2. <b>Measurements:</b> The customer is responsible for providing accurate measurements.</p>
        <p>3. <b>Fabric:</b> Actual fabric colors may vary slightly from digital previews.</p>
      </div>
      <div className="mt-12">
        <Link href="/" className="text-primary font-bold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
