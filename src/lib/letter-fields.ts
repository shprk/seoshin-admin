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
