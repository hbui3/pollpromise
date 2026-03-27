import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] || c))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    + '-' + Math.random().toString(36).slice(2, 6)
}

export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

/**
 * Sanitizes a URL for safe use in href attributes.
 * Only allows http: and https: protocols. Returns '#' for unsafe URLs.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#'
  const trimmed = url.trim()
  if (!trimmed) return '#'
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed
    }
    return '#'
  } catch {
    // Relative URLs or malformed — block them
    return '#'
  }
}

/**
 * Validates that a URL uses http(s) protocol. For server-side validation.
 */
export function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/** Max string lengths for input validation */
export const MAX_LENGTHS = {
  title: 200,
  description: 2000,
  charityName: 200,
  charityDescription: 1000,
  url: 2048,
  code: 100,
  /** Max base64 image size: ~5MB encoded */
  base64Image: 7_000_000,
} as const
