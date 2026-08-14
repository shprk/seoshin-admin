import { z } from 'zod'

export const emailDomains = [
  { label: 'naver.com', domain: 'naver.com' },
  { label: 'gmail.com', domain: 'gmail.com' },
  { label: 'daum.net', domain: 'daum.net' },
  { label: 'kakao.com', domain: 'kakao.com' },
] as const

export const CUSTOM_EMAIL_DOMAIN = '__custom__'

export const presetEmailDomains = emailDomains.map(({ domain }) => domain)

export function parseEmailParts(value: string): {
  local: string
  domain: string
} {
  const trimmed = value.trim()
  const at = trimmed.indexOf('@')
  if (at === -1) return { local: trimmed, domain: '' }
  return {
    local: trimmed.slice(0, at),
    domain: trimmed.slice(at + 1),
  }
}

export function composeEmail(local: string, domain: string): string {
  const l = local.trim()
  const d = domain.trim()
  if (!l) return ''
  if (!d) return l
  return `${l}@${d}`
}

export function isPresetEmailDomain(domain: string): boolean {
  return (presetEmailDomains as readonly string[]).includes(domain)
}

export const optionalEmailSchema = z.string().refine(
  (value) => {
    const trimmed = value.trim()
    if (trimmed === '') return true
    return z.email().safeParse(trimmed).success
  },
  { message: '올바른 이메일을 입력해주세요.' }
)

export function isOptionalEmailValid(value: string): boolean {
  return optionalEmailSchema.safeParse(value).success
}
