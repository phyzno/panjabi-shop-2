'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// SIGN UP
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

  const { data, error } = await supabase.auth.signUp({
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

  // Create profile record in profiles table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        email: email,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }
  }

  redirect('/signup?message=' + encodeURIComponent('Check your email to confirm your account'))
}

export const signup = signUpWithEmail

// SIGN IN
export async function signInWithEmail(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) redirect('/login?error=' + encodeURIComponent(error.message))
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// SIGN OUT
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// FORGOT PASSWORD
export async function sendResetEmail(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
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

// GET USER PROFILE
export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
