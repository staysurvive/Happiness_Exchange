import { apiClient } from '../../lib/api-client'
import type {
  CommentListResponse,
  CreateProductPayload,
  GiftSendResponse,
  MoodNeed,
  MoodRecommendation,
  ProductCreatedResponse,
  ProductDetail,
  ProductListResponse,
} from '../../types/api'

type ProductListParams = {
  type?: string
  mood_tag?: string
  min_price?: number
  max_price?: number
  sort?: string
  page?: number
  page_size?: number
}

function buildQuery(params: ProductListParams) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    search.set(key, String(value))
  }
  return search.toString()
}

export const productsApi = {
  getProducts(params: ProductListParams = {}) {
    const query = buildQuery({
      page: 1,
      page_size: 12,
      sort: 'latest',
      ...params,
    })
    return apiClient.get<ProductListResponse>(
      `/products?${query}`,
      { auth: false },
    )
  },
  getProductDetail(productId: string | number) {
    return apiClient.get<ProductDetail>(`/products/${productId}`)
  },
  getMoodRecommendations(need: MoodNeed | string) {
    return apiClient.get<MoodRecommendation>(`/products/recommendations/mood?need=${need}`, {
      auth: false,
    })
  },
  getComments(productId: string | number, page = 1, pageSize = 20) {
    return apiClient.get<CommentListResponse>(
      `/products/${productId}/comments?page=${page}&page_size=${pageSize}`,
    )
  },
  createProduct(payload: CreateProductPayload) {
    return apiClient.post<ProductCreatedResponse>('/products', {
      json: payload,
    })
  },
  purchaseProduct(productId: string | number) {
    return apiClient.post<{
      purchased: boolean
      product_id: number
      price: number
      points_balance: number
    }>(`/products/${productId}/purchase`)
  },
  giftProduct(productId: string | number) {
    return apiClient.post<GiftSendResponse>(`/products/${productId}/gift`)
  },
  likeProduct(productId: string | number) {
    return apiClient.post<{ liked: boolean }>(`/products/${productId}/like`)
  },
  unlikeProduct(productId: string | number) {
    return apiClient.delete<void>(`/products/${productId}/like`)
  },
  collectProduct(productId: string | number) {
    return apiClient.post<{ collected: boolean }>(`/products/${productId}/collection`)
  },
  uncollectProduct(productId: string | number) {
    return apiClient.delete<void>(`/products/${productId}/collection`)
  },
  createComment(productId: string | number, content: string) {
    return apiClient.post(`/products/${productId}/comments`, {
      json: { content },
    })
  },
  deleteComment(commentId: string | number) {
    return apiClient.delete<void>(`/comments/${commentId}`)
  },
}
