import { type AuthUser } from '@/stores/auth-store'

/**
 * Fake JWTs for the mock API.
 *
 * The signature is a placeholder, but the payload must be a real base64url
 * encoded JSON object with an `exp` claim: the route guard reads it to decide
 * whether the session is still alive.
 */

const ACCOUNT_NO = 'ACC-0001'
const ROLE = ['admin']
const TOKEN_TTL_SECONDS = 60 * 60

type TokenPayload = {
  sub: string
  email: string
  role: string[]
  exp: number
}

function base64UrlEncode(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodePayload(token: string): TokenPayload | null {
  const segment = token.split('.')[1]
  if (!segment) return null

  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  try {
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))

    if (typeof parsed !== 'object' || parsed === null) return null
    const { sub, email, role, exp } = parsed as Record<string, unknown>

    if (
      typeof sub !== 'string' ||
      typeof email !== 'string' ||
      typeof exp !== 'number' ||
      !Array.isArray(role)
    ) {
      return null
    }

    return { sub, email, role: role.map(String), exp }
  } catch {
    return null
  }
}

export function issueAccessToken(email: string): {
  accessToken: string
  user: AuthUser
} {
  const issuedAt = Math.floor(Date.now() / 1000)
  const exp = issuedAt + TOKEN_TTL_SECONDS

  const accessToken = [
    base64UrlEncode({ alg: 'HS256', typ: 'JWT' }),
    base64UrlEncode({
      sub: ACCOUNT_NO,
      email,
      role: [...ROLE],
      iat: issuedAt,
      exp,
    }),
    'mock-signature',
  ].join('.')

  return {
    accessToken,
    user: { accountNo: ACCOUNT_NO, email, role: [...ROLE], exp: exp * 1000 },
  }
}

/** `null` when the token is unreadable or already expired. */
export function toAuthUser(token: string): AuthUser | null {
  const payload = decodePayload(token)
  if (!payload || payload.exp * 1000 <= Date.now()) return null

  return {
    accountNo: payload.sub,
    email: payload.email,
    role: payload.role,
    exp: payload.exp * 1000,
  }
}
