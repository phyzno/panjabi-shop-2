'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9F5] px-4 select-none">
      <div className="w-full max-w-md bg-white border border-[#D4D7C9]/40 rounded-[32px] shadow-xl shadow-[#4A5D23]/5 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A5D23]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4A5D23]/20">
            <ShieldCheck className="w-8 h-8 text-[#4A5D23]" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#17210C] mb-2">
            Admin Portal
          </h1>
          <p className="font-sans text-[12px] text-[#1C221A]/60 uppercase tracking-widest">
            Restricted Access Only
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-sans mb-6 text-center animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form action="/api/admin/login" method="POST" className="space-y-5">
          <div>
            <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/70 mb-2">Username</label>
            <input
              name="username"
              type="text"
              required
              autoComplete="off"
              className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-widest text-[#1C221A]/70 mb-2">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-[#F8F9F5] border border-[#D4D7C9]/80 rounded-xl px-4 py-3.5 pr-12 focus:ring-2 focus:ring-[#4A5D23]/30 focus:border-[#4A5D23] outline-none font-sans text-sm transition-all"
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

          <button
            type="submit"
            className="w-full mt-2 bg-[#4A5D23] hover:bg-[#3D4C1D] text-white font-sans text-sm uppercase tracking-[0.2em] py-4 rounded-full shadow-[0_8px_20px_rgba(74,93,35,0.2)] transition-all cursor-pointer active:scale-[0.98]"
          >
            Secure Login
          </button>
        </form>

      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  useEffect(() => {
    document.title = 'Admin Login | Panjabi Shop';
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4A5D23] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
