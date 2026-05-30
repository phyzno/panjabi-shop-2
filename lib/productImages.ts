/**
 * Resolves product image references for display:
 * - Full `http(s)` URLs → unchanged (Supabase Storage / CDN uploads from admin).
 * - Paths starting with `/` → unchanged (static assets).
 * - Bare filenames (e.g. `1-1.webp`) → `/assets/punjabi/<filename>` for dummy/local catalog images.
 */
export const LOCAL_PUNJABI_ASSETS = '/assets/punjabi'
export const PRODUCT_IMAGE_PLACEHOLDER = `${LOCAL_PUNJABI_ASSETS}/1-1.webp`

export function resolveProductImageSrc(raw: string | null | undefined): string {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return PRODUCT_IMAGE_PLACEHOLDER
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('/')) return s
  return `${LOCAL_PUNJABI_ASSETS}/${s.replace(/^\/+/, '')}`
}

export function getProductImageUrls(product?: {
  image_urls?: string[] | null
  image_url?: string | null
} | null): string[] {
  if (product?.image_urls && Array.isArray(product.image_urls)) {
    return product.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
  }

  const fallback = typeof product?.image_url === 'string' ? product.image_url.trim() : ''
  return fallback ? [fallback] : []
}

export function getPrimaryProductImageUrl(product?: {
  image_urls?: string[] | null
  image_url?: string | null
} | null): string {
  return getProductImageUrls(product)[0] ?? PRODUCT_IMAGE_PLACEHOLDER
}