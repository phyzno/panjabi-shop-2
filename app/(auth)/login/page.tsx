import Link from 'next/link'
import LoginForm from './LoginForm'
import { LogIn } from 'lucide-react'
import { Suspense } from 'react'

export const metadata = {
  title: 'Login',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams?.error
  const message = resolvedParams?.message
  const redirectParam = resolvedParams?.redirect || '/dashboard'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F8F9F5] select-none">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A5D23]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4A5D23]/20">
            <LogIn className="w-8 h-8 text-[#4A5D23]" />
          </div>
          <Link href="/" className="font-heading text-3xl font-bold uppercase tracking-[0.2em] text-[#17210C]">
            Panjabi Shop
          </Link>
          <h1 className="font-heading text-lg font-bold text-[#17210C]/80 mt-4 uppercase tracking-widest">
            Welcome Back
          </h1>
          <p className="font-sans text-xs text-[#1C221A]/50 uppercase tracking-widest mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-[#4A5D23]/5 border border-[#D4D7C9]/40 p-8 sm:p-10">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div></div>}>
            <LoginForm error={error} message={message} redirectTo={redirectParam} />
          </Suspense>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
           <Link href="/" className="font-sans text-[12px] uppercase tracking-widest text-[#1C221A]/40 hover:text-[#4A5D23] transition-colors">
             ← Back to Home
           </Link>
        </div>
      </div>
    </div>
  )
}
