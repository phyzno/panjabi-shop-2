import Link from 'next/link'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/fabrics', label: 'Fabrics' },
  { href: '/admin/collars', label: 'Collars' },
]

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
              <Link href="/admin" className="text-lg font-heading font-bold text-primary">
                Panjabi Shop Control
              </Link>
            </div>

            <nav className="flex flex-wrap items-center gap-2 md:gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="pb-12">{children}</main>
    </div>
  )
}
