'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendResetEmail } from '@/lib/actions/auth'

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
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-6">
          {decodeURIComponent(error)}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-6">
          {decodeURIComponent(message)}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6B1E2E] focus:border-transparent outline-none transition"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#6B1E2E] text-white py-3 rounded-xl font-medium hover:bg-[#5a1826] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-[#6B1E2E] font-medium hover:underline">
          Sign in →
        </Link>
      </p>
    </>
  )
}
