import Link from 'next/link'
import ForgotPasswordForm from './ForgotPasswordForm'
import { KeyRound } from 'lucide-react'
import { Suspense } from 'react'

export const metadata = {
  title: 'Forgot Password',
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams?.error
  const message = resolvedParams?.message

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F8F9F5] select-none">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A5D23]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4A5D23]/20">
            <KeyRound className="w-8 h-8 text-[#4A5D23]" />
          </div>
          <Link href="/" className="font-heading text-3xl font-bold uppercase tracking-[0.2em] text-[#17210C]">
            Panjabi Shop
          </Link>
          <h1 className="font-heading text-lg font-bold text-[#17210C]/80 mt-4 uppercase tracking-widest">
            Reset Password
          </h1>
          <p className="font-sans text-xs text-[#1C221A]/50 uppercase tracking-widest mt-1 px-4">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl shadow-[#4A5D23]/5 border border-[#D4D7C9]/40 p-8 sm:p-10">
          <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div></div>}>
            <ForgotPasswordForm error={error} message={message} />
          </Suspense>
        </div>

        <div className="mt-8 text-center">
           <Link href="/login" className="font-sans text-[12px] uppercase tracking-widest text-[#1C221A]/40 hover:text-[#4A5D23] transition-colors">
             ← Back to Sign In
           </Link>
        </div>
      </div>
    </div>
  )
}
