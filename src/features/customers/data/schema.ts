import { z } from 'zod'

const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  participantNo: z.string(),
  phone: z.string(),
  ageGroup: z.string(),
  memo: z.string(),
  createdAt: z.coerce.date(),
})

export type Customer = z.infer<typeof customerSchema>
