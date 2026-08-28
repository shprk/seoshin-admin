import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Customer } from '../data/schema'

type CustomersDeleteDialogProps = {
  customers: Customer[]
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  onConfirm: () => void
}

function deleteDescription(customers: Customer[]) {
  if (customers.length === 1) {
    const customer = customers[0]
    return `${customer.name}(${customer.participantNo}) 고객을 삭제할까요?`
  }

  return `선택한 ${customers.length}명의 고객을 삭제할까요?`
}

export function CustomersDeleteDialog({
  customers,
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: CustomersDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isLoading) return
        onOpenChange(nextOpen)
      }}
      title='고객 삭제'
      desc={customers.length > 0 ? deleteDescription(customers) : ''}
      cancelBtnText='취소'
      confirmText='삭제'
      destructive
      isLoading={isLoading}
      handleConfirm={onConfirm}
    />
  )
}
