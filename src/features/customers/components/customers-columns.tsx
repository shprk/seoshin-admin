import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Customer } from '../data/schema'

export const customersColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='이름' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'participantNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='참가번호' />
    ),
    cell: ({ row }) => <div>{row.getValue('participantNo')}</div>,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='연락처' />
    ),
    cell: ({ row }) => <div>{row.getValue('phone')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'ageGroup',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='연령대' />
    ),
    cell: ({ row }) => <div>{row.getValue('ageGroup')}</div>,
  },
  {
    accessorKey: 'memo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='메모' />
    ),
    cell: ({ row }) => {
      const memo = row.getValue('memo') as string
      return <div className='max-w-48 truncate'>{memo || '-'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='등록일' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return <div>{format(date, 'yyyy-MM-dd')}</div>
    },
  },
]
