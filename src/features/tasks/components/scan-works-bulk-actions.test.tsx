import { createTableMock } from '@/test-utils/tanstack-table'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ScanWorksBulkActions } from './scan-works-bulk-actions'

describe('ScanWorksBulkActions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('asks to delete the selected scan records', async () => {
    const { table } = createTableMock(2)
    const onDelete = vi.fn()
    const { getByRole } = await render(
      <ScanWorksBulkActions table={table} onDelete={onDelete} />
    )

    await expect
      .element(getByRole('toolbar'))
      .toHaveTextContent('스캔 기록 2건 선택됨')

    await userEvent.click(
      getByRole('button', { name: '선택한 스캔 기록 삭제' })
    )
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete.mock.calls[0][0]).toHaveLength(2)
  })
})
