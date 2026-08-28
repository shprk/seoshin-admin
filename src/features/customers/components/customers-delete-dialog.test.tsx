import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type Customer } from '../data/schema'
import { CustomersDeleteDialog } from './customers-delete-dialog'

const CUSTOMER: Customer = {
  id: 'cust-001',
  name: '김서연',
  participantNo: 'P-1001',
  matchedParticipantNo: null,
  ageGroup: '30대',
  address: '',
  email: '',
  letter1Arrived: false,
  letter2Arrived: false,
  letter3Arrived: false,
  memo: '',
  createdAt: new Date('2026-08-23'),
}

describe('CustomersDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('asks to delete a single customer by name and participant number', async () => {
    const { getByRole, getByText } = await render(
      <CustomersDeleteDialog
        customers={[CUSTOMER]}
        open
        onOpenChange={vi.fn()}
        isLoading={false}
        onConfirm={vi.fn()}
      />
    )

    await expect
      .element(getByRole('heading', { level: 2, name: '고객 삭제' }))
      .toBeInTheDocument()
    await expect
      .element(getByText('김서연(P-1001) 고객을 삭제할까요?'))
      .toBeInTheDocument()
  })

  it('asks to delete multiple selected customers', async () => {
    const { getByText } = await render(
      <CustomersDeleteDialog
        customers={[CUSTOMER, { ...CUSTOMER, id: 'cust-002' }]}
        open
        onOpenChange={vi.fn()}
        isLoading={false}
        onConfirm={vi.fn()}
      />
    )

    await expect
      .element(getByText('선택한 2명의 고객을 삭제할까요?'))
      .toBeInTheDocument()
  })

  it('calls onConfirm when delete is clicked', async () => {
    const onConfirm = vi.fn()
    const { getByRole } = await render(
      <CustomersDeleteDialog
        customers={[CUSTOMER]}
        open
        onOpenChange={vi.fn()}
        isLoading={false}
        onConfirm={onConfirm}
      />
    )

    await userEvent.click(getByRole('button', { name: '삭제' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('closes when cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <CustomersDeleteDialog
        customers={[CUSTOMER]}
        open
        onOpenChange={onOpenChange}
        isLoading={false}
        onConfirm={vi.fn()}
      />
    )

    await userEvent.click(getByRole('button', { name: '취소' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
