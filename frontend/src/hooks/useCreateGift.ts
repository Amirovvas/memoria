"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { giftsApi, type NewGift } from "@/src/lib/api"
import type { Gift } from "@/src/lib/gifts"
import { giftsKey } from "./useGifts"
import { useUser } from "./useUser"

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
