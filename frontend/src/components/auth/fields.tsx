"use client"

import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react"

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className">

export function Field({
  label,
  icon,
  error,
  hint,
  trailing,
  ...input
}: InputProps & { label: string; icon: ReactNode; error?: string; hint?: ReactNode; trailing?: ReactNode }) {
  const id = useId()
  const described = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block pl-1 text-[13px] font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors [&>svg]:size-[18px] ${
            error ? "text-accent" : "text-faint"
          }`}
        >
          {icon}
        </span>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          // 16px on phones keeps iOS Safari from zooming into the field
          className={`input h-12 pl-11 text-base sm:text-[15px] ${trailing ? "pr-12" : ""} ${
            error ? "border-accent focus:border-accent" : ""
          }`}
          {...input}
        />
        {trailing ? <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span> : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="animate-fade-in mt-1.5 flex items-center gap-1.5 pl-1 text-[13px] font-medium text-accent">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-1.5 pl-1">
          {hint}
        </div>
      ) : null}
    </div>
  )
}

export function PasswordField(props: Omit<Parameters<typeof Field>[0], "type" | "trailing">) {
  const [shown, setShown] = useState(false)
  return (
    <Field
      {...props}
      type={shown ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="icon-btn size-9 text-muted hover:text-ink"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? "Скрыть пароль" : "Показать пароль"}
          aria-pressed={shown}
        >
          {shown ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="animate-pop-in flex items-start gap-2.5 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm font-medium text-ink"
    >
      <AlertCircle size={18} className="mt-px shrink-0 text-accent" />
      {message}
    </div>
  )
}

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: ReactNode; pendingLabel: string }) {
  return (
    <button type="submit" className="btn btn-accent btn-lg group w-full" disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  )
}

/** Only same-site paths, so `?next=` cannot send people to another domain. */
export function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/"
}
