import { create } from 'zustand'
import type { CurrentUser } from '../types/api'
import { tokenStorage } from '../lib/storage'

type AuthState = {
  token: string | null
  currentUser: CurrentUser | null
  hydrated: boolean
  setToken: (token: string | null) => void
  setCurrentUser: (user: CurrentUser | null) => void
  hydrate: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  currentUser: null,
  hydrated: false,
  setToken: (token) => {
    if (token) {
      tokenStorage.set(token)
    } else {
      tokenStorage.remove()
    }
    set({ token })
  },
  setCurrentUser: (currentUser) => set({ currentUser }),
  hydrate: () =>
    set((state) => {
      if (state.hydrated) {
        return state
      }
      return {
        token: tokenStorage.get(),
        hydrated: true,
      }
    }),
  logout: () => {
    tokenStorage.remove()
    set({ token: null, currentUser: null, hydrated: true })
  },
}))
