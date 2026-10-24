"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiError, giftsApi, type NewGift } from "@/src/lib/api"
import type { Gift } from "@/src/lib/gifts"
import { useUser } from "./useAuth"

const giftsKey = (userId?: string) => ["gifts", userId] as const

export function useGifts() {
  const { data: user } = useUser()
  return useQuery({ queryKey: giftsKey(user?.id), queryFn: giftsApi.list, enabled: !!user })
}

export interface GiftDraft extends Omit<NewGift, "collages" | "music"> {
  /** collage snapshots rendered in the browser */
  snapshots: { blob: Blob; w: number; h: number }[]
  music: { track: string } | { file: File } | null
}

/** Uploads the snapshots and the user's own song, then saves the gift that points at them. */
export function useCreateGift() {
  const { data: user } = useUser()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ snapshots, music, ...fields }: GiftDraft) => {
      const own = music && "file" in music ? music.file : null
      const [collages, song] = await Promise.all([
        Promise.all(snapshots.map(async (s) => ({ path: (await giftsApi.uploadFile(s.blob)).path, w: s.w, h: s.h }))),
        own ? giftsApi.uploadFile(own) : null,
      ])
      return giftsApi.create({
        ...fields,
        collages,
        music: own && song ? { path: song.path, title: own.name.replace(/\.\w+$/, "").slice(0, 120) } : music && "track" in music ? music : null,
      })
    },
    onSuccess: (gift) => qc.setQueryData<Gift[]>(giftsKey(user?.id), (list) => [gift, ...(list ?? [])]),
  })
}

export function useDeleteGift() {
  const { data: user } = useUser()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: giftsApi.remove,
    onSuccess: (_, id) => qc.setQueryData<Gift[]>(giftsKey(user?.id), (list) => list?.filter((g) => g.id !== id)),
  })
}

/** The surprise page a friend opens; works without an account. */
export function usePublicGift(id: string) {
  return useQuery({
    queryKey: ["gift", id],
    queryFn: () => giftsApi.open(id),
    staleTime: Infinity,
    retry: (count, e) => !(e instanceof ApiError && e.status < 500) && count < 2,
  })
}
