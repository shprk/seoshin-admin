import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { toast } from 'sonner'
import { type Customer } from '../data/schema'
import { CustomerCreateDialog } from './customer-create-dialog'

const createCustomerMock = vi.fn()

vi.mock('@/lib/api/customers', () => ({
  createCustomer: (...args: unknown[]) => createCustomerMock(...args),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const CREATED_CUSTOMER: Customer = {
  id: 'new-customer',
  name: '홍길동',
  participantNo: 'P-3001',
  matchedParticipantNo: null,
  ageGroup: '20대',
  address: '',
  email: '',
  letter1Arrived: false,
  letter2Arrived: false,
  letter3Arrived: false,
  memo: '',
  createdAt: new Date('2026-08-23'),
}

describe('CustomerCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createCustomerMock.mockResolvedValue(CREATED_CUSTOMER)
  })

  it('renders the dialog title and description', async () => {
    const { getByRole, getByText } = await render(
      <CustomerCreateDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />
    )

    await expect
      .element(getByRole('heading', { level: 2, name: '고객 등록' }))
      .toBeInTheDocument()
    await expect
      .element(getByText('참가번호를 직접 입력해 고객을 등록합니다.'))
      .toBeInTheDocument()
  })

  it('shows validation messages when submitting empty fields', async () => {
    const { getByRole, getByText } = await render(
      <CustomerCreateDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: '등록' }))

    await expect
      .element(getByText('참가번호를 입력해주세요.'))
      .toBeInTheDocument()
    await expect.element(getByText('이름을 입력해주세요.')).toBeInTheDocument()
    await expect.element(getByText('연령을 선택해주세요.')).toBeInTheDocument()
    expect(createCustomerMock).not.toHaveBeenCalled()
  })

  it('creates a customer without a scan task and closes on success', async () => {
    const onOpenChange = vi.fn()
    const onCreated = vi.fn()
    const { getByRole } = await render(
      <CustomerCreateDialog
        open
        onOpenChange={onOpenChange}
        onCreated={onCreated}
      />
    )

    await userEvent.fill(
      getByRole('textbox', { name: '참가번호', exact: true }),
      'P-3001'
    )
    await userEvent.fill(getByRole('textbox', { name: '이름' }), '홍길동')
    await userEvent.click(getByRole('combobox', { name: '연령' }))
    await userEvent.click(getByRole('option', { name: '20대' }))
    await userEvent.click(getByRole('button', { name: '등록' }))

    await vi.waitFor(() => expect(createCustomerMock).toHaveBeenCalledOnce())
    expect(createCustomerMock).toHaveBeenCalledWith({
      participantNo: 'P-3001',
      name: '홍길동',
      ageGroup: '20대',
      matchedParticipantNo: null,
      address: '',
      email: '',
      memo: '',
    })
    expect(onCreated).toHaveBeenCalledWith(CREATED_CUSTOMER)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(toast.success).toHaveBeenCalledWith('고객을 등록했습니다.')
  })

  it('shows the API error when the participant number already exists', async () => {
    createCustomerMock.mockRejectedValue(
      new Error('이미 등록된 참가번호입니다.')
    )
    const onCreated = vi.fn()
    const { getByRole } = await render(
      <CustomerCreateDialog open onOpenChange={vi.fn()} onCreated={onCreated} />
    )

    await userEvent.fill(
      getByRole('textbox', { name: '참가번호', exact: true }),
      'P-1001'
    )
    await userEvent.fill(getByRole('textbox', { name: '이름' }), '홍길동')
    await userEvent.click(getByRole('combobox', { name: '연령' }))
    await userEvent.click(getByRole('option', { name: '20대' }))
    await userEvent.click(getByRole('button', { name: '등록' }))

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('이미 등록된 참가번호입니다.')
    )
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('resets entered values when the dialog is closed and reopened', async () => {
    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type='button' onClick={() => setOpen(true)}>
            Reopen
          </button>
          <CustomerCreateDialog
            open={open}
            onOpenChange={setOpen}
            onCreated={vi.fn()}
          />
        </>
      )
    }

    const { getByRole } = await render(<Harness />)

    const participantInput = getByRole('textbox', {
      name: '참가번호',
      exact: true,
    })
    await userEvent.fill(participantInput, 'P-3001')
    await expect.element(participantInput).toHaveValue('P-3001')

    await userEvent.click(getByRole('button', { name: '취소' }))
    await userEvent.click(getByRole('button', { name: 'Reopen' }))

    await expect
      .element(getByRole('textbox', { name: '참가번호', exact: true }))
      .toHaveValue('')
  })
})
