"use client"

import { useQuery } from "@tanstack/react-query"
import { ApiError, giftsApi } from "@/src/lib/api"

/** The surprise page a friend opens; works without an account. */
export function usePublicGift(id: string) {
  return useQuery({
    queryKey: ["gift", id],
    queryFn: () => giftsApi.open(id),
    staleTime: Infinity,
    retry: (count, e) => !(e instanceof ApiError && e.status < 500) && count < 2,
  })
}
