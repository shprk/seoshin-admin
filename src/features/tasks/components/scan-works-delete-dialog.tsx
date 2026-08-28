import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ScanWork } from '../data/scan-work-schema'

type ScanWorksDeleteDialogProps = {
  records: ScanWork[]
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  onConfirm: () => void
}

function deleteDescription(records: ScanWork[]) {
  if (records.length === 1) {
    const record = records[0]
    return `${record.name}(${record.participantNo}) 스캔 기록을 삭제할까요?`
  }

  return `선택한 ${records.length}건의 스캔 기록을 삭제할까요?`
}

export function ScanWorksDeleteDialog({
  records,
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: ScanWorksDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isLoading) return
        onOpenChange(nextOpen)
      }}
      title='스캔 기록 삭제'
      desc={records.length > 0 ? deleteDescription(records) : ''}
      cancelBtnText='취소'
      confirmText='삭제'
      destructive
      isLoading={isLoading}
      handleConfirm={onConfirm}
    />
  )
}
