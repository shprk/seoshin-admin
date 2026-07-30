import { AxiosError } from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined

    if (Array.isArray(data?.message)) {
      return data.message.join(', ')
    }

    return data?.message || error.message || fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function throwApiError(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback), { cause: error })
}
