import { apiClient } from '../../lib/api-client'
import type {
  AvatarOption,
  CurrentUser,
  CollectionListResponse,
  GiftListResponse,
  PersonaCard,
  PointsSummary,
  ProductListResponse,
  PurchaseListResponse,
} from '../../types/api'

export const usersApi = {
  getMe() {
    return apiClient.get<CurrentUser>('/users/me')
  },
  getAvatarOptions() {
    return apiClient.get<{ items: AvatarOption[] }>('/users/avatar-options')
  },
  updateMyAvatar(avatarUrl: string) {
    return apiClient.patch<CurrentUser>('/users/me/avatar', {
      json: { avatar_url: avatarUrl },
    })
  },
  getMyPoints(page = 1, pageSize = 20) {
    return apiClient.get<PointsSummary>(
      `/users/me/points?page=${page}&page_size=${pageSize}`,
    )
  },
  getMyProducts(page = 1, pageSize = 20) {
    return apiClient.get<ProductListResponse>(
      `/users/me/products?page=${page}&page_size=${pageSize}`,
    )
  },
  getMyPurchases(page = 1, pageSize = 20) {
    return apiClient.get<PurchaseListResponse>(
      `/users/me/purchases?page=${page}&page_size=${pageSize}`,
    )
  },
  getMyCollections(page = 1, pageSize = 20) {
    return apiClient.get<CollectionListResponse>(
      `/users/me/collections?page=${page}&page_size=${pageSize}`,
    )
  },
  getMyGifts(page = 1, pageSize = 20) {
    return apiClient.get<GiftListResponse>(
      `/users/me/gifts?page=${page}&page_size=${pageSize}`,
    )
  },
  getMyPersona() {
    return apiClient.get<PersonaCard>('/users/me/persona')
  },
}
