import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { type ScanWork } from '../data/scan-work-schema'

type CreateScanWorksColumnsOptions = {
  onDelete: (row: ScanWork) => void
}

export function createScanWorksColumns({
  onDelete,
}: CreateScanWorksColumnsOptions): ColumnDef<ScanWork>[] {
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
    {
      id: 'actions',
      header: () => <span className='sr-only'>삭제</span>,
      cell: ({ row }) => (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-destructive hover:text-destructive'
          onClick={() => onDelete(row.original)}
          aria-label={`${row.original.name} 작업 삭제`}
        >
          <Trash2 className='size-4' />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
