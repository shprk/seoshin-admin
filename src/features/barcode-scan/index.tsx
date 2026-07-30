import { useEffect, useMemo, useState } from 'react'
import { getCustomerByParticipantNo, createCustomer } from '@/lib/api/customers'
import { createTask } from '@/lib/api/tasks'
import type { Customer } from '@/features/customers/data/schema'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BarcodeScanner } from './components/barcode-scanner'

type LookupState = 'idle' | 'loading' | 'found' | 'not-found' | 'error'

async function createTaskFromCustomer(customer: Customer) {
  return createTask({
    name: customer.name,
    participantNo: customer.participantNo,
    matchedParticipantNo: customer.matchedParticipantNo,
    address: customer.address,
  })
}

export function BarcodeScan() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [matchedParticipantNo, setMatchedParticipantNo] = useState('')
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const [creating, setCreating] = useState(false)

  const participantNo = useMemo(
    () => (scannedCode ? String(scannedCode) : ''),
    [scannedCode]
  )

  useEffect(() => {
    if (!scannedCode) return

    let cancelled = false
    setLookupState('loading')
    setError(null)
    setCustomer(null)
    setName('')
    setMatchedParticipantNo('')
    setAddress('')
    setMemo('')

    void (async () => {
      try {
        const found = await getCustomerByParticipantNo(scannedCode)
        if (cancelled) return

        if (found) {
          await createTaskFromCustomer(found)
          if (cancelled) return
          setCustomer(found)
          setLookupState('found')
        } else {
          setLookupState('not-found')
        }
      } catch (e) {
        if (cancelled) return
        setError(
          e instanceof Error ? e.message : '스캔 처리 중 오류가 발생했습니다.'
        )
        setLookupState('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [scannedCode])

  const handleDetected = (code: string) => {
    if (scannedCode === code) return
    setScannedCode(code)
  }

  const reset = () => {
    setScannedCode(null)
    setLookupState('idle')
    setCustomer(null)
    setError(null)
    setCreating(false)
  }

  const canCreate = useMemo(() => {
    if (!participantNo) return false
    if (!name.trim()) return false
    return true
  }, [participantNo, name])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedCode) return
    if (!canCreate) return

    setCreating(true)
    setError(null)

    try {
      const created = await createCustomer({
        participantNo: scannedCode,
        name: name.trim(),
        matchedParticipantNo: matchedParticipantNo.trim() || null,
        address: address.trim(),
        memo: memo.trim(),
      })
      await createTaskFromCustomer(created)
      setCustomer(created)
      setLookupState('found')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : '고객/작업 등록 중 오류가 발생했습니다.'
      )
      setLookupState('error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>바코드 스캔</h2>
            <p className='text-muted-foreground'>
              바코드를 스캔하면 고객을 조회·등록하고, 작업 기록을 누적합니다.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {lookupState === 'idle'
                ? '카메라로 바코드를 스캔하세요'
                : lookupState === 'loading'
                  ? '처리 중...'
                  : lookupState === 'found'
                    ? '작업 등록 완료'
                    : lookupState === 'not-found'
                      ? '해당 고객이 없습니다 (등록 진행)'
                      : '오류'}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {lookupState === 'idle' && (
              <BarcodeScanner active={!scannedCode} onDetected={handleDetected} />
            )}

            {lookupState === 'loading' && (
              <div className='text-sm text-muted-foreground'>
                잠시만 기다려주세요.
              </div>
            )}

            {lookupState === 'found' && customer && (
              <>
                <div className='rounded-md border p-3 text-sm space-y-1'>
                  <div>
                    <span className='font-medium'>참가번호</span>{' '}
                    {customer.participantNo}
                  </div>
                  <div>
                    <span className='font-medium'>이름</span> {customer.name}
                  </div>
                  <div>
                    <span className='font-medium'>매칭상대 참가번호</span>{' '}
                    {customer.matchedParticipantNo || '-'}
                  </div>
                  <div>
                    <span className='font-medium'>주소</span>{' '}
                    {customer.address || '-'}
                  </div>
                  <div>
                    <span className='font-medium'>메모</span>{' '}
                    {customer.memo || '-'}
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Button variant='outline' onClick={reset}>
                    다시 스캔
                  </Button>
                </div>
              </>
            )}

            {lookupState === 'not-found' && scannedCode && (
              <form onSubmit={handleCreate} className='space-y-4'>
                {error && (
                  <div className='text-sm text-destructive'>{error}</div>
                )}

                <div className='grid gap-2'>
                  <Label>참가번호 (스캔값)</Label>
                  <Input value={participantNo} disabled />
                </div>

                <div className='grid gap-2'>
                  <Label>이름</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className='grid gap-2'>
                  <Label>매칭상대 참가번호</Label>
                  <Input
                    value={matchedParticipantNo}
                    onChange={(e) => setMatchedParticipantNo(e.target.value)}
                    placeholder='선택 입력'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label>주소</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder='선택 입력'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label>메모</Label>
                  <Textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder='선택 입력'
                    className='min-h-[100px]'
                  />
                </div>

                <div className='flex items-center gap-2'>
                  <Button type='submit' disabled={!canCreate || creating}>
                    {creating ? '등록 중...' : '고객·작업 등록'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={reset}
                    disabled={creating}
                  >
                    취소
                  </Button>
                </div>
              </form>
            )}

            {lookupState === 'error' && (
              <>
                {error && (
                  <div className='text-sm text-destructive'>{error}</div>
                )}
                <Button variant='outline' onClick={reset}>
                  다시 스캔
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
