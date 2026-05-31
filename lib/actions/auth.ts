'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (configuredUrl) return configuredUrl

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  const headerStore = await headers()
  const host = headerStore.get('host')
  const protocol = headerStore.get('x-forwarded-proto') || 'http'

  return host ? `${protocol}://${host}` : ''
}

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

  const siteUrl = await getSiteUrl()

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

export async function signInWithEmail(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
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
    const redirectParam = redirectTo !== '/dashboard' ? `&redirect=${encodeURIComponent(redirectTo)}` : ''
    redirect(`/login?error=${encodeURIComponent(error.message)}${redirectParam}`)
  }

  redirect(`/auth/sync?next=${encodeURIComponent(redirectTo)}`)
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function sendResetEmail(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const siteUrl = await getSiteUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  })

  if (error) redirect('/forgot-password?error=' + encodeURIComponent(error.message))
  redirect('/forgot-password?message=Check your email for a reset link')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  try {
    const profile = await db.select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (profile.length > 0) {
      return profile[0];
    }

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
