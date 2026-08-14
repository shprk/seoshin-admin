import { type AgeGroup } from '@/lib/age-groups'
import { type Customer } from '@/features/customers/data/schema'
import { type ScanWork } from '@/features/tasks/data/scan-work-schema'

/**
 * Seed data for the mock API.
 *
 * Dates are relative to "now" so the dashboard charts stay populated whenever
 * the demo is opened. A few records are intentionally malformed (missing
 * address, dangling match, unregistered scan) so the "확인이 필요한 항목" card
 * has something to show.
 */

function monthsAgo(months: number, day: number): Date {
  const now = new Date()
  const safeDay = months === 0 ? Math.min(day, now.getDate()) : day

  return new Date(now.getFullYear(), now.getMonth() - months, safeDay, 10, 30)
}

function daysAgo(days: number, hour: number): Date {
  const now = new Date()

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - days,
    hour,
    15
  )
}

type CustomerSeed = {
  participantNo: string
  name: string
  ageGroup?: AgeGroup | null
  matchedParticipantNo?: string | null
  address?: string
  email?: string
  letters?: number
  memo?: string
  createdAt: Date
}

function toCustomer(seed: CustomerSeed, index: number): Customer {
  const letters = seed.letters ?? 0

  return {
    id: `cust-${String(index + 1).padStart(3, '0')}`,
    name: seed.name,
    participantNo: seed.participantNo,
    matchedParticipantNo: seed.matchedParticipantNo ?? null,
    ageGroup: seed.ageGroup ?? null,
    address: seed.address ?? '',
    email: seed.email ?? '',
    letter1Arrived: letters >= 1,
    letter2Arrived: letters >= 2,
    letter3Arrived: letters >= 3,
    memo: seed.memo ?? '',
    createdAt: seed.createdAt,
  }
}

const customerSeeds: CustomerSeed[] = [
  {
    participantNo: 'P-1001',
    name: '김서연',
    ageGroup: '30대',
    matchedParticipantNo: 'P-1002',
    address: '서울특별시 마포구 월드컵북로 120',
    email: 'seoyeon@naver.com',
    letters: 3,
    createdAt: monthsAgo(11, 5),
  },
  {
    participantNo: 'P-1002',
    name: '박지훈',
    ageGroup: '40대',
    matchedParticipantNo: 'P-1001',
    address: '경기도 성남시 분당구 판교로 235',
    email: 'jihoon.park@gmail.com',
    letters: 3,
    createdAt: monthsAgo(11, 6),
  },
  {
    participantNo: 'P-1003',
    name: '이하늘',
    ageGroup: '20대',
    matchedParticipantNo: 'P-1004',
    address: '부산광역시 해운대구 센텀중앙로 55',
    email: 'haneul@daum.net',
    letters: 2,
    createdAt: monthsAgo(9, 12),
  },
  {
    participantNo: 'P-1004',
    name: '정민재',
    ageGroup: '20대',
    matchedParticipantNo: 'P-1003',
    address: '대구광역시 수성구 동대구로 244',
    letters: 2,
    createdAt: monthsAgo(9, 14),
  },
  {
    participantNo: 'P-1005',
    name: '최은비',
    ageGroup: '50대',
    matchedParticipantNo: 'P-1006',
    address: '인천광역시 연수구 송도과학로 32',
    letters: 3,
    createdAt: monthsAgo(8, 3),
  },
  {
    participantNo: 'P-1006',
    name: '한도윤',
    ageGroup: '60대 이상',
    matchedParticipantNo: 'P-1005',
    address: '광주광역시 서구 상무중앙로 58',
    letters: 1,
    memo: '2차 편지 반송, 주소 확인 필요',
    createdAt: monthsAgo(8, 4),
  },
  {
    participantNo: 'P-1007',
    name: '오세라',
    ageGroup: '30대',
    address: '대전광역시 유성구 대학로 99',
    letters: 1,
    createdAt: monthsAgo(7, 18),
  },
  {
    participantNo: 'P-1008',
    name: '윤가온',
    ageGroup: '10대',
    memo: '보호자 연락 후 주소 등록 예정',
    createdAt: monthsAgo(6, 9),
  },
  {
    participantNo: 'P-1009',
    name: '장태준',
    ageGroup: '40대',
    matchedParticipantNo: 'P-9999',
    address: '울산광역시 남구 삼산로 200',
    letters: 1,
    createdAt: monthsAgo(5, 21),
  },
  {
    participantNo: 'P-1010',
    name: '서다인',
    ageGroup: '20대',
    address: '세종특별자치시 한누리대로 2130',
    letters: 2,
    createdAt: monthsAgo(4, 8),
  },
  {
    participantNo: 'P-1011',
    name: '문채원',
    ageGroup: '50대',
    matchedParticipantNo: 'P-1012',
    address: '강원특별자치도 춘천시 중앙로 1',
    letters: 2,
    createdAt: monthsAgo(3, 15),
  },
  {
    participantNo: 'P-1012',
    name: '배준호',
    ageGroup: '50대',
    matchedParticipantNo: 'P-1011',
    address: '충청북도 청주시 상당구 상당로 82',
    letters: 1,
    createdAt: monthsAgo(3, 16),
  },
  {
    participantNo: 'P-1013',
    name: '신유진',
    ageGroup: '30대',
    memo: '주소 재확인 요청',
    createdAt: monthsAgo(2, 11),
  },
  {
    participantNo: 'P-1014',
    name: '임수호',
    ageGroup: '60대 이상',
    address: '전라남도 여수시 시청로 1',
    letters: 1,
    createdAt: monthsAgo(1, 7),
  },
  {
    participantNo: 'P-1015',
    name: '노아린',
    ageGroup: '10대',
    address: '제주특별자치도 제주시 문연로 6',
    createdAt: monthsAgo(1, 20),
  },
  {
    participantNo: 'P-1016',
    name: '강민석',
    ageGroup: '40대',
    address: '경상북도 포항시 남구 시청로 1',
    createdAt: monthsAgo(0, 3),
  },
  {
    participantNo: 'P-1017',
    name: '조하은',
    address: '전북특별자치도 전주시 완산구 노송광장로 10',
    createdAt: monthsAgo(0, 9),
  },
  {
    participantNo: 'P-1018',
    name: '유재상',
    ageGroup: '30대',
    address: '경상남도 창원시 의창구 중앙대로 151',
    createdAt: monthsAgo(0, 14),
  },
]

