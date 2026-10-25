"use client"

import { X } from "lucide-react"
import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import s from "./Modal.module.css"

export function Modal({
  open,
  onClose,
  children,
  className = "",
  label,
  hideClose,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  label: string
  hideClose?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className={s.overlay} role="dialog" aria-modal="true" aria-label={label}>
      <div className={`animate-fade-in ${s.scrim}`} onClick={onClose} />
      <div className={`animate-pop-in ${s.panel} ${className}`}>
        {!hideClose ? (
          <button className={`icon-btn ${s.close}`} onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  )
}
