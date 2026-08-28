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
import {
  deleteCustomers,
  updateCustomerLetterArrived,
} from '@/lib/api/customers'
import { letterFieldLabels, type LetterField } from '@/lib/letter-fields'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type Customer } from '../data/schema'
import { CustomerEditDialog } from './customer-edit-dialog'
import { CustomersBulkActions } from './customers-bulk-actions'
import { createCustomersColumns } from './customers-columns'
import { CustomersDeleteDialog } from './customers-delete-dialog'

type CustomersTableProps = {
  data: Customer[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onCustomerUpdated?: () => void
}

type PendingLetterChange = {
  id: string
  name: string
  field: LetterField
  letterArrived: boolean
}

function deletedCustomersMessage(count: number) {
  return count === 1
    ? '고객을 삭제했습니다.'
    : `${count}명의 고객을 삭제했습니다.`
}

export function CustomersTable({
  data,
  search,
  navigate,
  onCustomerUpdated,
}: CustomersTableProps) {
  const [rows, setRows] = useState(data)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pendingChange, setPendingChange] =
    useState<PendingLetterChange | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Customer[] | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    setRows(data)
  }, [data])

  const columns = useMemo(
    () =>
      createCustomersColumns({
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
        onEdit: (customer) => setEditingCustomer(customer),
        onDelete: (customer) => setPendingDelete([customer]),
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

  const handleConfirmLetterChange = async () => {
    if (!pendingChange) return

    setIsUpdating(true)
    try {
      const updated = await updateCustomerLetterArrived(
        pendingChange.id,
        pendingChange.field,
        pendingChange.letterArrived
      )

      setRows((current) =>
        current.map((row) => (row.id === updated.id ? updated : row))
      )
      setPendingChange(null)
      onCustomerUpdated?.()
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

  const handleConfirmDelete = async () => {
    if (!pendingDelete || pendingDelete.length === 0) return

    const ids = pendingDelete.map((customer) => customer.id)
    setIsDeleting(true)
    try {
      await deleteCustomers(ids)
      setRows((current) => current.filter((row) => !ids.includes(row.id)))
      table.resetRowSelection()
      setPendingDelete(null)
      onCustomerUpdated?.()
      toast.success(deletedCustomersMessage(ids.length))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '고객을 삭제하지 못했습니다.'
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
      <CustomersBulkActions
        table={table}
        onDelete={(customers) => setPendingDelete(customers)}
      />

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

      <CustomersDeleteDialog
        customers={pendingDelete ?? []}
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        isLoading={isDeleting}
        onConfirm={() => {
          void handleConfirmDelete()
        }}
      />

      <CustomerEditDialog
        customer={editingCustomer}
        open={!!editingCustomer}
        onOpenChange={(open) => {
          if (!open) setEditingCustomer(null)
        }}
        onUpdated={(updated) => {
          setRows((current) =>
            current.map((row) => (row.id === updated.id ? updated : row))
          )
          onCustomerUpdated?.()
        }}
      />
    </div>
  )
}
