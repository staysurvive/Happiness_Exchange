const fallbackOrigin = 'http://localhost'

function resolveApiOrigin(apiBaseUrl: string) {
  const baseOrigin =
    typeof window !== 'undefined' ? window.location.origin : fallbackOrigin

  return new URL(apiBaseUrl, baseOrigin).origin
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
}

export const envDerived = {
  apiOrigin: resolveApiOrigin(env.apiBaseUrl),
}
