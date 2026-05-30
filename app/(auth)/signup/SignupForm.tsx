'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUpWithEmail } from '@/lib/actions/auth'
import { Loader2, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'

// Password Strength Indicator (Redesigned)
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const hasLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']

  return (
    <div className="mt-2 pl-1">
      <div className="flex gap-1.5 h-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 rounded-full ${i < score ? colors[score - 1] : 'bg-[#EBECE3]'}`} />
        ))}
      </div>
      <p className="text-[9px] font-sans text-[#1C221A]/50 mt-1.5 uppercase tracking-wider">
        {password.length > 0 && <span className="text-[#17210C]/60">{score >= 3 ? 'Strong' : score >= 2 ? 'Good' : score >= 1 ? 'Fair' : 'Weak'} — </span>}
        8+ chars, uppercase, number & special
      </p>
    </div>
  )
}

export default function SignupForm({
  error,
  message,
}: {
  error?: string
  message?: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    await signUpWithEmail(formData)
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
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

      <form action={handleSubmit} className="space-y-4">

        {/* Full Name Field */}
        <div>
          <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-1.5 ml-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
            <input
              name="fullName"
              type="text"
              required
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-1.5 ml-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
            <input
              name="phone"
              type="tel"
              required
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-1.5 ml-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-1.5 ml-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-12 py-3 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
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
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/60 mb-1.5 ml-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C221A]/30" />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl pl-11 pr-12 py-3 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
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

        {/* Terms and Conditions Checkbox */}
        <div className="pt-2 px-1">
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              defaultChecked={true}
              className="mt-0.5 w-3.5 h-3.5 rounded-[4px] border-[#D4D7C9] text-[#4A5D23] focus:ring-[#4A5D23]/30 transition-colors cursor-pointer accent-[#4A5D23] shrink-0"
            />
            <span className="text-[12px] uppercase tracking-wider text-[#1C221A]/60 group-hover:text-[#17210C] transition-colors leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="text-[#4A5D23] hover:text-[#C25934] transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#4A5D23] hover:text-[#C25934] transition-colors">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 bg-[#4A5D23] text-white py-4 rounded-full font-sans text-[14px] uppercase tracking-[0.2em] shadow-[0_8px_25px_rgba(74,93,35,0.25)] hover:bg-[#3D4C1D] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <div className="pt-4 border-t border-[#D4D7C9]/40 text-center">
        <p className="font-sans text-xs text-[#1C221A]/50 uppercase tracking-widest">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4A5D23] text-[13px] underline hover:text-[#C25934] transition-colors">
            Sign In ➔
          </Link>
        </p>
      </div>
    </div>
  )
}