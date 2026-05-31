'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { resolveProductImageSrc } from '@/lib/productImages'
import { Loader2, Wand2, X, Repeat } from 'lucide-react'

interface ImageUploadProps {
  currentImageUrl?: string
  currentOriginalUrl?: string
  onUploadComplete?: (url: string) => void
  label?: string
  name?: string
  isFabric?: boolean
}

export function ImageUpload({
  currentImageUrl,
  currentOriginalUrl,
  onUploadComplete,
  label = 'Product Image',
  name = 'image_url',
  isFabric = false
}: ImageUploadProps) {
  const [storedValue, setStoredValue] = useState<string | null>(currentImageUrl || null)
  const [storedOriginal, setStoredOriginal] = useState<string | null>(currentOriginalUrl || null)
  
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'original' | 'mode2' | 'mode3'>('original')
  const [passes, setPasses] = useState<number>(1)
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({})

  const displaySrc = storedValue ? resolveProductImageSrc(storedValue) : null

  async function handleRawUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      
      const rawUrl = data.url
      setStoredOriginal(rawUrl)
      setStoredValue(rawUrl)
      setCachedUrls({ original: rawUrl })
      
      if (isFabric) {
        setShowModal(true)
        setSelectedMode('original')
        setPasses(1)
      } else {
        if (onUploadComplete) onUploadComplete(rawUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleProcessMode(mode: 'mode2' | 'mode3', currentPasses: number) {
    const cacheKey = `${mode}-${currentPasses}x`
    
    if (cachedUrls[cacheKey]) {
      setSelectedMode(mode)
      setPasses(currentPasses)
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/process-texture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: cachedUrls.original,
          mode: mode,
          iterations: currentPasses
        })
      })

      if (!res.ok) throw new Error('Processing failed')
      const data = await res.json()
      
      setCachedUrls(prev => ({ ...prev, [cacheKey]: data.url }))
      setSelectedMode(mode)
      setPasses(currentPasses)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed'
      alert('Error generating texture: ' + message)
      setSelectedMode('original')
    } finally {
      setProcessing(false)
    }
  }

  function handleSaveTexture() {
    const cacheKey = selectedMode === 'original' ? 'original' : `${selectedMode}-${passes}x`
    const finalUrl = cachedUrls[cacheKey] || cachedUrls.original
    setStoredValue(finalUrl)
    setShowModal(false)
    if (onUploadComplete) onUploadComplete(finalUrl)
  }

  const currentPreviewKey = selectedMode === 'original' ? 'original' : `${selectedMode}-${passes}x`

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      
      <input type="hidden" name={name} value={storedValue || ''} />
      <input type="hidden" name="original_image_url" value={storedOriginal || ''} />

      <div 
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors bg-gray-50 flex items-center justify-center ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-primary'
        } ${displaySrc ? 'aspect-square' : 'py-12'}`}
      >
        {displaySrc ? (
          <>
            <Image src={displaySrc} alt="Preview" fill className="object-cover" unoptimized={Boolean(displaySrc)} />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <span className="text-white text-sm font-medium">Click to change</span>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-gray-500">Click to upload image</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium text-primary">Uploading Raw Image...</p>
          </div>
        )}
      </div>

      {isFabric && storedOriginal && !uploading && (
        <button
          type="button"
          onClick={() => {
            setCachedUrls(prev => ({ ...prev, original: storedOriginal }))
            setShowModal(true)
          }}
          className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 py-3 rounded-xl font-bold hover:bg-amber-100 transition-colors"
        >
          <Wand2 size={18} />
          Optimize Seamless Texture
        </button>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleRawUpload} className="hidden" />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            <div className="md:w-3/5 h-[400px] md:h-[600px] bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-8 z-0">
                <div 
                  className="w-full h-full border border-gray-300 shadow-inner transition-all duration-300"
                  style={{
                    backgroundImage: `url(${cachedUrls[currentPreviewKey]})`,
                    backgroundSize: '150px 150px',
                    backgroundRepeat: 'repeat'
                  }}
                />
              </div>
              <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2">
                Live Tiling Preview
                {selectedMode !== 'original' && <span className="bg-primary px-2 py-0.5 rounded-full">{passes}x</span>}
              </div>
              {processing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                  <p className="font-bold text-gray-800">Processing Iteration...</p>
                </div>
              )}
            </div>

            <div className="md:w-2/5 p-6 flex flex-col h-[400px] md:h-[600px] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Texture Engine</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                <button
                  type="button"
                  onClick={() => setSelectedMode('original')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedMode === 'original' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <h4 className="font-bold">Raw (Original)</h4>
                  <p className="text-xs text-gray-500 mt-1">Keeps the uploaded image untouched.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleProcessMode('mode2', passes)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedMode === 'mode2' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <h4 className="font-bold">Mode 2 (Scattered Edge Blend)</h4>
                  <p className="text-xs text-gray-500 mt-1">Irregular four-side feathering. Best for busy woven prints or uneven lighting.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleProcessMode('mode3', passes)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedMode === 'mode3' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <h4 className="font-bold">Mode 3 (Smooth All-Side Blend)</h4>
                  <p className="text-xs text-gray-500 mt-1">A softer all-side edge blend. Best for florals or draped fabrics.</p>
                </button>
              </div>

              {selectedMode !== 'original' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat size={16} className="text-gray-500" />
                    <h4 className="text-sm font-bold text-gray-700">Processing Intensity</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleProcessMode(selectedMode, num)}
                        className={`py-2 text-sm font-bold rounded-lg transition-colors ${
                          passes === num
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {num}x Pass
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">Higher passes create smoother blends but may soften details.</p>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSaveTexture}
                  disabled={processing}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-[#8B2222] transition-colors"
                >
                  Apply & Save Texture
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
