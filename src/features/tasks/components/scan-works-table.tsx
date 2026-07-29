import { useEffect, useMemo, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { updateTaskLetterArrived } from '@/lib/api/tasks'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  letterFieldLabels,
  type LetterField,
  type ScanWork,
} from '../data/scan-work-schema'
import { createScanWorksColumns } from './scan-works-columns'

type ScanWorksTableProps = {
  data: ScanWork[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onLetterArrivedUpdated?: () => void
}

type PendingLetterChange = {
  id: string
  name: string
  field: LetterField
  letterArrived: boolean
}

export function ScanWorksTable({
  data,
  search,
  navigate,
  onLetterArrivedUpdated,
}: ScanWorksTableProps) {
  const [rows, setRows] = useState(data)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pendingChange, setPendingChange] = useState<PendingLetterChange | null>(
    null
  )
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setRows(data)
  }, [data])

  const columns = useMemo(
    () =>
      createScanWorksColumns({
        onLetterArrivedChange: (id, field, letterArrived) => {
          const target = rows.find((row) => row.id === id)
          if (!target || target[field] === letterArrived) return

          setPendingChange({
            id,
            name: target.name,
            field,
            letterArrived,
          })
        },
      }),
    [rows]
  )

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [{ columnId: 'name', searchKey: 'name', type: 'string' }],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  const handleConfirmLetterChange = async () => {
    if (!pendingChange) return

    setIsUpdating(true)
    try {
      const updated = await updateTaskLetterArrived(
        pendingChange.id,
        pendingChange.field,
        pendingChange.letterArrived
      )

      setRows((current) =>
        current.map((row) => (row.id === updated.id ? updated : row))
      )
      setPendingChange(null)
      onLetterArrivedUpdated?.()
      toast.success('편지 도착 여부를 변경했습니다.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '편지 도착 여부를 변경하지 못했습니다.'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='이름으로 검색...'
        searchKey='name'
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />

      <ConfirmDialog
        open={!!pendingChange}
        onOpenChange={(open) => {
          if (!open && !isUpdating) setPendingChange(null)
        }}
        title='편지 도착 여부 변경'
        desc={
          pendingChange
            ? `${pendingChange.name}님의 ${
                letterFieldLabels[pendingChange.field]
              }를 "${
                pendingChange.letterArrived ? '도착' : '미도착'
              }"으로 변경할까요?`
            : ''
        }
        cancelBtnText='취소'
        confirmText='변경'
        isLoading={isUpdating}
        handleConfirm={() => {
          void handleConfirmLetterChange()
        }}
      />
    </div>
  )
}
