"use client"

import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react"
import { cx } from "@/src/lib/cx"
import s from "./fields.module.css"

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
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      <div className={s.control}>
        <span className={cx(s.icon, error && s.iconError)}>{icon}</span>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          className={cx("input", s.input, !!trailing && s.withTrailing, error && s.inputError)}
          {...input}
        />
        {trailing ? <span className={s.trailing}>{trailing}</span> : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className={`animate-fade-in ${s.error}`}>
          <AlertCircle size={14} className={s.noShrink} />
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className={s.hint}>
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
          className={`icon-btn ${s.toggle}`}
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
    <div role="alert" className={`animate-pop-in ${s.banner}`}>
      <AlertCircle size={18} className={s.bannerIcon} />
      {message}
    </div>
  )
}

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: ReactNode; pendingLabel: string }) {
  return (
    <button type="submit" className={`btn btn-accent btn-lg ${s.submit}`} disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={18} className={s.arrow} />
        </>
      )}
    </button>
  )
}

/** Only same-site paths, so `?next=` cannot send people to another domain. */
export function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/"
}
