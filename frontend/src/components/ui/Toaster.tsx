"use client"

import { Check, CircleAlert, X } from "lucide-react"
import { useApp } from "../providers/AppProvider"

export function Toaster() {
  const { toasts, dismissToast } = useApp()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-pop-in pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-ink py-2.5 pl-3 pr-2 text-sm font-medium text-bg shadow-float"
        >
          <span
            className={`grid size-6 place-items-center rounded-full ${
              t.tone === "error" ? "bg-accent text-accent-ink" : t.tone === "success" ? "bg-sage text-white" : "bg-bg/15"
            }`}
          >
            {t.tone === "error" ? <CircleAlert size={14} /> : <Check size={14} />}
          </span>
          <span className="pr-1">{t.message}</span>
          <button className="grid size-7 place-items-center rounded-full opacity-60 hover:bg-bg/10 hover:opacity-100" onClick={() => dismissToast(t.id)} aria-label="Закрыть">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
