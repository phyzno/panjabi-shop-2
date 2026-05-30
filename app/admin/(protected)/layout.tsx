import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin',
}

export default async function ProtectedAdminLayout({
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* বামপাশের নেভিগেশন সাইডবার (শুধুমাত্র প্রোটেক্টেড পেজের জন্য) */}
      <AdminSidebar />

      {/* ডানপাশের মূল কন্টেন্ট এরিয়া */}
      <main className="flex-grow p-6 md:p-10 lg:p-12 overflow-y-auto h-screen bg-secondary/10">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
