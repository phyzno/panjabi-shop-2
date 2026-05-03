'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { resolveProductImageSrc } from '@/lib/productImages'

interface ImageUploadProps {
  currentImageUrl?: string
  onUploadComplete?: (url: string) => void
  label?: string
  name?: string
}

export function ImageUpload({
  currentImageUrl,
  onUploadComplete,
  label = 'Product Image',
  name = 'image_url'
}: ImageUploadProps) {
  /** Value persisted to DB: Storage URL (admin upload) or legacy dummy filename/path */
  const [storedValue, setStoredValue] = useState<string | null>(currentImageUrl || null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setStoredValue(currentImageUrl || null)
  }, [currentImageUrl])

  const displaySrc = objectUrl || (storedValue ? resolveProductImageSrc(storedValue) : null)

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl)
    const localUrl = URL.createObjectURL(file)
    setObjectUrl(localUrl)
    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      if (typeof url !== 'string' || !url.startsWith('http')) {
        throw new Error('Invalid upload URL')
      }

      URL.revokeObjectURL(localUrl)
      setObjectUrl(null)
      setStoredValue(url)
      if (onUploadComplete) onUploadComplete(url)
    } catch {
      setError('Upload failed. Try again.')
      URL.revokeObjectURL(localUrl)
      setObjectUrl(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-[#6B1E2E] transition-colors bg-gray-50 flex items-center justify-center"
      >
        {displaySrc ? (
          <>
            <Image
              src={displaySrc}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized={Boolean(objectUrl)}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                Click to change image
              </span>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-gray-500">
              Click to upload image
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#6B1E2E] border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {storedValue && !uploading && (
        <input
          type="hidden"
          name={name}
          value={storedValue}
        />
      )}
    </div>
  )
}
