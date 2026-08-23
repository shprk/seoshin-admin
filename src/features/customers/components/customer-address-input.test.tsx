import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { CustomerAddressInput } from './customer-address-input'

const embedAddressSearchMock = vi.fn()
const loadDaumPostcodeScriptMock = vi.fn()
const openAddressSearchMock = vi.fn()
const isAddressSearchReadyMock = vi.fn()

vi.mock('@/lib/address-search', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/address-search')>()
  return {
    ...actual,
    loadDaumPostcodeScript: (...args: unknown[]) =>
      loadDaumPostcodeScriptMock(...args),
    embedAddressSearch: (...args: unknown[]) => embedAddressSearchMock(...args),
    openAddressSearch: (...args: unknown[]) => openAddressSearchMock(...args),
    isAddressSearchReady: (...args: unknown[]) =>
      isAddressSearchReadyMock(...args),
  }
})

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <CustomerAddressInput value={value} onChange={setValue} />
}

describe('CustomerAddressInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadDaumPostcodeScriptMock.mockResolvedValue(undefined)
    embedAddressSearchMock.mockResolvedValue(() => undefined)
    isAddressSearchReadyMock.mockReturnValue(true)
    openAddressSearchMock.mockResolvedValue({
      zonecode: '03923',
      address: '서울특별시 마포구 월드컵북로 120',
    })
  })

  it('renders postal code, search, and detail fields', async () => {
    const { getByRole } = await render(<Harness />)

    await expect
      .element(getByRole('textbox', { name: '우편번호' }))
      .toBeInTheDocument()
    await expect
      .element(getByRole('button', { name: '주소 검색' }))
      .toBeInTheDocument()
    await expect
      .element(getByRole('textbox', { name: '기본 주소' }))
      .toBeInTheDocument()
    await expect
      .element(getByRole('textbox', { name: '상세주소' }))
      .toBeInTheDocument()
  })

  it('keeps detail disabled until an address is selected', async () => {
    const { getByRole } = await render(<Harness />)

    await expect
      .element(getByRole('textbox', { name: '상세주소' }))
      .toBeDisabled()
  })

  it('lets the user type an address after checking 직접 입력', async () => {
    const { getByRole } = await render(<Harness />)
    const address = getByRole('textbox', { name: '기본 주소' })

    await expect.element(address).toHaveAttribute('readonly')

    await userEvent.click(getByRole('checkbox', { name: '직접 입력' }))
    await expect.element(address).not.toHaveAttribute('readonly')
    await expect
      .element(getByRole('button', { name: '주소 검색' }))
      .toBeDisabled()

    await userEvent.fill(address, '서울특별시 마포구 월드컵북로 120')
    await expect
      .element(address)
      .toHaveValue('서울특별시 마포구 월드컵북로 120')

    await userEvent.fill(address, '서울 ')
    await expect.element(address).toHaveValue('서울 ')
    await expect
      .element(getByRole('textbox', { name: '우편번호' }))
      .not.toBeInTheDocument()
  })

  it('keeps typed digits in the address field while 직접 입력 is on', async () => {
    const { getByRole } = await render(<Harness />)

    await userEvent.click(getByRole('checkbox', { name: '직접 입력' }))
    const address = getByRole('textbox', { name: '기본 주소' })
    await userEvent.fill(address, '03923-1')

    await expect.element(address).toHaveValue('03923-1')
    await expect
      .element(getByRole('textbox', { name: '우편번호' }))
      .not.toBeInTheDocument()
  })

  it('starts in 직접 입력 when the saved address has no postal code', async () => {
    const { getByRole } = await render(
      <Harness initial='서울특별시 마포구 월드컵북로 120' />
    )

    await expect
      .element(getByRole('checkbox', { name: '직접 입력' }))
      .toBeChecked()
    await expect
      .element(getByRole('textbox', { name: '기본 주소' }))
      .not.toHaveAttribute('readonly')
    await expect
      .element(getByRole('button', { name: '주소 검색' }))
      .toBeDisabled()
  })

  it('fills postal code and address after a search selection', async () => {
    const { getByRole } = await render(<Harness />)
    await userEvent.click(getByRole('button', { name: '주소 검색' }))

    await vi.waitFor(() => expect(openAddressSearchMock).toHaveBeenCalledOnce())
    await expect
      .element(getByRole('textbox', { name: '우편번호' }))
      .toHaveValue('03923')
    await expect
      .element(getByRole('textbox', { name: '기본 주소' }))
      .toHaveValue('서울특별시 마포구 월드컵북로 120')
  })

  it('embeds the search UI when the popup script is not ready', async () => {
    isAddressSearchReadyMock.mockReturnValue(false)
    embedAddressSearchMock.mockImplementation(
      async (
        _element: HTMLElement,
        handlers: {
          onSelect: (result: { zonecode: string; address: string }) => void
        }
      ) => {
        handlers.onSelect({
          zonecode: '03923',
          address: '서울특별시 마포구 월드컵북로 120',
        })
        return () => undefined
      }
    )

    const { getByRole } = await render(<Harness />)
    await userEvent.click(getByRole('button', { name: '주소 검색' }))

    await expect
      .element(getByRole('textbox', { name: '우편번호' }))
      .toHaveValue('03923')
    expect(openAddressSearchMock).not.toHaveBeenCalled()
  })

  it('appends a detail line onto a searched address', async () => {
    const { getByRole } = await render(
      <Harness initial='03923 서울특별시 마포구 월드컵북로 120' />
    )

    const detail = getByRole('textbox', { name: '상세주소' })
    await expect.element(detail).toBeEnabled()
    await userEvent.fill(detail, '101동 202호')

    await expect.element(detail).toHaveValue('101동 202호')
  })

  it('shows a legacy freeform address in the base field', async () => {
    const { getByRole } = await render(
      <Harness initial='서울특별시 마포구 월드컵북로 120' />
    )

    await expect
      .element(getByRole('checkbox', { name: '직접 입력' }))
      .toBeChecked()
    await expect
      .element(getByRole('textbox', { name: '우편번호' }))
      .not.toBeInTheDocument()
    await expect
      .element(getByRole('textbox', { name: '기본 주소' }))
      .toHaveValue('서울특별시 마포구 월드컵북로 120')
  })
})
