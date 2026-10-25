"use client"

import { Check, CircleAlert, X } from "lucide-react"
import { useApp } from "../providers/AppProvider"
import s from "./Toaster.module.css"

export function Toaster() {
  const { toasts, dismissToast } = useApp()
  return (
    <div aria-live="polite" className={s.stack}>
      {toasts.map((t) => (
        <div key={t.id} className={`animate-pop-in ${s.toast}`}>
          <span className={`${s.badge} ${t.tone === "error" ? s.error : t.tone === "success" ? s.success : ""}`}>
            {t.tone === "error" ? <CircleAlert size={14} /> : <Check size={14} />}
          </span>
          <span className={s.message}>{t.message}</span>
          <button className={s.close} onClick={() => dismissToast(t.id)} aria-label="Закрыть">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
