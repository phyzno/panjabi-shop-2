import { PublicHeader } from '@/components/layout/PublicHeader'

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="print:hidden">
        <PublicHeader variant="home" />
      </div>
      <main className="grow">{children}</main>
    </>
  )
}
