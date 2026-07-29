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
