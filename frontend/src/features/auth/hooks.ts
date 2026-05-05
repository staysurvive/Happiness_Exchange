import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiError, setUnauthorizedHandler } from '../../lib/api-client'
import { queryClient } from '../../lib/query-client'
import { useAuthStore } from '../../stores/auth-store'
import type { LoginPayload, RegisterPayload } from '../../types/api'
import { authApi } from './api'

export const currentUserQueryKey = ['auth', 'me'] as const

export function useAuthBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate)
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
      queryClient.removeQueries({ queryKey: currentUserQueryKey })
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [logout])

  const query = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authApi.getCurrentUser,
    enabled: hydrated && Boolean(token),
  })

  useEffect(() => {
    if (query.data) {
      setCurrentUser(query.data)
    }
  }, [query.data, setCurrentUser])

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      logout()
      queryClient.removeQueries({ queryKey: currentUserQueryKey })
    }
  }, [logout, query.error])

  return query
}

export function useLoginMutation() {
  const setToken = useAuthStore((state) => state.setToken)

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setToken(data.access_token)
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
    },
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  })
}
