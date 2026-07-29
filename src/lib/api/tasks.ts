import { type LetterField, type ScanWork } from '@/features/tasks/data/scan-work-schema'
import { apiClient } from './client'
import { getApiErrorMessage } from './error'

type TaskApiItem = Omit<ScanWork, 'createdAt'> & {
  createdAt: string | Date
}

export type TasksListResponse = {
  items: ScanWork[]
  total: number
}

function mapTask(item: TaskApiItem): ScanWork {
  return {
    ...item,
    address: item.address ?? '',
    letter1Arrived: item.letter1Arrived ?? false,
    letter2Arrived: item.letter2Arrived ?? false,
    letter3Arrived: item.letter3Arrived ?? false,
    createdAt: new Date(item.createdAt),
  }
}

export async function getTasks(): Promise<TasksListResponse> {
  try {
    const { data } = await apiClient.get<{
      items: TaskApiItem[]
      total: number
    }>('/tasks')

    return {
      total: data.total,
      items: data.items.map(mapTask),
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '작업 목록을 불러오지 못했습니다.'))
  }
}

export async function updateTaskLetterArrived(
  id: string,
  field: LetterField,
  letterArrived: boolean
): Promise<ScanWork> {
  try {
    const { data } = await apiClient.patch<TaskApiItem>(`/tasks/${id}`, {
      [field]: letterArrived,
    })
    return mapTask(data)
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, '편지 도착 여부를 변경하지 못했습니다.')
    )
  }
}
