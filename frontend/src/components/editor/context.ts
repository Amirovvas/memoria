"use client"

import { createContext, useCallback, useContext, useState } from "react"
import type { CollageDoc, CollageEl } from "@/src/lib/collage/types"

export type Tool = "templates" | "photos" | "text" | "background" | "decor"

type Updater = CollageDoc | ((d: CollageDoc) => CollageDoc)

interface HistoryState {
  past: CollageDoc[]
  present: CollageDoc
  future: CollageDoc[]
}

const LIMIT = 80

const apply = (u: Updater, d: CollageDoc) => (typeof u === "function" ? u(d) : u)

/**
 * Undo/redo for the collage. `commit` records a step; `live` changes the doc without a step
 * (used while dragging), and `settle` turns a finished drag into one step.
 */
export function useHistory(initial: CollageDoc) {
  const [h, setH] = useState<HistoryState>({ past: [], present: initial, future: [] })

  const commit = useCallback((u: Updater) => {
    setH((s) => {
      const next = apply(u, s.present)
      if (next === s.present) return s
      return { past: [...s.past, s.present].slice(-LIMIT), present: next, future: [] }
    })
  }, [])

  const live = useCallback((u: Updater) => setH((s) => ({ ...s, present: apply(u, s.present) })), [])

  const settle = useCallback((before: CollageDoc) => {
    setH((s) => (s.present === before ? s : { past: [...s.past, before].slice(-LIMIT), present: s.present, future: [] }))
  }, [])

  const undo = useCallback(
    () =>
      setH((s) =>
        s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s,
      ),
    [],
  )
  const redo = useCallback(
    () => setH((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s)),
    [],
  )

  return {
    doc: h.present,
    commit,
    live,
    settle,
    undo,
    redo,
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
  }
}

export interface EditorApi {
  doc: CollageDoc
  projectId: string
  category: string
  projectName: string
  selected: CollageEl | null
  commit: (u: Updater) => void
  updateEl: (id: string, patch: Partial<CollageEl>) => void
  removeEl: (id: string) => void
  addEl: (el: CollageEl) => void
  select: (id: string | null) => void
  startEditing: (id: string) => void
  placePhoto: (slotId: string, src: string) => void
  autoFill: (srcs?: string[]) => void
  openFilePicker: (slotId?: string) => void
  setTool: (t: Tool | null) => void
}

export const EditorCtx = createContext<EditorApi | null>(null)

export function useEditor() {
  const ctx = useContext(EditorCtx)
  if (!ctx) throw new Error("useEditor must be used inside the editor")
  return ctx
}
