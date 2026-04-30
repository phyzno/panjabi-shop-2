'use client'

import { useSearchParams } from 'next/navigation'
import { loginAdmin } from '@/lib/actions/admin'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-sm">Dev-only access</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}
        <form action={loginAdmin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <input name="username" type="text" required defaultValue="admin" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required defaultValue="admin" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-[#8B2222] text-white font-bold py-3 rounded-xl transition-colors">Sign In</button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
