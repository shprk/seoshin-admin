export const letterFields = [
  'letter1Arrived',
  'letter2Arrived',
  'letter3Arrived',
] as const

export type LetterField = (typeof letterFields)[number]

export const letterFieldLabels: Record<LetterField, string> = {
  letter1Arrived: '첫 번째 편지',
  letter2Arrived: '두 번째 편지',
  letter3Arrived: '세 번째 편지',
}
