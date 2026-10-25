"use client"

import { useQuery } from "@tanstack/react-query"
import { ApiError, authApi, refreshSession, type User } from "@/src/lib/api"

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
