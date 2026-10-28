"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { giftsApi } from "@/src/lib/api"
import type { Gift } from "@/src/lib/gifts"
import { giftsKey } from "./useGifts"
import { useUser } from "./useUser"

/** The gift leaves the list at once; if the server refuses, it comes back where it was. */
export function useDeleteGift() {
  const { data: user } = useUser()
  const qc = useQueryClient()
  const key = giftsKey(user?.id)
  return useMutation({
    mutationFn: giftsApi.remove,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: key })
      const before = qc.getQueryData<Gift[]>(key)
      qc.setQueryData<Gift[]>(key, (list) => list?.filter((g) => g.id !== id))
      return { before }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.before) qc.setQueryData(key, ctx.before)
    },
  })
}
