import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (username === 'admin' && password === 'admin') {
    const response = NextResponse.redirect(new URL('/admin', request.url))
    response.cookies.set('admin_session', 'true', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    })
    return response
  }

  return NextResponse.redirect(new URL('/admin/login?error=Invalid+credentials', request.url))
}
