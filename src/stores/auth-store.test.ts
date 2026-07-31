import { clearCookies } from '@/test-utils/cookies'
import { createAccessToken } from '@/test-utils/jwt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// A query string forces a fresh module instance, so the store re-runs its
// cookie-based initialisation the way a page reload would.
let reload = 0

async function importAuthStore() {
  const mod = (await import(
    /* @vite-ignore */ `./auth-store.ts?reload=${reload++}`
  )) as typeof import('./auth-store')
  return mod.useAuthStore
}

const sampleUser = {
  accountNo: 'ACC-1',
  email: 'user@example.com',
  role: ['user'],
  exp: 1_700_000_000,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('starts with an empty access token when nothing is persisted', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('persists access token so a new store instance reads it back', async () => {
    const token = createAccessToken({ expiresInSeconds: 3600 })
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setAccessToken(token)

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe(token)
  })

  it('drops a persisted token that has already expired', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore
      .getState()
      .auth.setAccessToken(createAccessToken({ expiresInSeconds: 3600 }))

    // Re-persist with a past expiry, bypassing the store so the cookie survives.
    const { setCookie } = await import('@/lib/cookies')
    setCookie(
      'thisisjustarandomstring',
      JSON.stringify(createAccessToken({ expiresInSeconds: -60 }))
    )

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe('')
  })

  it('drops a persisted value that is not a readable token', async () => {
    const { setCookie } = await import('@/lib/cookies')
    setCookie('thisisjustarandomstring', JSON.stringify('not-a-jwt'))

    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.accessToken).toBe('')
  })

  it('clears persisted access token when resetAccessToken is used', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore
      .getState()
      .auth.setAccessToken(createAccessToken({ expiresInSeconds: 3600 }))
    useAuthStore.getState().auth.resetAccessToken()

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe('')
  })

  it('updates the signed-in user via setUser', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('reset clears user and access token and drops persistence', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore
      .getState()
      .auth.setAccessToken(createAccessToken({ expiresInSeconds: 3600 }))
    useAuthStore.getState().auth.setUser({ ...sampleUser })

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.accessToken).toBe('')

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.user).toBeNull()
    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe('')
  })
})
