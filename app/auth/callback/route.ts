import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

function getSafeNext(next: string | null, fallback: string) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return fallback;
  }

  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = getSafeNext(
    searchParams.get('next'),
    type === 'recovery' ? '/auth/reset-password' : '/dashboard'
  )

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      try {
        const existingUser = await db.select().from(users).where(eq(users.id, data.user.id)).limit(1);
        
        if (existingUser.length === 0) {
          await db.insert(users).values({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || '',
            phone: data.user.user_metadata?.phone || '',
            role: 'customer'
          });
        }
      } catch (dbError) {
        console.error("Callback Neon DB Sync Error:", dbError);
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
