"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiError, authApi, refreshSession, setAccessToken, type User } from "@/src/lib/api"

export const userKey = ["auth", "user"] as const

/** The signed-in user, or null for a guest. Restores the session from the refresh cookie on first load. */
export function useUser() {
  return useQuery<User | null>({
    queryKey: userKey,
    queryFn: async () => {
      if (!(await refreshSession())) return null
      try {
        return await authApi.profile()
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null
        throw e
      }
    },
    staleTime: Infinity,
    retry: (count, e) => !(e instanceof ApiError && e.status < 500) && count < 2,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, accessToken }) => {
      setAccessToken(accessToken)
      qc.setQueryData(userKey, user)
    },
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ user, accessToken }) => {
      setAccessToken(accessToken)
      qc.setQueryData(userKey, user)
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => qc.setQueryData(userKey, user),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    // sign out locally even if the server could not be reached
    onSettled: () => {
      setAccessToken(null)
      qc.setQueryData(userKey, null)
    },
  })
}
