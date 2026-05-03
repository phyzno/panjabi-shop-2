import { createClient } from '@supabase/supabase-js'

/**
 * Server-only client with the service role key. Bypasses RLS; use only in trusted
 * server code (e.g. after admin session is verified). Never import from client components.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add the service role key as a server-only env var so admin catalog actions can write past RLS.'
    )
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
