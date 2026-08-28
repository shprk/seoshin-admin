import { HttpResponse, http } from 'msw'
import { type Customer } from '@/features/customers/data/schema'
import { type ScanWork } from '@/features/tasks/data/scan-work-schema'
import { createSeedCustomers, createSeedScans } from './data'
import { issueAccessToken, toAuthUser } from './token'

/**
 * In-memory stand-in for the real API, so the app can be deployed and clicked
 * through before a backend exists. State lives for the lifetime of the tab.
 */

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
const endpoint = (path: string) => `${baseUrl}${path}`

type StoredCustomer = Customer & { deletedAt: Date | null }

const customers: StoredCustomer[] = createSeedCustomers().map((customer) => ({
  ...customer,
  deletedAt: null,
}))
const scans = createSeedScans()

function toPublicCustomer({
  deletedAt: _deletedAt,
  ...customer
}: StoredCustomer): Customer {
  return customer
}

function activeCustomers() {
  return customers.filter((customer) => customer.deletedAt == null)
}

function authenticate(request: Request): boolean {
  const header = request.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return false

  return toAuthUser(header.slice('Bearer '.length)) !== null
}

function errorResponse(message: string, status: number) {
  return HttpResponse.json({ message }, { status })
}

const unauthorized = () => errorResponse('인증이 필요합니다.', 401)

export const handlers = [
  http.post(endpoint('/auth/login'), async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return errorResponse('이메일과 비밀번호를 모두 입력해주세요.', 400)
    }

    return HttpResponse.json(issueAccessToken(email))
  }),

  http.get(endpoint('/auth/me'), ({ request }) => {
    const header = request.headers.get('Authorization') ?? ''
    const user = header.startsWith('Bearer ')
      ? toAuthUser(header.slice('Bearer '.length))
      : null

    return user ? HttpResponse.json(user) : unauthorized()
  }),

  http.get(endpoint('/customers'), ({ request }) => {
    if (!authenticate(request)) return unauthorized()

    const items = activeCustomers().map(toPublicCustomer)

    return HttpResponse.json({ items, total: items.length })
  }),

  http.post(endpoint('/customers'), async ({ request }) => {
    if (!authenticate(request)) return unauthorized()

    const payload = (await request.json()) as Partial<Customer>
    if (!payload.participantNo || !payload.name) {
      return errorResponse('참가번호와 이름은 필수입니다.', 400)
    }

    if (
      activeCustomers().some(
        (item) => item.participantNo === payload.participantNo
      )
    ) {
      return errorResponse('이미 등록된 참가번호입니다.', 409)
    }

    const created: StoredCustomer = {
      id: crypto.randomUUID(),
      name: payload.name,
      participantNo: payload.participantNo,
      matchedParticipantNo: payload.matchedParticipantNo ?? null,
      ageGroup: payload.ageGroup ?? null,
      address: payload.address ?? '',
      email: payload.email ?? '',
      letter1Arrived: payload.letter1Arrived ?? false,
      letter2Arrived: payload.letter2Arrived ?? false,
      letter3Arrived: payload.letter3Arrived ?? false,
      memo: payload.memo ?? '',
      createdAt: new Date(),
      deletedAt: null,
    }

    customers.unshift(created)

    return HttpResponse.json(toPublicCustomer(created), { status: 201 })
  }),

  http.patch(endpoint('/customers/:id'), async ({ request, params }) => {
    if (!authenticate(request)) return unauthorized()

    const index = customers.findIndex(
      (item) => item.id === params.id && item.deletedAt == null
    )
    if (index === -1) return errorResponse('고객을 찾을 수 없습니다.', 404)

    const existing = customers[index]
    const payload = (await request.json()) as Partial<Customer>
    const updated: StoredCustomer = {
      ...existing,
      ...payload,
      id: existing.id,
      createdAt: existing.createdAt,
      deletedAt: existing.deletedAt,
    }

    customers[index] = updated

    return HttpResponse.json(toPublicCustomer(updated))
  }),

  http.delete(endpoint('/customers'), async ({ request }) => {
    if (!authenticate(request)) return unauthorized()

    const payload = (await request.json()) as { ids?: unknown }
    const ids = payload.ids

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some((id) => typeof id !== 'string')
    ) {
      return errorResponse('삭제할 고객을 선택해주세요.', 400)
    }

    const now = new Date()

    for (const id of ids) {
      const target = customers.find((item) => item.id === id)
      if (target && target.deletedAt == null) {
        target.deletedAt = now
      }
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(endpoint('/tasks'), ({ request }) => {
    if (!authenticate(request)) return unauthorized()

    return HttpResponse.json({ items: scans, total: scans.length })
  }),

  http.post(endpoint('/tasks'), async ({ request }) => {
    if (!authenticate(request)) return unauthorized()

    const payload = (await request.json()) as Partial<ScanWork>
    if (!payload.participantNo || !payload.name) {
      return errorResponse('참가번호와 이름은 필수입니다.', 400)
    }

    const created: ScanWork = {
      id: crypto.randomUUID(),
      name: payload.name,
      participantNo: payload.participantNo,
      matchedParticipantNo: payload.matchedParticipantNo ?? null,
      address: payload.address ?? '',
      createdAt: new Date(),
    }

    scans.unshift(created)

    return HttpResponse.json(created, { status: 201 })
  }),

  http.delete(endpoint('/tasks'), async ({ request }) => {
    if (!authenticate(request)) return unauthorized()

    const payload = (await request.json()) as { ids?: unknown }
    const ids = payload.ids

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some((id) => typeof id !== 'string')
    ) {
      return errorResponse('삭제할 스캔 기록을 선택해주세요.', 400)
    }

    for (const id of ids) {
      const index = scans.findIndex((item) => item.id === id)
      if (index !== -1) scans.splice(index, 1)
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(endpoint('/tasks/:id'), ({ request, params }) => {
    if (!authenticate(request)) return unauthorized()

    const index = scans.findIndex((item) => item.id === params.id)
    if (index === -1) return errorResponse('스캔 기록을 찾을 수 없습니다.', 404)

    scans.splice(index, 1)

    return new HttpResponse(null, { status: 204 })
  }),
]
