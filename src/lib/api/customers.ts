import { type AgeGroup } from '@/lib/age-groups'
import { type LetterField } from '@/lib/letter-fields'
import { type Customer } from '@/features/customers/data/schema'
import { apiClient } from './client'
import { throwApiError } from './error'

type CustomerApiItem = Omit<Customer, 'createdAt'> & {
  createdAt: string | Date
}

export type CustomersListResponse = {
  items: Customer[]
  total: number
}

function mapCustomer(item: CustomerApiItem): Customer {
  return {
    ...item,
    matchedParticipantNo: item.matchedParticipantNo ?? null,
    ageGroup: item.ageGroup ?? null,
    address: item.address ?? '',
    email: item.email ?? '',
    letter1Arrived: item.letter1Arrived ?? false,
    letter2Arrived: item.letter2Arrived ?? false,
    letter3Arrived: item.letter3Arrived ?? false,
    memo: item.memo ?? '',
    createdAt: new Date(item.createdAt),
  }
}

export async function getCustomers(): Promise<CustomersListResponse> {
  try {
    const { data } = await apiClient.get<{
      items: CustomerApiItem[]
      total: number
    }>('/customers')

    return {
      total: data.total,
      items: data.items.map(mapCustomer),
    }
  } catch (error) {
    throwApiError(error, '고객 목록을 불러오지 못했습니다.')
  }
}

export async function getCustomerByParticipantNo(
  participantNo: string
): Promise<Customer | null> {
  try {
    const { items } = await getCustomers()
    return items.find((item) => item.participantNo === participantNo) ?? null
  } catch (error) {
    throwApiError(error, '고객 정보를 불러오지 못했습니다.')
  }
}

export type CreateCustomerPayload = {
  participantNo: string
  name: string
  ageGroup: AgeGroup
  matchedParticipantNo?: string | null
  address?: string
  email?: string
  memo?: string
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  try {
    const { data } = await apiClient.post<CustomerApiItem>('/customers', {
      participantNo: payload.participantNo,
      name: payload.name,
      ageGroup: payload.ageGroup,
      matchedParticipantNo: payload.matchedParticipantNo ?? null,
      address: payload.address ?? '',
      email: payload.email ?? '',
      memo: payload.memo ?? '',
      letter1Arrived: false,
      letter2Arrived: false,
      letter3Arrived: false,
    })
    return mapCustomer(data)
  } catch (error) {
    throwApiError(error, '고객을 생성하지 못했습니다.')
  }
}

export type UpdateCustomerPayload = {
  name: string
  ageGroup: AgeGroup
  matchedParticipantNo: string | null
  address: string
  email: string
  memo: string
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload
): Promise<Customer> {
  try {
    const { data } = await apiClient.patch<CustomerApiItem>(
      `/customers/${id}`,
      payload
    )
    return mapCustomer(data)
  } catch (error) {
    throwApiError(error, '고객 정보를 수정하지 못했습니다.')
  }
}

export async function updateCustomerLetterArrived(
  id: string,
  field: LetterField,
  letterArrived: boolean
): Promise<Customer> {
  try {
    const { data } = await apiClient.patch<CustomerApiItem>(
      `/customers/${id}`,
      {
        [field]: letterArrived,
      }
    )
    return mapCustomer(data)
  } catch (error) {
    throwApiError(error, '편지 도착 여부를 변경하지 못했습니다.')
  }
}
