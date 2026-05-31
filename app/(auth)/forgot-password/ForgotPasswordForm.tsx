'use client'

import { useState } from 'react'
import { sendResetEmail } from '@/lib/actions/auth'
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPasswordForm({
  error,
  message,
}: {
  error?: string
  message?: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    await sendResetEmail(formData)
    setIsSubmitting(false)
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
        <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl p-4 text-[11px] font-sans flex items-start gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{decodeURIComponent(message)}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#4A5D23] text-white py-4 rounded-full font-sans text-[14px] uppercase tracking-[0.2em] shadow-[0_8px_25px_rgba(74,93,35,0.25)] hover:bg-[#3D4C1D] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Link...</span>
            </>
          ) : (
            <span>Send Reset Link</span>
          )}
        </button>
      </form>
    </div>
  )
}