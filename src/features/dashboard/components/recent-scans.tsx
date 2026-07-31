import { format } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type ScanWork } from '@/features/tasks/data/scan-work-schema'

type RecentScansProps = {
  scans: ScanWork[]
}

export function RecentScans({ scans }: RecentScansProps) {
  if (scans.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        아직 스캔 기록이 없습니다.
      </p>
    )
  }

  return (
    <div className='space-y-6'>
      {scans.map((scan) => (
        <div key={scan.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>{scan.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-2'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{scan.name}</p>
              <p className='text-sm text-muted-foreground'>
                {scan.participantNo}
                {scan.matchedParticipantNo
                  ? ` → ${scan.matchedParticipantNo}`
                  : ''}
              </p>
            </div>
            <div className='text-xs whitespace-nowrap text-muted-foreground'>
              {format(scan.createdAt, 'MM-dd HH:mm')}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
