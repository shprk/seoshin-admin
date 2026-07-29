import { useEffect, useMemo, useState } from 'react'
import { getCustomerByParticipantNo, createCustomer } from '@/lib/api/customers'
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

export function BarcodeScan() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
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
    setPhone('')
    setAgeGroup('')
    setMemo('')

    void (async () => {
      try {
        const found = await getCustomerByParticipantNo(scannedCode)
        if (cancelled) return

        if (found) {
          setCustomer(found)
          setLookupState('found')
        } else {
          setLookupState('not-found')
        }
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '고객 조회 중 오류가 발생했습니다.')
        setLookupState('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [scannedCode])

  const handleDetected = (code: string) => {
    // Prevent duplicate lookups for the same scan session
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
    if (!phone.trim()) return false
    return true
  }, [participantNo, name, phone])

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
        phone: phone.trim(),
        ageGroup: ageGroup.trim(),
        memo: memo.trim(),
      })
      setCustomer(created)
      setLookupState('found')
    } catch (e) {
      setError(e instanceof Error ? e.message : '고객 생성 중 오류가 발생했습니다.')
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
              편지지에 붙은 1D 바코드를 스캔해 고객을 조회하고,
              없으면 등록합니다.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {lookupState === 'idle'
                ? '카메라로 바코드를 스캔하세요'
                : lookupState === 'loading'
                  ? '고객을 조회하는 중...'
                  : lookupState === 'found'
                    ? '고객 조회 완료'
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
              <div className='text-sm text-muted-foreground'>잠시만 기다려주세요.</div>
            )}

            {lookupState === 'found' && customer && (
              <>
                <div className='rounded-md border p-3 text-sm'>
                  <div>
                    <span className='font-medium'>참가번호</span> {customer.participantNo}
                  </div>
                  <div>
                    <span className='font-medium'>이름</span> {customer.name}
                  </div>
                  <div>
                    <span className='font-medium'>전화번호</span> {customer.phone}
                  </div>
                  <div>
                    <span className='font-medium'>연령대</span> {customer.ageGroup}
                  </div>
                  <div>
                    <span className='font-medium'>메모</span> {customer.memo || '-'}
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
                {error && <div className='text-sm text-destructive'>{error}</div>}

                <div className='grid gap-2'>
                  <Label>참가번호 (스캔값)</Label>
                  <Input value={participantNo} disabled />
                </div>

                <div className='grid gap-2'>
                  <Label>이름</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className='grid gap-2'>
                  <Label>전화번호</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className='grid gap-2'>
                  <Label>연령대</Label>
                  <Input
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    placeholder='예: 10대/20대/기타'
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
                    {creating ? '등록 중...' : '고객 등록'}
                  </Button>
                  <Button type='button' variant='outline' onClick={reset} disabled={creating}>
                    취소
                  </Button>
                </div>
              </form>
            )}

            {lookupState === 'error' && (
              <>
                {error && <div className='text-sm text-destructive'>{error}</div>}
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

