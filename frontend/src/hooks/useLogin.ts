"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi, setAccessToken } from "@/src/lib/api"
import { userKey } from "./useUser"

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
