import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3 text-primary">How do I take measurements?</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can follow our video guide on the customization page, or visit any local tailor and provide our measurement sheet. Alternatively, select a &quot;Standard Size&quot; if you are confident in your fit.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3 text-primary">What is the delivery time?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Standard delivery takes 7-10 business days for custom stitched items. Express delivery (5 days) is available for an additional charge.
          </p>
        </section>
      </div>
      <div className="mt-12">
        <Link href="/" className="text-primary font-bold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
