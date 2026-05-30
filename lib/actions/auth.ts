'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// SIGN UP (এখান থেকে db.insert সরিয়ে দেওয়া হয়েছে)
export async function signUpWithEmail(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/signup?error=' + encodeURIComponent('Passwords do not match'))
  }

  if (password.length < 8) {
    redirect('/signup?error=' + encodeURIComponent('Password must be at least 8 characters'))
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) redirect('/signup?error=' + encodeURIComponent(error.message))

  redirect('/signup?message=' + encodeURIComponent('Check your email to confirm your account'))
}

export const signup = signUpWithEmail

// SIGN IN 
// (পূর্বের কোড ঠিক থাকবে)
// SIGN IN
export async function signInWithEmail(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // ডাইনামিক রিডাইরেক্ট পাথ নেওয়া হচ্ছে (না পেলে ডিফল্ট ড্যাশবোর্ড)
  const requestedRedirectTo = (formData.get('redirectTo') as string) || '/dashboard'
  const redirectTo =
    requestedRedirectTo.startsWith('/') && !requestedRedirectTo.startsWith('//')
      ? requestedRedirectTo
      : '/dashboard'

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // পাসওয়ার্ড ভুল হলেও যেন রিডাইরেক্ট পাথটি হারিয়ে না যায়, তাই URL-এ সেটি যুক্ত করে দিচ্ছি
    const redirectParam = redirectTo !== '/dashboard' ? `&redirect=${encodeURIComponent(redirectTo)}` : ''
    redirect(`/login?error=${encodeURIComponent(error.message)}${redirectParam}`)
  }

  // সাকসেস হলে ডাইনামিক পাথে রিডাইরেক্ট
  redirect(`/auth/sync?next=${encodeURIComponent(redirectTo)}`)
}

// SIGN OUT
// (পূর্বের কোড ঠিক থাকবে)
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// FORGOT PASSWORD
// (পূর্বের কোড ঠিক থাকবে)
export async function sendResetEmail(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
  })

  if (error) redirect('/forgot-password?error=' + encodeURIComponent(error.message))
  redirect('/forgot-password?message=Check your email for a reset link')
}

// GET CURRENT USER
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET USER PROFILE (With JIT Auto-Sync)
export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  try {
    const profile = await db.select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    // যদি ইউজার Neon DB-তে থাকে, সরাসরি রিটার্ন করে দিন
    if (profile.length > 0) {
      return profile[0];
    }

    // === JIT SYNC ===
    // যদি কোনো কারণে ইউজার Neon DB-তে না থাকে (যেমন Callback ফেইল করা),
    // তাহলে তাৎক্ষণিকভাবে তাকে Neon DB-তে ইনসার্ট করে নিন।
    const [newUser] = await db.insert(users).values({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || '',
      role: "customer"
    }).returning();

    return newUser;
  } catch (error) {
    console.error('Error fetching/syncing profile from Neon:', error)
    return null
  }
}
