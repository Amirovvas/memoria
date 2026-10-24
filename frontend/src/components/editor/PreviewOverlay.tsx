"use client"

import { ArrowLeft, Download } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { FORMATS } from "@/src/lib/collage/styles"
import type { CollageDoc } from "@/src/lib/collage/types"
import { CollageCanvas } from "../collage/CollageCanvas"

const BACKDROPS = [
  { key: "dark", label: "Тёмный", bg: "#161310" },
  { key: "table", label: "Стол", bg: "#cbb89c" },
  { key: "light", label: "Светлый", bg: "#efe9df" },
]

/** Shows the finished collage without any editing UI. */
export function PreviewOverlay({
  open,
  onClose,
  onDownload,
  doc,
  name,
}: {
  open: boolean
  onClose: () => void
  onDownload: () => void
  doc: CollageDoc
  name: string
}) {
  const [backdrop, setBackdrop] = useState(BACKDROPS[0])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null
  const ratio = FORMATS[doc.format].ratio
  const dark = backdrop.key === "dark"

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-[75] flex flex-col transition-colors duration-500"
      style={{ background: backdrop.bg, color: dark ? "#f2ece3" : "#1f1b16" }}
      role="dialog"
      aria-modal="true"
      aria-label="Предпросмотр коллажа"
    >
      <header className="flex h-16 shrink-0 items-center gap-3 px-3 sm:px-6">
        <button className={`btn btn-sm ${dark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"}`} onClick={onClose}>
          <ArrowLeft size={15} /> <span className="max-sm:hidden">К редактированию</span>
        </button>
        <p className="min-w-0 flex-1 truncate text-center font-serif text-xl">{name}</p>
        <button className="btn btn-sm btn-accent" onClick={onDownload}>
          <Download size={15} /> <span className="max-sm:hidden">Скачать</span>
        </button>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-10">
        <div className="animate-pop-in w-full" style={{ maxWidth: `min(100%, calc((100dvh - 180px) * ${ratio}))` }}>
          <CollageCanvas doc={doc} imgWidth={1600} style={{ boxShadow: "0 40px 80px -30px rgb(0 0 0 / 0.55)" }} />
        </div>
      </div>
      <footer className="flex h-16 shrink-0 items-center justify-center gap-2">
        {BACKDROPS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBackdrop(b)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition"
            style={{ background: backdrop.key === b.key ? (dark ? "rgb(255 255 255 / 0.14)" : "rgb(0 0 0 / 0.08)") : "transparent" }}
          >
            <span className="size-3.5 rounded-full ring-1 ring-black/20" style={{ background: b.bg }} />
            {b.label}
          </button>
        ))}
      </footer>
    </div>,
    document.body,
  )
}
