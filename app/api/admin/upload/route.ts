import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/utils/supabase/service'

export async function POST(request: NextRequest) {
  console.log('Upload API hit')
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  console.log('Admin session:', session)

  if (session !== 'true') {
    console.warn('Unauthorized upload attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let supabase
  try {
    supabase = createServiceRoleClient()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to create Supabase service client:', message)
    return NextResponse.json(
      { error: 'Server configuration error: Missing API keys' },
      { status: 500 }
    )
  }
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    console.warn('No file in form data')
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    )
  }

  console.log('File metadata:', { name: file.name, size: file.size, type: file.type })

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    console.error('Supabase Storage Error Details:', {
      message: error.message,
      name: error.name,
      // @ts-expect-error - Supabase error may contain details
      details: error.details,
      // @ts-expect-error - Supabase error may contain hint
      hint: error.hint
    })
    return NextResponse.json(
      { error: `Storage error: ${error.message}` },
      { status: 500 }
    )
  }

  console.log('Upload successful:', data)
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)

  if (!urlData?.publicUrl) {
    console.error('Failed to get public URL for path:', data.path)
    return NextResponse.json(
      { error: 'Failed to generate public URL' },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: urlData.publicUrl })
}
