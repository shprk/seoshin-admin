import { ageGroups, type AgeGroup } from '@/lib/age-groups'
import { letterFields, type LetterField } from '@/lib/letter-fields'
import { type Customer } from '@/features/customers/data/schema'
import { type ScanWork } from '@/features/tasks/data/scan-work-schema'

export type CustomersSummary = {
  total: number
  matched: number
  allLettersDone: number
  letterCounts: Record<LetterField, number>
  ageGroupCounts: { name: string; value: number }[]
}

export function summarizeCustomers(customers: Customer[]): CustomersSummary {
  const letterCounts = {
    letter1Arrived: 0,
    letter2Arrived: 0,
    letter3Arrived: 0,
  } as Record<LetterField, number>

  const byAgeGroup = new Map<AgeGroup | '미입력', number>()
  let matched = 0
  let allLettersDone = 0

  for (const customer of customers) {
    if (customer.matchedParticipantNo) matched += 1

    for (const field of letterFields) {
      if (customer[field]) letterCounts[field] += 1
    }

    if (letterFields.every((field) => customer[field])) allLettersDone += 1

    const ageGroup = customer.ageGroup ?? '미입력'
    byAgeGroup.set(ageGroup, (byAgeGroup.get(ageGroup) ?? 0) + 1)
  }

  const ageGroupCounts = [...ageGroups, '미입력' as const]
    .filter((ageGroup) => byAgeGroup.has(ageGroup))
    .map((ageGroup) => ({
      name: ageGroup,
      value: byAgeGroup.get(ageGroup) ?? 0,
    }))

  return {
    total: customers.length,
    matched,
    allLettersDone,
    letterCounts,
    ageGroupCounts,
  }
}

export type MonthlyRegistration = {
  name: string
  total: number
}

/** 최근 `months`개월의 월별 고객 등록 수를 오래된 달부터 순서대로 반환한다. */
export function buildMonthlyRegistrations(
  customers: Customer[],
  now: Date = new Date(),
  months = 12
): MonthlyRegistration[] {
  const buckets = new Map<string, number>()
  const keys: { key: string; name: string }[] = []

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    keys.push({ key, name: `${date.getMonth() + 1}월` })
    buckets.set(key, 0)
  }

  for (const customer of customers) {
    const createdAt = customer.createdAt
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`
    const current = buckets.get(key)
    if (current !== undefined) buckets.set(key, current + 1)
  }

  return keys.map(({ key, name }) => ({
    name,
    total: buckets.get(key) ?? 0,
  }))
}

export type NewCustomersCount = {
  thisMonth: number
  lastMonth: number
  diff: number
}

export function countNewCustomers(
  customers: Customer[],
  now: Date = new Date()
): NewCustomersCount {
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`

  let thisMonth = 0
  let lastMonth = 0

  for (const { createdAt } of customers) {
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`
    if (key === thisMonthKey) thisMonth += 1
    else if (key === lastMonthKey) lastMonth += 1
  }

  return { thisMonth, lastMonth, diff: thisMonth - lastMonth }
}

export type DataIssue = {
  label: string
  count: number
  participantNos: string[]
}

/** 담당자가 직접 확인해야 하는 데이터 오류를 항목별로 모은다. */
export function findDataIssues(
  customers: Customer[],
  scans: ScanWork[]
): DataIssue[] {
  const registeredNos = new Set(customers.map((c) => c.participantNo))

  const missingAddress: string[] = []
  const brokenMatch: string[] = []
  const duplicated: string[] = []
  const seenNos = new Set<string>()

  for (const customer of customers) {
    if (!customer.address.trim()) missingAddress.push(customer.participantNo)

    if (
      customer.matchedParticipantNo &&
      !registeredNos.has(customer.matchedParticipantNo)
    ) {
      brokenMatch.push(customer.participantNo)
    }

    if (seenNos.has(customer.participantNo)) {
      if (!duplicated.includes(customer.participantNo)) {
        duplicated.push(customer.participantNo)
      }
    } else {
      seenNos.add(customer.participantNo)
    }
  }

  const unregisteredScans = [
    ...new Set(
      scans
        .map((scan) => scan.participantNo)
        .filter((participantNo) => !registeredNos.has(participantNo))
    ),
  ]

  return [
    { label: '주소 미입력', participantNos: missingAddress },
    { label: '매칭 상대를 찾을 수 없음', participantNos: brokenMatch },
    { label: '고객 미등록 스캔', participantNos: unregisteredScans },
    { label: '참가번호 중복', participantNos: duplicated },
  ].map((issue) => ({ ...issue, count: issue.participantNos.length }))
}

export function getRecentScans(scans: ScanWork[], limit = 5): ScanWork[] {
  return [...scans]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}

export function toPercent(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}
