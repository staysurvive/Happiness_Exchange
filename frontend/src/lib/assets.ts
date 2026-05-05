import { envDerived } from './env'

export function resolveAssetUrl(path: string | null | undefined) {
  if (!path) {
    return null
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `${envDerived.apiOrigin}${path}`
  }
  return `${envDerived.apiOrigin}/${path}`
}
