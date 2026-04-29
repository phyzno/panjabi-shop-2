import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { logoutAdmin } from '@/lib/actions/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession || adminSession.value !== 'true') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="/admin" className="font-heading text-xl font-bold text-primary">Admin Panel</a>
            <nav className="hidden md:flex gap-4">
              <a href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">Orders</a>
              <a href="/admin/products" className="text-sm font-medium text-muted-foreground hover:text-primary">Products</a>
              <a href="/admin/fabrics" className="text-sm font-medium text-muted-foreground hover:text-primary">Fabrics</a>
              <a href="/admin/collars" className="text-sm font-medium text-muted-foreground hover:text-primary">Collars</a>
            </nav>
          </div>
          <form action={logoutAdmin}>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Logout
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  )
}
