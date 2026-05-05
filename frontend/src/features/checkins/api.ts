import { apiClient } from '../../lib/api-client'
import type { CheckinStatus } from '../../types/api'

export const checkinsApi = {
  getStatus() {
    return apiClient.get<CheckinStatus>('/checkins/me')
  },
  checkIn() {
    return apiClient.post<{
      checked_in: boolean
      reward_points: number
      points_balance: number
    }>('/checkins')
  },
}
