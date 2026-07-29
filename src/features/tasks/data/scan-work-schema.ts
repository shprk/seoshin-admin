import { z } from 'zod'

export const letterFields = [
  'letter1Arrived',
  'letter2Arrived',
  'letter3Arrived',
] as const

export type LetterField = (typeof letterFields)[number]

export const letterFieldLabels: Record<LetterField, string> = {
  letter1Arrived: '1번째 편지',
  letter2Arrived: '2번째 편지',
  letter3Arrived: '3번째 편지',
}

const scanWorkSchema = z.object({
  id: z.string(),
  name: z.string(),
  participantNo: z.string(),
  matchedParticipantNo: z.string().nullable(),
  address: z.string(),
  letter1Arrived: z.boolean(),
  letter2Arrived: z.boolean(),
  letter3Arrived: z.boolean(),
  barcode: z.string(),
  createdAt: z.coerce.date(),
})

export type ScanWork = z.infer<typeof scanWorkSchema>
