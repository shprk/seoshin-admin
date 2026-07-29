import { AxiosError } from 'axios'
import { type AuthUser } from '@/stores/auth-store'
import { apiClient } from './client'

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  user: AuthUser
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error('API base URL이 설정되지 않았습니다.')
  }

  try {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials
    )
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        '로그인에 실패했습니다.'
      throw new Error(message)
    }
    throw error
  }
}
