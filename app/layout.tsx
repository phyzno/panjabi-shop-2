import type { Metadata } from 'next'
import { Caudex, Sniglet } from 'next/font/google'
import AuthProvider from '@/components/providers/AuthProvider';
import '@/app/globals.css'

const caudex = Caudex({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caudex',
})

const sniglet = Sniglet({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-sniglet',
})

export const metadata: Metadata = {
  title: 'Home | Panjabi Shop — Custom Panjabi Bangladesh',
  description: 'Premium custom Panjabi stitched to your exact measurements.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${caudex.variable} ${sniglet.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}