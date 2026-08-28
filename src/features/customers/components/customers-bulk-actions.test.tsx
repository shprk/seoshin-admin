import { createTableMock } from '@/test-utils/tanstack-table'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { CustomersBulkActions } from './customers-bulk-actions'

describe('CustomersBulkActions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('asks to delete the selected customers', async () => {
    const { table } = createTableMock(2)
    const onDelete = vi.fn()
    const { getByRole } = await render(
      <CustomersBulkActions table={table} onDelete={onDelete} />
    )

    await expect
      .element(getByRole('toolbar'))
      .toHaveTextContent('고객 2명 선택됨')

    await userEvent.click(getByRole('button', { name: '선택한 고객 삭제' }))
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete.mock.calls[0][0]).toHaveLength(2)
  })
})
