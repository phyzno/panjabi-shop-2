'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setIsSubmitting(false)

    if (error) {
      setLocalError(error.message)
    } else {
      window.location.href = '/login?message=' + encodeURIComponent('Password updated successfully! Sign in with your new password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F8F9F5] select-none">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

        {/* Branding & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A5D23]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4A5D23]/20">
            <ShieldCheck className="w-8 h-8 text-[#4A5D23]" />
          </div>
          <Link href="/" className="font-heading text-3xl font-bold uppercase tracking-[0.2em] text-[#17210C]">
            Panjabi Shop
          </Link>
          <h1 className="font-heading text-lg font-bold text-[#17210C]/80 mt-4 uppercase tracking-widest">
            Create New Password
          </h1>
          <p className="font-sans text-xs text-[#1C221A]/50 uppercase tracking-widest mt-1 px-4">
            Secure your account with a strong password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-[#4A5D23]/5 border border-[#D4D7C9]/40 p-8 sm:p-10">
          <div className="space-y-6">
            {(error || localError) && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-[11px] font-sans flex items-start gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{decodeURIComponent(error || localError)}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-2 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-12 py-3.5 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
                    placeholder="••••••••"
                  />
                  {/* 👈 নতুন Show/Hide বাটন */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1C221A]/40 hover:text-[#4A5D23] transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-2 ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-12 py-3.5 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
                    placeholder="••••••••"
                  />
                  {/* 👈 নতুন Show/Hide বাটন */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1C221A]/40 hover:text-[#4A5D23] transition-colors focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[#4A5D23] text-white py-4 rounded-full font-sans text-[14px] uppercase tracking-[0.2em] shadow-[0_8px_25px_rgba(74,93,35,0.25)] hover:bg-[#3D4C1D] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="font-sans text-xs text-[#1C221A]/50 uppercase tracking-widest">
            Remember your password?{' '}
            <Link href="/login" className="text-[#4A5D23] text-[13px] underline hover:text-[#C25934] transition-colors">
              Sign In ➔
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}