import { createFileRoute } from '@tanstack/react-router'
import { BarcodeScan } from '@/features/barcode-scan'

export const Route = createFileRoute('/_authenticated/barcode-scan/')({
  component: BarcodeScan,
})
