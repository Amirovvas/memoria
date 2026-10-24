"use client"

import { Check, Lock, Mail, User } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRegister, useUser } from "@/src/hooks/useAuth"
import { ApiError } from "@/src/lib/api"
import { useApp } from "../providers/AppProvider"
import { Field, FormError, PasswordField, SubmitButton, safeNext } from "./fields"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Values {
  name: string
  email: string
  password: string
}

// same rules as the API, so most mistakes are caught before a request
function validate({ name, email, password }: Values) {
  const errors: Partial<Record<keyof Values, string>> = {}
  if (!name.trim()) errors.name = "Как к вам обращаться?"
  else if (name.trim().length > 80) errors.name = "Не длиннее 80 символов"
  if (!email.trim()) errors.email = "Введите email"
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Похоже, в адресе опечатка"
  if (password.length < 8) errors.password = "Минимум 8 символов"
  else if (new TextEncoder().encode(password).length > 72) errors.password = "Слишком длинный пароль"
  return errors
}

const LEVELS = [
  { label: "Слабый", color: "bg-accent" },
  { label: "Неплохой", color: "bg-[#d39a4a]" },
  { label: "Хороший", color: "bg-sage" },
  { label: "Отличный", color: "bg-sage" },
]

function strength(p: string) {
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[a-zа-яё]/.test(p) && /[A-ZА-ЯЁ]/.test(p)) score++
  if (/\d/.test(p) && /[^\p{L}\d]/u.test(p)) score++
  return Math.max(1, score)
}

function StrengthMeter({ password }: { password: string }) {
  const score = strength(password)
  const level = LEVELS[score - 1]
  return (
    <div aria-live="polite">
      <div className="flex gap-1.5">
        {LEVELS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score && level ? level.color : "bg-surface-3"}`}
          />
        ))}
      </div>
      <p className="mt-1.5 flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1">
          <Check size={13} className={password.length >= 8 ? "text-sage" : "text-faint"} />
          Не короче 8 символов
        </span>
        {password && level ? <span className="font-semibold text-ink">{level.label}</span> : null}
      </p>
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const next = safeNext(useSearchParams().get("next"))
  const { toast } = useApp()
  const { data: user } = useUser()
  const register = useRegister()

  const [values, setValues] = useState<Values>({ name: "", email: "", password: "" })
  const [submitted, setSubmitted] = useState(false)
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const errors = submitted ? validate(values) : {}
  // "email taken" belongs under the email field, not in the banner
  const conflict = register.error instanceof ApiError && register.error.status === 409 ? register.error.message : null
  const emailError = errors.email ?? conflict ?? undefined
  const bannerError = conflict ? null : (register.error?.message ?? null)

  useEffect(() => {
    if (user) router.replace(next)
  }, [user, next, router])

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
        if (Object.keys(validate(values)).length) return
        register.mutate(
          { name: values.name.trim(), email: values.email.trim(), password: values.password },
          { onSuccess: ({ user }) => toast(`Добро пожаловать, ${user.name}!`, "success") },
        )
      }}
    >
      <p className="eyebrow">Новый аккаунт</p>
      <h1 className="display mt-3 text-[44px] sm:text-[52px]">
        Начните свою <em className="text-accent">историю</em>
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">Сохраняйте коллажи, собирайте избранное и возвращайтесь к ним с любого устройства.</p>

      <div className="mt-8 space-y-4">
        <FormError message={bannerError} />
        <Field
          label="Имя"
          icon={<User />}
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Как вас зовут"
          maxLength={80}
          value={values.name}
          onChange={set("name")}
          error={errors.name}
          autoFocus
        />
        <Field
          label="Email"
          icon={<Mail />}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => {
            set("email")(e)
            if (conflict) register.reset()
          }}
          error={emailError}
        />
        <PasswordField
          label="Пароль"
          icon={<Lock />}
          name="password"
          autoComplete="new-password"
          placeholder="Придумайте пароль"
          enterKeyHint="go"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
          hint={<StrengthMeter password={values.password} />}
        />
      </div>

      <div className="mt-7">
        <SubmitButton pending={register.isPending || register.isSuccess} pendingLabel="Создаём аккаунт…">
          Создать аккаунт
        </SubmitButton>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link
          href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          Войти
        </Link>
      </p>
    </form>
  )
}
