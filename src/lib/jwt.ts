/**
 * Minimal JWT payload inspection for client-side session checks.
 *
 * Only the `exp` claim is read. Signature is never verified here, so this is
 * strictly a UX shortcut: the server remains the source of truth via 401.
 */

function decodePayload(token: string): Record<string, unknown> | null {
  const segment = token.split('.')[1]
  if (!segment) return null

  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  try {
    const parsed: unknown = JSON.parse(atob(padded))
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Expiry of a JWT in milliseconds since epoch, or `null` when unavailable.
 *
 * The `exp` claim is in seconds, unlike `AuthUser.exp` which the API already
 * returns in milliseconds.
 */
export function getTokenExpiryMs(token: string): number | null {
  const payload = decodePayload(token)
  const exp = payload?.exp
  return typeof exp === 'number' ? exp * 1000 : null
}

/** Tokens that cannot be read are treated as expired. */
export function isTokenExpired(token: string): boolean {
  const expiresAt = getTokenExpiryMs(token)
  return expiresAt === null || expiresAt <= Date.now()
}
