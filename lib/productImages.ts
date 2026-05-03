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
