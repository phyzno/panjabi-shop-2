import Link from 'next/link';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const orderId = params.id;
  
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      
      {/* Checkmark Animation (CSS only via Tailwind) */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-green-500">
        <svg className="w-12 h-12 text-green-500 animate-[bounce_1s_ease-in-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-center">Order Placed Successfully!</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Thank you for choosing Panjabi Shop. Your order has been received and is currently pending payment verification.
      </p>

      <div className="bg-[#FAF7F2] border border-[#E8E0D5] p-6 rounded-2xl mb-8 flex flex-col items-center w-full max-w-md shadow-sm">
        <span className="text-sm text-gray-500 font-bold tracking-wider uppercase mb-2">Order Number</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-primary">{orderId}</span>
          <button className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition-colors">Copy</button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 md:p-8 rounded-2xl w-full max-w-2xl mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        <h3 className="font-heading text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <span>⚠️</span> Next Step: Complete Your Advance Payment
        </h3>
        <p className="text-amber-800 text-sm md:text-base leading-relaxed mb-6">
          To begin stitching your custom Panjabi, we require a 30% advance payment. 
          If you have already paid via the checkout page, please send us a screenshot of the transaction.
        </p>
        
        <div className="bg-white p-4 rounded-xl border border-amber-100 mb-6 font-mono text-sm">
          <p className="mb-2"><strong>bKash/Nagad:</strong> 01XXXXXXXXX (Personal)</p>
          <p><strong>Reference:</strong> {orderId}</p>
        </div>

        <a 
          href={`https://wa.me/8801XXXXXXXXX?text=Hi, my order number is ${orderId}. Sending advance payment screenshot.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl transition-colors gap-2"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Send Payment Screenshot
        </a>
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
