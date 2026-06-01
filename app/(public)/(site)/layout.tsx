import { PublicHeader } from '@/components/layout/PublicHeader'

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="print:hidden">
        <PublicHeader />
      </div>
      <main className="grow">{children}</main>
    </>
  )
}
