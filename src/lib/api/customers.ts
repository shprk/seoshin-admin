import { type Customer } from '@/features/customers/data/schema'
import { apiClient } from './client'
import { getApiErrorMessage } from './error'

type CustomerApiItem = Omit<Customer, 'createdAt'> & {
  createdAt: string | Date
}

export type CustomersListResponse = {
  items: Customer[]
  total: number
}

export async function getCustomers(): Promise<CustomersListResponse> {
  try {
    const { data } = await apiClient.get<{
      items: CustomerApiItem[]
      total: number
    }>('/customers')

    return {
      total: data.total,
      items: data.items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      })),
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '고객 목록을 불러오지 못했습니다.'))
  }
}

export async function getCustomerByParticipantNo(
  participantNo: string
): Promise<Customer | null> {
  try {
    const { items } = await getCustomers()
    return items.find((item) => item.participantNo === participantNo) ?? null
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '고객 정보를 불러오지 못했습니다.'))
  }
}

export type CreateCustomerPayload = {
  participantNo: string
  name: string
  phone: string
  ageGroup: string
  memo: string
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  try {
    const { data } = await apiClient.post<CustomerApiItem>('/customers', payload)
    return {
      ...data,
      createdAt: new Date(data.createdAt),
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '고객을 생성하지 못했습니다.'))
  }
}
