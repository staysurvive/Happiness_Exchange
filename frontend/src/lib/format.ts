export function formatDateTime(value: string | null | undefined) {
  if (!value) return '暂无记录'

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '暂无记录'

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return '刚刚'

  try {
    const timestamp = new Date(value).getTime()
    const diff = Date.now() - timestamp
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < hour) {
      return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
    }
    if (diff < day) {
      return `${Math.max(1, Math.floor(diff / hour))} 小时前`
    }
    if (diff < day * 7) {
      return `${Math.max(1, Math.floor(diff / day))} 天前`
    }
    return formatDate(value)
  } catch {
    return value
  }
}

export function formatCompactNumber(value: number) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}w`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return String(value)
}

export function getInitial(value: string | null | undefined) {
  if (!value) return '快'
  return value.trim().charAt(0).toUpperCase()
}
