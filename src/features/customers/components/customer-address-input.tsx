import { useCallback, useEffect, useId, useRef, useState, type Ref } from 'react'
import { toast } from 'sonner'
import {
  composeAddress,
  embedAddressSearch,
  isAddressSearchReady,
  loadDaumPostcodeScript,
  openAddressSearch,
  parseAddress,
  type AddressSearchResult,
} from '@/lib/address-search'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function startsInManualMode(value: string) {
  const parsed = parseAddress(value)
  return parsed.address.length > 0 && parsed.zonecode.length === 0
}

type CustomerAddressInputProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  inputRef?: Ref<HTMLInputElement>
  disabled?: boolean
  id?: string
  className?: string
}

function AddressSearchPanel({
  onSelect,
  onClose,
}: {
  onSelect: (result: AddressSearchResult) => void
  onClose: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onSelectRef.current = onSelect
    onCloseRef.current = onClose
  }, [onClose, onSelect])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    void embedAddressSearch(element, {
      onSelect: (result) => {
        if (!cancelled) onSelectRef.current(result)
      },
      onClose: () => {
        if (!cancelled) onCloseRef.current()
      },
    })
      .then((fn) => {
        if (cancelled) return
        cleanup = fn
      })
      .catch((error: unknown) => {
        if (cancelled) return
        toast.error(
          error instanceof Error
            ? error.message
            : '주소 검색을 불러오지 못했습니다.'
        )
        onCloseRef.current()
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return (
    <div className='grid gap-2'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-sm text-muted-foreground'>주소를 검색하세요.</p>
        <Button type='button' variant='ghost' size='sm' onClick={onClose}>
          닫기
        </Button>
      </div>
      <div
        ref={containerRef}
        className='h-[360px] min-h-[360px] w-full overflow-hidden rounded-md border'
      />
    </div>
  )
}

export function CustomerAddressInput({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  disabled,
  id,
  className,
}: CustomerAddressInputProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [isManual, setIsManual] = useState(() => startsInManualMode(value))
  const [draft, setDraft] = useState(() => parseAddress(value))
  const lastEmittedRef = useRef(value)
  const manualId = useId()

  useEffect(() => {
    if (lastEmittedRef.current === value) return
    lastEmittedRef.current = value
    setDraft(parseAddress(value))
  }, [value])

  const canEditDetail = isManual || Boolean(draft.zonecode || draft.address)
  const baseAddress = composeAddress({ ...draft, detail: '' })

  useEffect(() => {
    void loadDaumPostcodeScript().catch(() => undefined)
  }, [])

  const emitDraft = (next: typeof draft) => {
    const composed = composeAddress(next)
    lastEmittedRef.current = composed
    setDraft(next)
    onChange(composed)
  }

  const handleSelect = useCallback(
    (result: AddressSearchResult) => {
      const next = {
        zonecode: result.zonecode,
        address: result.address,
        detail: draft.detail,
      }
      const composed = composeAddress(next)
      lastEmittedRef.current = composed
      setDraft(next)
      onChange(composed)
      setIsSearching(false)
    },
    [draft.detail, onChange]
  )

  const handleCloseSearch = useCallback(() => {
    setIsSearching(false)
  }, [])

  const handleSearch = () => {
    if (isAddressSearchReady()) {
      try {
        void openAddressSearch()
          .then((result) => {
            if (!result) return
            emitDraft({
              zonecode: result.zonecode,
              address: result.address,
              detail: draft.detail,
            })
          })
          .catch((error: unknown) => {
            toast.error(
              error instanceof Error
                ? error.message
                : '주소 검색을 불러오지 못했습니다.'
            )
          })
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : '주소 검색을 불러오지 못했습니다.'
        )
      }
      return
    }

    setIsSearching(true)
  }

  if (isSearching) {
    return (
      <AddressSearchPanel onSelect={handleSelect} onClose={handleCloseSearch} />
    )
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <div className='flex flex-wrap items-center gap-2'>
        {isManual ? null : (
          <Input
            value={draft.zonecode}
            readOnly
            placeholder='우편번호'
            aria-label='우편번호'
            autoComplete='off'
            disabled={disabled}
            className='w-28 shrink-0'
          />
        )}
        <Button
          type='button'
          variant='outline'
          disabled={disabled || isManual}
          onClick={handleSearch}
        >
          주소 검색
        </Button>
        <div className='flex items-center gap-2'>
          <Checkbox
            id={manualId}
            checked={isManual}
            disabled={disabled}
            onCheckedChange={(checked) => setIsManual(checked === true)}
          />
          <Label htmlFor={manualId} className='font-normal'>
            직접 입력
          </Label>
        </div>
      </div>
      <Input
        ref={inputRef}
        id={id}
        name={name}
        value={isManual ? baseAddress : draft.address}
        readOnly={!isManual}
        placeholder={isManual ? '주소 입력' : '주소 검색으로 입력'}
        aria-label='기본 주소'
        autoComplete='off'
        disabled={disabled}
        onChange={(event) => {
          if (!isManual) return
          emitDraft({
            zonecode: '',
            address: event.target.value,
            detail: draft.detail,
          })
        }}
        onBlur={onBlur}
      />
      <Input
        value={draft.detail}
        onChange={(event) =>
          emitDraft({
            ...draft,
            detail: event.target.value,
          })
        }
        onBlur={onBlur}
        placeholder={
          canEditDetail ? '상세주소 (선택)' : '주소를 먼저 검색하세요'
        }
        aria-label='상세주소'
        autoComplete='off'
        disabled={disabled || !canEditDetail}
      />
    </div>
  )
}
