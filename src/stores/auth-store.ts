import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { getTokenExpiryMs, isTokenExpired } from '@/lib/jwt'

const ACCESS_TOKEN = 'thisisjustarandomstring'

/** Keep the cookie alive exactly as long as the token it holds. */
function cookieMaxAge(token: string): number | undefined {
  const expiresAt = getTokenExpiryMs(token)
  if (expiresAt === null) return undefined
  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
}

function readPersistedToken(): string {
  const cookieState = getCookie(ACCESS_TOKEN)
  if (!cookieState) return ''

  try {
    const token: unknown = JSON.parse(cookieState)
    if (typeof token === 'string' && token && !isTokenExpired(token)) {
      return token
    }
  } catch {
    // Malformed cookie: fall through and drop it.
  }

  removeCookie(ACCESS_TOKEN)
  return ''
}

export interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = readPersistedToken()
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(
            ACCESS_TOKEN,
            JSON.stringify(accessToken),
            cookieMaxAge(accessToken)
          )
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
