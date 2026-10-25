"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/src/lib/api"
import { userKey } from "./useUser"

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => qc.setQueryData(userKey, user),
  })
}
