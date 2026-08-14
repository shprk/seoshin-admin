import { useEffect, useState, type Ref } from 'react'
import {
  CUSTOM_EMAIL_DOMAIN,
  composeEmail,
  emailDomains,
  isPresetEmailDomain,
  parseEmailParts,
} from '@/lib/email-domains'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CustomerEmailInputProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  inputRef?: Ref<HTMLInputElement>
  disabled?: boolean
  id?: string
  className?: string
  autoComplete?: string
}

export function CustomerEmailInput({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  disabled,
  id,
  className,
  autoComplete = 'off',
}: CustomerEmailInputProps) {
  const { local, domain } = parseEmailParts(value)
  const valueUsesCustomDomain = Boolean(domain) && !isPresetEmailDomain(domain)

  const [isCustom, setIsCustom] = useState(valueUsesCustomDomain)
  const [pendingDomain, setPendingDomain] = useState(
    valueUsesCustomDomain ? domain : ''
  )

  useEffect(() => {
    const parts = parseEmailParts(value)
    if (parts.domain && !isPresetEmailDomain(parts.domain)) {
      setIsCustom(true)
      setPendingDomain(parts.domain)
      return
    }
    if (parts.domain && isPresetEmailDomain(parts.domain)) {
      setIsCustom(false)
      setPendingDomain(parts.domain)
    }
  }, [value])

  const selectValue = isCustom
    ? CUSTOM_EMAIL_DOMAIN
    : domain && isPresetEmailDomain(domain)
      ? domain
      : pendingDomain && isPresetEmailDomain(pendingDomain)
        ? pendingDomain
        : undefined

  const customDomainValue = valueUsesCustomDomain ? domain : pendingDomain
  const activeDomain = isCustom
    ? customDomainValue
    : domain && isPresetEmailDomain(domain)
      ? domain
      : pendingDomain

  const emit = (nextLocal: string, nextDomain: string) => {
    onChange(composeEmail(nextLocal, nextDomain))
  }

  const handleLocalChange = (raw: string) => {
    if (raw.includes('@')) {
      const at = raw.indexOf('@')
      const nextLocal = raw.slice(0, at)
      const nextDomain = raw.slice(at + 1)
      if (nextDomain && !isPresetEmailDomain(nextDomain)) {
        setIsCustom(true)
        setPendingDomain(nextDomain)
      } else if (nextDomain) {
        setIsCustom(false)
        setPendingDomain(nextDomain)
      }
      emit(nextLocal, nextDomain || activeDomain)
      return
    }

    emit(raw, activeDomain)
  }

  const handleDomainSelect = (next: string) => {
    if (next === CUSTOM_EMAIL_DOMAIN) {
      setIsCustom(true)
      setPendingDomain('')
      emit(local, '')
      return
    }
    setIsCustom(false)
    setPendingDomain(next)
    emit(local, next)
  }

  const handleCustomDomainChange = (nextDomain: string) => {
    setPendingDomain(nextDomain)
    emit(local, nextDomain)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type='text'
        inputMode='email'
        autoComplete={autoComplete}
        value={local}
        onChange={(e) => handleLocalChange(e.target.value)}
        onBlur={onBlur}
        placeholder='아이디'
        disabled={disabled}
        className='min-w-0 flex-1'
      />
      <span className='shrink-0 text-muted-foreground'>@</span>
      {isCustom ? (
        <Input
          type='text'
          inputMode='url'
          autoComplete='off'
          value={customDomainValue}
          onChange={(e) => handleCustomDomainChange(e.target.value)}
          onBlur={onBlur}
          placeholder='직접 입력'
          disabled={disabled}
          className='min-w-0 flex-1'
        />
      ) : null}
      <Select
        value={selectValue}
        onValueChange={handleDomainSelect}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(isCustom ? 'w-[7.75rem] shrink-0' : 'min-w-0 flex-1')}
          aria-label='이메일 도메인 선택'
        >
          <SelectValue placeholder='도메인 선택' />
        </SelectTrigger>
        <SelectContent>
          {emailDomains.map(({ label, domain: itemDomain }) => (
            <SelectItem key={itemDomain} value={itemDomain}>
              {label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_EMAIL_DOMAIN}>직접 입력</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
