import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Customer } from '../data/schema'

type CustomersBulkActionsProps<TData> = {
  table: Table<TData>
  onDelete: (customers: Customer[]) => void
}

export function CustomersBulkActions<TData>({
  table,
  onDelete,
}: CustomersBulkActionsProps<TData>) {
  const selectedCustomers = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as Customer)

  return (
    <BulkActionsToolbar
      table={table}
      entityName='고객'
      renderSelectedLabel={(count) => <>고객 {count}명 선택됨</>}
      selectedAnnouncement={(count) =>
        `고객 ${count}명 선택됨. 일괄 작업을 사용할 수 있습니다.`
      }
      toolbarAriaLabel={(count) => `선택한 ${count}명의 고객에 대한 일괄 작업`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => onDelete(selectedCustomers)}
            className='size-8'
            aria-label='선택한 고객 삭제'
            title='선택한 고객 삭제'
          >
            <Trash2 />
            <span className='sr-only'>선택한 고객 삭제</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>선택한 고객 삭제</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
