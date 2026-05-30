import Link from 'next/link';

export const metadata = {
  title: 'Order Confirmation',
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">

      {/* Checkmark Animation */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-green-500">
        <svg className="w-12 h-12 text-green-500 animate-[bounce_1s_ease-in-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-center">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-2 text-center max-w-md text-lg">
        Thank you for your order. Someone will call you shortly to confirm the details.
      </p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Our team will contact you at the provided phone number to discuss stitching details and delivery.
      </p>

      <div className="bg-[#FAF7F2] border border-[#E8E0D5] p-6 rounded-2xl mb-8 flex flex-col items-center w-full max-w-md shadow-sm">
        <span className="text-sm text-gray-500 font-bold tracking-wider uppercase mb-2">Order Number</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-primary">{orderId}</span>
          <button
            onClick={() => navigator.clipboard.writeText(orderId)}
            className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <Link href="/dashboard" className="flex-1 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-xl text-center transition-colors">
          View Orders
        </Link>
        <Link href="/shop" className="flex-1 bg-primary hover:bg-[#8B2222] text-white font-medium py-3 px-4 rounded-xl text-center transition-colors">
          Continue Shopping
        </Link>
      </div>

    </div>
  );
}
