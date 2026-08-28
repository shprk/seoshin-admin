import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type ScanWork } from '../data/scan-work-schema'
import { ScanWorksDeleteDialog } from './scan-works-delete-dialog'

const RECORD: ScanWork = {
  id: 'scan-001',
  name: '김서연',
  participantNo: 'P-1001',
  matchedParticipantNo: null,
  address: '',
  createdAt: new Date('2026-08-23'),
}

describe('ScanWorksDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('asks to delete a single scan record by name and participant number', async () => {
    const { getByRole, getByText } = await render(
      <ScanWorksDeleteDialog
        records={[RECORD]}
        open
        onOpenChange={vi.fn()}
        isLoading={false}
        onConfirm={vi.fn()}
      />
    )

    await expect
      .element(getByRole('heading', { level: 2, name: '스캔 기록 삭제' }))
      .toBeInTheDocument()
    await expect
      .element(getByText('김서연(P-1001) 스캔 기록을 삭제할까요?'))
      .toBeInTheDocument()
  })

  it('asks to delete multiple selected scan records', async () => {
    const { getByText } = await render(
      <ScanWorksDeleteDialog
        records={[RECORD, { ...RECORD, id: 'scan-002' }]}
        open
        onOpenChange={vi.fn()}
        isLoading={false}
        onConfirm={vi.fn()}
      />
    )

    await expect
      .element(getByText('선택한 2건의 스캔 기록을 삭제할까요?'))
      .toBeInTheDocument()
  })

  it('calls onConfirm when delete is clicked', async () => {
    const onConfirm = vi.fn()
    const { getByRole } = await render(
      <ScanWorksDeleteDialog
        records={[RECORD]}
        open
        onOpenChange={vi.fn()}
        isLoading={false}
        onConfirm={onConfirm}
      />
    )

    await userEvent.click(getByRole('button', { name: '삭제' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
