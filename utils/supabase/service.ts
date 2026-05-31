import { createClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Environment check failed in createServiceRoleClient:', {
      hasUrl: !!url,
      hasKey: !!key,
      envKeysFound: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    })
    throw new Error(
      `Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Found keys: ${Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', ')}`
    )
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
