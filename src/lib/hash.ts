import crypto from "crypto"

/**
 * Creates a SHA-256 hash from IP + User-Agent + salt.
 * This produces a per-device fingerprint that is:
 * - Not reversible (no personal data stored)
 * - Unique enough to distinguish users behind the same IP (CGN, university networks)
 * - GDPR-compliant since only the hash is stored
 */
export function hashParticipant(ip: string, userAgent: string): string {
  const input = `${ip}|${userAgent}|${process.env.IP_SALT || 'poll-promise-salt'}`
  return crypto.createHash('sha256').update(input).digest('hex')
}