const scanSeeds: Omit<ScanWork, 'id'>[] = [
  {
    name: '유재상',
    participantNo: 'P-1018',
    matchedParticipantNo: null,
    address: '경상남도 창원시 의창구 중앙대로 151',
    createdAt: daysAgo(0, 9),
  },
  {
    name: '조하은',
    participantNo: 'P-1017',
    matchedParticipantNo: null,
    address: '전북특별자치도 전주시 완산구 노송광장로 10',
    createdAt: daysAgo(1, 16),
  },
  {
    name: '강민석',
    participantNo: 'P-1016',
    matchedParticipantNo: null,
    address: '경상북도 포항시 남구 시청로 1',
    createdAt: daysAgo(2, 11),
  },
  {
    name: '알 수 없음',
    participantNo: 'P-2001',
    matchedParticipantNo: null,
    address: '서울특별시 종로구 세종대로 175',
    createdAt: daysAgo(3, 14),
  },
  {
    name: '노아린',
    participantNo: 'P-1015',
    matchedParticipantNo: null,
    address: '제주특별자치도 제주시 문연로 6',
    createdAt: daysAgo(5, 10),
  },
  {
    name: '임수호',
    participantNo: 'P-1014',
    matchedParticipantNo: null,
    address: '전라남도 여수시 시청로 1',
    createdAt: daysAgo(8, 15),
  },
  {
    name: '배준호',
    participantNo: 'P-1012',
    matchedParticipantNo: 'P-1011',
    address: '충청북도 청주시 상당구 상당로 82',
    createdAt: daysAgo(12, 13),
  },
  {
    name: '문채원',
    participantNo: 'P-1011',
    matchedParticipantNo: 'P-1012',
    address: '강원특별자치도 춘천시 중앙로 1',
    createdAt: daysAgo(12, 12),
  },
  {
    name: '서다인',
    participantNo: 'P-1010',
    matchedParticipantNo: null,
    address: '세종특별자치시 한누리대로 2130',
    createdAt: daysAgo(19, 17),
  },
]

export function createSeedCustomers(): Customer[] {
  return customerSeeds.map(toCustomer)
}

export function createSeedScans(): ScanWork[] {
  return scanSeeds.map((seed, index) => ({
    ...seed,
    id: `scan-${String(index + 1).padStart(3, '0')}`,
  }))
}
