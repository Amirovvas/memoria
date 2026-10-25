"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi, setAccessToken } from "@/src/lib/api"
import { userKey } from "./useUser"

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
