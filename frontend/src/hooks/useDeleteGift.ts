"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { giftsApi } from "@/src/lib/api"
import type { Gift } from "@/src/lib/gifts"
import { giftsKey } from "./useGifts"
import { useUser } from "./useUser"

export function useDeleteGift() {
  const { data: user } = useUser()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: giftsApi.remove,
    onSuccess: (_, id) => qc.setQueryData<Gift[]>(giftsKey(user?.id), (list) => list?.filter((g) => g.id !== id)),
  })
}
