import { createAccessToken } from '@/test-utils/jwt'
import { describe, expect, it } from 'vitest'
import { getTokenExpiryMs, isTokenExpired } from './jwt'

describe('getTokenExpiryMs', () => {
  it('converts the exp claim from seconds to milliseconds', () => {
    const token = createAccessToken({ expiresInSeconds: 3600 })

    const expiresAt = getTokenExpiryMs(token)

    expect(expiresAt).toBeGreaterThan(Date.now())
    expect(expiresAt).toBeLessThanOrEqual(Date.now() + 3600 * 1000)
  })

  it('returns null for a value that is not a token', () => {
    expect(getTokenExpiryMs('not-a-jwt')).toBeNull()
    expect(getTokenExpiryMs('')).toBeNull()
  })
})

describe('isTokenExpired', () => {
  it('is false while the token is still valid', () => {
    expect(isTokenExpired(createAccessToken({ expiresInSeconds: 60 }))).toBe(
      false
    )
  })

  it('is true once the expiry has passed', () => {
    expect(isTokenExpired(createAccessToken({ expiresInSeconds: -1 }))).toBe(
      true
    )
  })

  it('treats an unreadable token as expired', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true)
  })
})
