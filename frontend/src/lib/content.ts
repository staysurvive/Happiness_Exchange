import type { MoodNeed, ProductSummary, ProductType } from '../types/api'

export const PRODUCT_TYPE_OPTIONS: Array<{
  value: ProductType
  label: string
  shortLabel: string
  gradientClass: string
}> = [
  { value: 'happy_moment', label: '快乐的事情', shortLabel: '快乐事', gradientClass: 'bg-card-warm' },
  { value: 'lucky_today', label: '今日小确幸', shortLabel: '小确幸', gradientClass: 'bg-card-warm' },
  { value: 'healing_photo', label: '治愈照片', shortLabel: '治愈照片', gradientClass: 'bg-card-pink' },
  { value: 'beautiful_view', label: '美丽风景', shortLabel: '美丽风景', gradientClass: 'bg-card-blue' },
  { value: 'cute_pet', label: '可爱小狗/小猫', shortLabel: '可爱小狗/小猫', gradientClass: 'bg-card-pink' },
  { value: 'funny_joke', label: '好笑的段子', shortLabel: '搞笑段子', gradientClass: 'bg-card-blue' },
  { value: 'encouragement', label: '一句鼓励的话', shortLabel: '鼓励的话', gradientClass: 'bg-card-blue' },
  { value: 'other', label: '其他', shortLabel: '全部灵感', gradientClass: 'bg-card-warm' },
]

export const MOOD_TAG_OPTIONS = ['治愈', '惊喜', '浪漫', '搞笑', '开心', '温暖', '放松', '安心', '可爱', '美好']

export const SORT_OPTIONS = [
  { value: 'latest', label: '最新上架' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'happy_score', label: '快乐指数' },
  { value: 'price_asc', label: '价格低到高' },
  { value: 'price_desc', label: '价格高到低' },
] as const

export const MOOD_NEED_OPTIONS: Array<{
  value: MoodNeed
  label: string
  hint: string
}> = [
  { value: 'tired', label: '有点累', hint: '先松一口气' },
  { value: 'healing', label: '想被治愈', hint: '来点温柔补给' },
  { value: 'laugh', label: '想笑一下', hint: '让情绪轻一点' },
  { value: 'encouraged', label: '想被鼓励', hint: '收一句刚好的话' },
  { value: 'scenery', label: '想看看风景', hint: '安静看点美好' },
]

const moodToneMap: Record<string, string> = {
  '治愈': 'yellow',
  '温暖': 'orange',
  '放松': 'blue',
  '惊喜': 'green',
  '浪漫': 'pink',
  '搞笑': 'purple',
  '开心': 'yellow',
  '安心': 'blue',
  '可爱': 'pink',
  '美好': 'green',
}

export function getProductTypeMeta(type: string | ProductType) {
  return PRODUCT_TYPE_OPTIONS.find((item) => item.value === type) ?? PRODUCT_TYPE_OPTIONS[0]
}

export function getMoodTone(tag: string) {
  return moodToneMap[tag] ?? 'neutral'
}

export function buildProductTeaser(product: Pick<ProductSummary, 'description'>, maxLength = 58) {
  if (product.description.length <= maxLength) {
    return product.description
  }
  return `${product.description.slice(0, maxLength).trim()}…`
}
