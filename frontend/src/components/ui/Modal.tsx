"use client"

import { X } from "lucide-react"
import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"

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
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="animate-fade-in absolute inset-0 bg-[var(--scrim)]" onClick={onClose} />
      <div
        className={`animate-pop-in relative max-h-[92dvh] w-full overflow-auto rounded-t-3xl bg-surface shadow-float sm:rounded-3xl ${className}`}
      >
        {!hideClose ? (
          <button className="icon-btn absolute right-3 top-3 z-10 bg-surface/80 backdrop-blur" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  )
}
