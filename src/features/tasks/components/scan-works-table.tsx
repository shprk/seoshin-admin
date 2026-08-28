import { useEffect, useMemo, useState } from 'react'
import {
  type RowSelectionState,
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
import { deleteTasks } from '@/lib/api/tasks'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type ScanWork } from '../data/scan-work-schema'
import { ScanWorksBulkActions } from './scan-works-bulk-actions'
import { createScanWorksColumns } from './scan-works-columns'
import { ScanWorksDeleteDialog } from './scan-works-delete-dialog'

type ScanWorksTableProps = {
  data: ScanWork[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onDeleted?: () => void
}

function deletedRecordsMessage(count: number) {
  return count === 1
    ? '스캔 기록을 삭제했습니다.'
    : `${count}건의 스캔 기록을 삭제했습니다.`
}

export function ScanWorksTable({
  data,
  search,
  navigate,
  onDeleted,
}: ScanWorksTableProps) {
  const [rows, setRows] = useState(data)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pendingDelete, setPendingDelete] = useState<ScanWork[] | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setRows(data)
  }, [data])

  const columns = useMemo(() => createScanWorksColumns(), [])

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
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
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
    if (!pendingDelete || pendingDelete.length === 0) return

    const ids = pendingDelete.map((record) => record.id)
    setIsDeleting(true)
    try {
      await deleteTasks(ids)
      setRows((current) => current.filter((row) => !ids.includes(row.id)))
      table.resetRowSelection()
      setPendingDelete(null)
      onDeleted?.()
      toast.success(deletedRecordsMessage(ids.length))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '스캔 기록을 삭제하지 못했습니다.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='이름으로 검색...'
        searchKey='name'
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
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
      <ScanWorksBulkActions
        table={table}
        onDelete={(records) => setPendingDelete(records)}
      />

      <ScanWorksDeleteDialog
        records={pendingDelete ?? []}
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        isLoading={isDeleting}
        onConfirm={() => {
          void handleConfirmDelete()
        }}
      />
    </div>
  )
}
