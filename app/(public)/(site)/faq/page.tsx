import Link from 'next/link';

export const metadata = {
  title: 'FAQ',
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-8">
          Find answers to the most common questions about our custom tailoring and delivery process.
        </p>
        
        <div className="space-y-8">
          
          <div>
            <h2 className="text-primary text-xl mb-3 flex items-start gap-2">
              Q1. How do I take measurements?
            </h2>
            <div className="text-muted-foreground ml-7">
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>You can follow our <span className="text-accent underline">video guide</span> on the customization page.</li>
                <li>Visit any local tailor and provide our measurement sheet.</li>
                <li>Alternatively, select a <span className="text-accent underline">&quot;Standard Size&quot;</span> if you are confident in your fit.</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-primary text-xl mb-3 flex items-start gap-2">
              Q2. What is the delivery time?
            </h2>
            <div className="text-muted-foreground ml-7">
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><span className="text-lg underline">Standard delivery:</span> Takes 7-10 business days for custom stitched items.</li>
                <li><span className="text-lg underline">Express delivery:</span> Available within 5 days for an additional charge.</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-primary text-xl mb-3 flex items-start gap-2">
              Q3. Can I change my order details after placing it?
            </h2>
            <div className="text-muted-foreground ml-7">
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Modifications can only be made within <span className="text-accent underline">24 hours</span> of placing the order.</li>
                <li>Once production or fabric cutting has started, we cannot accept further changes.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <Link href="/" className="text-primary underline text-lg hover:underline flex items-center gap-2 w-fit">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
