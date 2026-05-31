'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signInWithEmail } from '@/lib/actions/auth'
import { Loader2, Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginForm({
  error,
  message,
  redirectTo,
}: {
  error?: string
  message?: string
  redirectTo?: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await signInWithEmail(formData)
    } catch (e) {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-[11px] font-sans flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{decodeURIComponent(error)}</p>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl p-4 text-[11px] font-sans flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>{decodeURIComponent(message)}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-2 ml-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-2 ml-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-12 py-3.5 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1C221A]/40 hover:text-[#4A5D23] transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              name="remember"
              defaultChecked={true}
              className="w-3.5 h-3.5 rounded-[4px] border-[#D4D7C9] text-[#4A5D23] focus:ring-[#4A5D23]/30 transition-colors cursor-pointer accent-[#4A5D23]"
            />
            <span className="text-[12px] uppercase tracking-widest text-[#1C221A]/60 group-hover:text-[#17210C] transition-colors pt-0.5">
              Remember me
            </span>
          </label>
          <Link href="/forgot-password" className="text-[12px] uppercase tracking-widest text-[#4A5D23] hover:text-[#C25934] transition-colors pt-0.5">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-[#4A5D23] text-white py-4 rounded-full font-sans text-[14px] uppercase tracking-[0.2em] shadow-[0_8px_25px_rgba(74,93,35,0.25)] hover:bg-[#3D4C1D] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#D4D7C9]/40 text-center">
        <p className="font-sans text-xs text-[#1C221A]/50 uppercase tracking-widest">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#4A5D23] text-[13px] underline hover:text-[#C25934] transition-colors">
            Sign Up ➔
          </Link>
        </p>
      </div>
    </div>
  )
}