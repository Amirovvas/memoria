"use client"

import { useQuery } from "@tanstack/react-query"
import { giftsApi } from "@/src/lib/api"
import { useUser } from "./useUser"

export const giftsKey = (userId?: string) => ["gifts", userId] as const

export function useGifts() {
  const { data: user } = useUser()
  return useQuery({ queryKey: giftsKey(user?.id), queryFn: giftsApi.list, enabled: !!user })
}
