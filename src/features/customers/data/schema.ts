import { z } from 'zod'
import { ageGroups } from '@/lib/age-groups'

const _customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  participantNo: z.string(),
  matchedParticipantNo: z.string().nullable(),
  ageGroup: z.enum(ageGroups).nullable(),
  address: z.string(),
  letter1Arrived: z.boolean(),
  letter2Arrived: z.boolean(),
  letter3Arrived: z.boolean(),
  memo: z.string(),
  createdAt: z.coerce.date(),
})

export type Customer = z.infer<typeof _customerSchema>
