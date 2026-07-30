import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { useSessionStore } from '@/stores/session-store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      const { auth } = useAuthStore.getState()
      const hadSession = Boolean(auth.accessToken)
      const onSignIn = window.location.pathname.includes('/sign-in')

      if (hadSession && !onSignIn) {
        auth.reset()
        useSessionStore.getState().openExpired(window.location.href)
      }
    }

    return Promise.reject(error)
  }
)
