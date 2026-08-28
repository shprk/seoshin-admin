import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { CustomersRowActions } from './customers-row-actions'

describe('CustomersRowActions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onEdit and onDelete from the row menu', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const { getByRole } = await render(
      <CustomersRowActions onEdit={onEdit} onDelete={onDelete} />
    )

    await userEvent.click(getByRole('button', { name: '메뉴 열기' }))
    await userEvent.click(getByRole('menuitem', { name: '수정' }))
    expect(onEdit).toHaveBeenCalledOnce()

    await userEvent.click(getByRole('button', { name: '메뉴 열기' }))
    await userEvent.click(getByRole('menuitem', { name: '삭제' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
