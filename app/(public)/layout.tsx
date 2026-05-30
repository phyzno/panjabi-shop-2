import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { GlobalSizeGuide } from '@/components/ui/GlobalSizeGuide'
import { getCachedSiteSettings } from '@/lib/actions/settings.actions' // ইমপোর্ট করো
import { CartDrawer } from "@/components/cart/CartDrawer";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // ক্যাশ থেকে সেটিংস ফেচ করা হচ্ছে
  const settingsRes = await getCachedSiteSettings();
  const settings = settingsRes?.data;
  
  // লাইভ অফার টেক্সট বের করা
  let activeOfferText = null;
  if (settings && settings.active_offer_id) {
    const offers = Array.isArray(settings.offers) ? settings.offers : [];
    const liveOffer = offers.find((o: any) => o.id === settings.active_offer_id);
    if (liveOffer) {
      activeOfferText = liveOffer.text;
    }
  }

  return (
    <>
      <div className="print:hidden">
        <Header activeOfferText={activeOfferText} />
      </div>

      <main className="grow">{children}</main>

      <div className="print:hidden">
        <Footer />
        <GlobalSizeGuide />
        <CartDrawer />
      </div>
    </>
  )
}