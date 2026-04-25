import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* SECTION 1: HERO */}
      <section className="flex flex-col md:flex-row min-h-[85vh] bg-[#FAF7F2]">
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 md:py-0">
          <div className="inline-block bg-white border border-[#E8E0D5] text-xs font-bold tracking-wider py-1.5 px-3 rounded-full mb-6 w-fit shadow-sm">
            🪡 CUSTOM TAILORED IN BANGLADESH
          </div>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-[56px] leading-[1.1] text-[#1A1A1A] mb-6">
            Wear What You <br />
            <span className="text-[#C9A84C] italic">Imagine</span>
          </h1>
          <p className="font-sans text-lg text-[#6B6B6B] mb-10 max-w-[480px] leading-relaxed">
            Premium custom Panjabi stitched to your exact measurements. 
            Select fabric. Choose style. Perfect fit guaranteed.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Link 
              href="/customize/new" 
              className="bg-[#6B1E2E] hover:bg-[#8B2222] text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Start Customizing
            </Link>
            <Link 
              href="/shop" 
              className="bg-white border-2 border-[#E8E0D5] hover:border-[#C9A84C] text-[#1A1A1A] px-8 py-4 rounded-xl font-medium transition-colors"
            >
              Browse Collection
            </Link>
          </div>
          <div className="flex gap-6 text-sm font-medium text-[#1A1A1A]">
            <span className="flex items-center gap-2"><span className="text-[#C9A84C]">🏆</span> Premium Fabrics</span>
            <span className="flex items-center gap-2"><span className="text-[#C9A84C]">📐</span> Custom Fit</span>
            <span className="flex items-center gap-2"><span className="text-[#C9A84C]">🚚</span> BD Delivery</span>
          </div>
        </div>
        <div className="w-full md:w-1/2 relative bg-[#E8E0D5]/30 min-h-[50vh] md:min-h-full flex items-center justify-center overflow-hidden">
          {/* Overlapping images placeholder for hero - actual webp should be used here */}
          <div className="relative w-3/4 max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
             <div className="absolute inset-0 bg-[#1A1A1A]/10 mix-blend-multiply" />
             <Image src="/assets/punjabi/1-1.webp" alt="Premium Panjabi" fill className="object-cover" />
          </div>
          <div className="absolute bottom-10 right-10 md:right-auto md:left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 z-10 animate-bounce" style={{animationDuration: '3s'}}>
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white" />
              <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
              <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white" />
            </div>
            <div>
              <p className="font-bold text-sm">2000+ Happy</p>
              <p className="text-xs text-[#6B6B6B]">Customers in BD</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CATEGORIES */}
      <section className="py-20 px-4 container mx-auto">
        <h2 className="font-heading text-4xl text-center mb-12">Our Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Panjabi', 'Payjama', 'Sets', 'Readymade'].map((category, i) => (
            <Link key={category} href={`/shop?category=${category.toLowerCase()}`} className="group relative h-[400px] rounded-2xl overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gray-200">
                {/* Fallback image */}
                <Image src={`/assets/punjabi/1-${29+i}.webp`} alt={category} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 w-full p-8 transition-all duration-300 group-hover:pb-10 border-b-4 border-transparent group-hover:border-[#C9A84C]">
                <h3 className="font-heading text-2xl text-white mb-2">{category}</h3>
                <span className="text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Explore Collection →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="bg-[#1A1A1A] py-24 text-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl text-center mb-16 text-[#C9A84C]">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-[2px] bg-white/10" />
            
            {[
              { title: "Choose Your Style", desc: "Pick a Panjabi type and category" },
              { title: "Select Fabric & Color", desc: "Browse premium fabrics. See live preview." },
              { title: "Enter Measurements", desc: "Standard size or custom measurements" },
              { title: "Place Order", desc: "Pay 30% advance. Rest on delivery." }
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border-2 border-[#C9A84C] text-[#C9A84C] font-heading text-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: BOTTOM CTA */}
      <section className="bg-[#6B1E2E] py-24 text-center text-white px-4">
        <h2 className="font-heading text-4xl md:text-5xl mb-6">Your Perfect Panjabi, One Click Away</h2>
        <p className="text-[#E8E0D5] mb-10 max-w-2xl mx-auto">
          Join thousands of satisfied customers who have experienced the perfect fit with our custom tailoring service.
        </p>
        <Link 
          href="/customize/new" 
          className="inline-block bg-[#C9A84C] hover:bg-[#b5953e] text-[#1A1A1A] px-10 py-4 rounded-xl font-bold transition-all shadow-xl hover:scale-105"
        >
          Start Customizing Now
        </Link>
      </section>
    </div>
  );
}
