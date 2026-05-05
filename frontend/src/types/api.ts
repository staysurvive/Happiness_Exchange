export type PaginatedResponse<T> = {
  items: T[]
  page: number
  page_size: number
  total: number
}

export type CurrentUser = {
  id: number
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  points_balance: number
  created_at: string
}

export type TokenResponse = {
  access_token: string
  token_type: 'bearer'
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AvatarOption = {
  id: string
  label: string
  image_url: string
}

export type PointTransaction = {
  id: number
  amount: number
  balance_after: number
  transaction_type: string
  description: string | null
  created_at: string
}

export type PointsSummary = {
  points_balance: number
  total: number
  page: number
  page_size: number
  point_transactions: PointTransaction[]
}

export type CheckinStatus = {
  checked_in_today: boolean
  latest_checkin_date: string | null
  latest_checkin: {
    checkin_date: string
    reward_points: number
    created_at: string
  } | null
  reward_points: number
  points_balance: number
}

export type ProductSummary = {
  id: number
  title: string
  description: string
  product_type: string
  mood_tags: string[]
  price: number
  cover_image_url: string | null
  status: string
  happy_score: number
  purchase_count: number
  like_count: number
  collection_count: number
  comment_count: number
  created_at: string
  author: CurrentUser
}

export type ProductImage = {
  id: number
  image_url: string
  sort_order: number
}

export type ProductDetail = ProductSummary & {
  author: CurrentUser
  images: ProductImage[]
  is_resellable: boolean
  is_limited: boolean
  stock_total: number | null
  stock_remaining: number | null
  updated_at: string
  state: {
    is_purchased: boolean
    is_gifted: boolean
    is_accessible: boolean
    is_liked: boolean
    is_collected: boolean
    is_author: boolean
    can_purchase: boolean
    can_comment: boolean
    can_gift: boolean
  }
}

export type PurchaseRecord = {
  purchased_at: string
  purchase_price: number
  product: ProductSummary
}

export type CollectionRecord = {
  collected_at: string
  product: ProductSummary
}

export type CommentItem = {
  id: number
  content: string
  created_at: string
  updated_at: string
  is_mine: boolean
  user: CurrentUser
}

export type MoodNeed = 'tired' | 'healing' | 'laugh' | 'encouraged' | 'scenery'

export type MoodRecommendation = {
  need: MoodNeed | string
  title: string
  description: string
  recommended_tags: string[]
  items: ProductSummary[]
}

export type GiftSendResponse = {
  gifted: boolean
  gift_id: number
  product_id: number
  recipient_label: string
  message: string
}

export type GiftRecord = {
  id: number
  delivery_type: string
  message: string | null
  created_at: string
  sender: CurrentUser
  product: ProductSummary
}

export type PersonaCard = {
  archetype_key: string
  archetype_name: string
  headline: string
  summary: string
  dominant_mood_tag: string
  dominant_product_type: string
  vibe_tags: string[]
  purchases_count: number
  collections_count: number
  published_count: number
  gifts_sent_count: number
  gifts_received_count: number
  happy_actions: number
}

export type CommentListResponse = PaginatedResponse<CommentItem>
export type ProductListResponse = PaginatedResponse<ProductSummary>
export type PurchaseListResponse = PaginatedResponse<PurchaseRecord>
export type CollectionListResponse = PaginatedResponse<CollectionRecord>
export type GiftListResponse = PaginatedResponse<GiftRecord>

export type ProductType =
  | 'happy_moment'
  | 'lucky_today'
  | 'healing_photo'
  | 'beautiful_view'
  | 'cute_pet'
  | 'funny_joke'
  | 'encouragement'
  | 'other'

export type CreateProductPayload = {
  title: string
  description: string
  product_type: ProductType
  mood_tags: string[]
  price: number
  image_urls: string[]
}

export type ProductCreatedResponse = {
  id: number
  title: string
  price: number
  happy_score: number
}

export type ImageUploadResponse = {
  image_url: string
}
