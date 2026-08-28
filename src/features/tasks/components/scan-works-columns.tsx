import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type ScanWork } from '../data/scan-work-schema'

export function createScanWorksColumns(): ColumnDef<ScanWork>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='전체 선택'
          className='translate-y-0.5'
        />
      ),
      meta: {
        className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='행 선택'
          className='translate-y-0.5'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      meta: { tdClassName: 'whitespace-normal' },
      cell: ({ row }) => {
        const address = row.getValue('address') as string
        return (
          <div className='max-w-56 break-words whitespace-normal'>
            {address || '-'}
          </div>
        )
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
