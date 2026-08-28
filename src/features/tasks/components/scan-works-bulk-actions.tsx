import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type ScanWork } from '../data/scan-work-schema'

type ScanWorksBulkActionsProps<TData> = {
  table: Table<TData>
  onDelete: (records: ScanWork[]) => void
}

export function ScanWorksBulkActions<TData>({
  table,
  onDelete,
}: ScanWorksBulkActionsProps<TData>) {
  const selectedRecords = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as ScanWork)

  return (
    <BulkActionsToolbar
      table={table}
      entityName='스캔 기록'
      renderSelectedLabel={(count) => <>스캔 기록 {count}건 선택됨</>}
      selectedAnnouncement={(count) =>
        `스캔 기록 ${count}건 선택됨. 일괄 작업을 사용할 수 있습니다.`
      }
      toolbarAriaLabel={(count) =>
        `선택한 ${count}건의 스캔 기록에 대한 일괄 작업`
      }
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => onDelete(selectedRecords)}
            className='size-8'
            aria-label='선택한 스캔 기록 삭제'
            title='선택한 스캔 기록 삭제'
          >
            <Trash2 />
            <span className='sr-only'>선택한 스캔 기록 삭제</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>선택한 스캔 기록 삭제</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
