const TOKEN_KEY = 'happy_exchange_access_token'

export const tokenStorage = {
  get() {
    if (typeof window === 'undefined') {
      return null
    }
    return window.localStorage.getItem(TOKEN_KEY)
  },
  set(token: string) {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(TOKEN_KEY, token)
  },
  remove() {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(TOKEN_KEY)
  },
}
