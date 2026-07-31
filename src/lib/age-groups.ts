export const ageGroups = [
  '10대',
  '20대',
  '30대',
  '40대',
  '50대',
  '60대 이상',
] as const

export type AgeGroup = (typeof ageGroups)[number]
