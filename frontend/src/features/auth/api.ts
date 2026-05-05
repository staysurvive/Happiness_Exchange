import { apiClient } from '../../lib/api-client'
import type {
  CurrentUser,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
} from '../../types/api'

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient.post<CurrentUser>('/auth/register', {
      auth: false,
      json: payload,
    })
  },
  login(payload: LoginPayload) {
    return apiClient.post<TokenResponse>('/auth/login', {
      auth: false,
      json: payload,
    })
  },
  getCurrentUser() {
    return apiClient.get<CurrentUser>('/users/me')
  },
}
