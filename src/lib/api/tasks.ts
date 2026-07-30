import { type ScanWork } from '@/features/tasks/data/scan-work-schema'
import { apiClient } from './client'
import { getApiErrorMessage } from './error'

type TaskApiItem = Omit<ScanWork, 'createdAt'> & {
  createdAt: string | Date
}

export type TasksListResponse = {
  items: ScanWork[]
  total: number
}

export type CreateTaskPayload = {
  name: string
  participantNo: string
  matchedParticipantNo: string | null
  address: string
}

function mapTask(item: TaskApiItem): ScanWork {
  return {
    ...item,
    matchedParticipantNo: item.matchedParticipantNo ?? null,
    address: item.address ?? '',
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

export async function createTask(
  payload: CreateTaskPayload
): Promise<ScanWork> {
  try {
    const { data } = await apiClient.post<TaskApiItem>('/tasks', payload)
    return mapTask(data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '작업을 등록하지 못했습니다.'))
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await apiClient.delete(`/tasks/${id}`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '작업을 삭제하지 못했습니다.'))
  }
}
