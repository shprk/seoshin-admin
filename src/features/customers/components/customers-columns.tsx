import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  letterFieldLabels,
  letterFields,
  type LetterField,
} from '@/lib/letter-fields'
import { type Customer } from '../data/schema'

type CreateCustomersColumnsOptions = {
  onLetterArrivedChange: (
    id: string,
    field: LetterField,
    letterArrived: boolean
  ) => void
}

export function createCustomersColumns({
  onLetterArrivedChange,
}: CreateCustomersColumnsOptions): ColumnDef<Customer>[] {
  return [
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
      accessorKey: 'matchedParticipantNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='매칭상대 참가번호' />
      ),
      cell: ({ row }) => {
        const value = row.getValue('matchedParticipantNo') as string | null
        return <div>{value ?? '-'}</div>
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='주소' />
      ),
      cell: ({ row }) => {
        const address = row.getValue('address') as string
        return <div className='max-w-56 truncate'>{address || '-'}</div>
      },
      enableSorting: false,
    },
    {
      id: 'letterArrived',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='편지 도착 여부' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col gap-2 py-1'>
          {letterFields.map((field) => (
            <label
              key={field}
              className='flex items-center gap-2 text-sm whitespace-nowrap'
            >
              <Checkbox
                checked={row.original[field]}
                onCheckedChange={(checked) => {
                  onLetterArrivedChange(
                    row.original.id,
                    field,
                    checked === true
                  )
                }}
                aria-label={`${row.original.name} ${letterFieldLabels[field]}`}
              />
              <span>{letterFieldLabels[field]}</span>
            </label>
          ))}
        </div>
      ),
      enableSorting: false,
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
        <DataTableColumnHeader column={column} title='등록일시' />
      ),
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date
        return (
          <div className='whitespace-nowrap'>
            <span>{format(date, 'yyyy-MM-dd')}</span>{' '}
            <span className='text-xs text-muted-foreground'>
              {format(date, 'HH:mm')}
            </span>
          </div>
        )
      },
    },
  ]
}
