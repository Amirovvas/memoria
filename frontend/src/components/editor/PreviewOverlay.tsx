"use client"

import { ArrowLeft, Download } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { FORMATS } from "@/src/lib/collage/styles"
import type { CollageDoc } from "@/src/lib/collage/types"
import { CollageCanvas } from "../collage/CollageCanvas"
import s from "./PreviewOverlay.module.css"

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
      className={`animate-fade-in ${s.overlay}`}
      style={{ background: backdrop.bg, color: dark ? "#f2ece3" : "#1f1b16" }}
      role="dialog"
      aria-modal="true"
      aria-label="Предпросмотр коллажа"
    >
      <header className={s.header}>
        <button className={`btn btn-sm ${dark ? s.backDark : s.backLight}`} onClick={onClose}>
          <ArrowLeft size={15} /> <span className={s.label}>К редактированию</span>
        </button>
        <p className={s.title}>{name}</p>
        <button className="btn btn-sm btn-accent" onClick={onDownload}>
          <Download size={15} /> <span className={s.label}>Скачать</span>
        </button>
      </header>
      <div className={s.stage}>
        <div className={`animate-pop-in ${s.canvas}`} style={{ maxWidth: `min(100%, calc((100dvh - 180px) * ${ratio}))` }}>
          <CollageCanvas doc={doc} imgWidth={1600} style={{ boxShadow: "0 40px 80px -30px rgb(0 0 0 / 0.55)" }} />
        </div>
      </div>
      <footer className={s.footer}>
        {BACKDROPS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBackdrop(b)}
            className={s.backdrop}
            style={{ background: backdrop.key === b.key ? (dark ? "rgb(255 255 255 / 0.14)" : "rgb(0 0 0 / 0.08)") : "transparent" }}
          >
            <span className={s.dot} style={{ background: b.bg }} />
            {b.label}
          </button>
        ))}
      </footer>
    </div>,
    document.body,
  )
}
