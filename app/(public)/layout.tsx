import Footer from '@/components/layout/Footer'
import { GlobalSizeGuide } from '@/components/ui/GlobalSizeGuide'
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}

      <div className="print:hidden">
        <Footer />
        <GlobalSizeGuide />
        <CartDrawer />
      </div>
    </>
  )
}
