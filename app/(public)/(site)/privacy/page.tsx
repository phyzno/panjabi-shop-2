import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold mb-8">Privacy Policy ➔</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-6">
          At Panjabi Shop, we value your privacy. We only collect information necessary to process your custom orders and provide a personalized experience.
        </p>
        <h2 className="text-xl mt-8 mb-4">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Contact details (Name, Phone, Email)</li>
          <li>Delivery address</li>
          <li>Custom measurements for tailoring</li>
          <li>Payment transaction references</li>
        </ul>
      </div>
      <div className="mt-12">
        <Link href="/" className="text-primary underline text-lg hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
