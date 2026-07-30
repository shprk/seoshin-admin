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
import { deleteTask } from '@/lib/api/tasks'
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
import { type ScanWork } from '../data/scan-work-schema'
import { createScanWorksColumns } from './scan-works-columns'

type ScanWorksTableProps = {
  data: ScanWork[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onDeleted?: () => void
}

export function ScanWorksTable({
  data,
  search,
  navigate,
  onDeleted,
}: ScanWorksTableProps) {
  const [rows, setRows] = useState(data)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pendingDelete, setPendingDelete] = useState<ScanWork | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setRows(data)
  }, [data])

  const columns = useMemo(
    () =>
      createScanWorksColumns({
        onDelete: (row) => setPendingDelete(row),
      }),
    []
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

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return

    setIsDeleting(true)
    try {
      await deleteTask(pendingDelete.id)
      setRows((current) =>
        current.filter((row) => row.id !== pendingDelete.id)
      )
      setPendingDelete(null)
      onDeleted?.()
      toast.success('작업을 삭제했습니다.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '작업을 삭제하지 못했습니다.'
      )
    } finally {
      setIsDeleting(false)
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
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDelete(null)
        }}
        title='작업 삭제'
        desc={
          pendingDelete
            ? `${pendingDelete.name}(${pendingDelete.participantNo}) 작업 기록을 삭제할까요?`
            : ''
        }
        cancelBtnText='취소'
        confirmText='삭제'
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          void handleConfirmDelete()
        }}
      />
    </div>
  )
}
