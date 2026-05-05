import { env } from './env'
import { tokenStorage } from './storage'

export class ApiError extends Error {
  status: number
  data: unknown
  detail: string

  constructor(status: number, detail: string, data: unknown) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.data = data
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | null
  json?: unknown
  auth?: boolean
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const { json, auth = true, headers, body, ...rest } = options
  const finalHeaders = new Headers(headers)

  if (json !== undefined) {
    finalHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = tokenStorage.get()
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : body,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json')
    ? ((await response.json()) as unknown)
    : ((await response.text()) as unknown)

  if (!response.ok) {
    const detail =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      typeof (data as { detail?: unknown }).detail === 'string'
        ? (data as { detail: string }).detail
        : `Request failed with status ${response.status}`

    if (response.status === 401 && auth) {
      unauthorizedHandler?.()
    }
    throw new ApiError(response.status, detail, data)
  }

  return data as T
}

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'GET' })
  },
  post<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'POST' })
  },
  patch<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'PATCH' })
  },
  delete<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'DELETE' })
  },
}
