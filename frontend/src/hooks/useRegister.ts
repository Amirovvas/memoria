"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi, setAccessToken } from "@/src/lib/api"
import { userKey } from "./useUser"

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
