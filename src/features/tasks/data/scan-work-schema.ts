import { z } from 'zod'

const _scanWorkSchema = z.object({
  id: z.string(),
  name: z.string(),
  participantNo: z.string(),
  matchedParticipantNo: z.string().nullable(),
  address: z.string(),
  createdAt: z.coerce.date(),
})

export type ScanWork = z.infer<typeof _scanWorkSchema>
