"use client"

import { Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLogin } from "@/src/hooks/useLogin"
import { useUser } from "@/src/hooks/useUser"
import { useApp } from "../providers/AppProvider"
import { Field, FormError, PasswordField, SubmitButton, safeNext } from "./fields"
import s from "./form.module.css"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {}
  if (!email.trim()) errors.email = "Введите email"
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Похоже, в адресе опечатка"
  if (!password) errors.password = "Введите пароль"
  return errors
}

export function LoginForm() {
  const router = useRouter()
  const next = safeNext(useSearchParams().get("next"))
  const { toast } = useApp()
  const { data: user } = useUser()
  const login = useLogin()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(email, password) : {}

  // already signed in (or just signed in): leave the page
  useEffect(() => {
    if (user) router.replace(next)
  }, [user, next, router])

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
        if (Object.keys(validate(email, password)).length) return
        login.mutate(
          { email: email.trim(), password },
          { onSuccess: ({ user }) => toast(`С возвращением, ${user.name}!`, "success") },
        )
      }}
    >
      <p className="eyebrow">С возвращением</p>
      <h1 className={`display ${s.title}`}>
        Войти в <em className={s.accent}>Memoria</em>
      </h1>
      <p className={s.lead}>Ваши коллажи, избранное и черновики ждут вас.</p>

      <div className={s.fields}>
        <FormError message={login.error?.message ?? null} />
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoFocus
        />
        <PasswordField
          label="Пароль"
          icon={<Lock />}
          name="password"
          autoComplete="current-password"
          placeholder="Ваш пароль"
          enterKeyHint="go"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
      </div>

      <div className={s.submit}>
        <SubmitButton pending={login.isPending || login.isSuccess} pendingLabel="Входим…">
          Войти
        </SubmitButton>
      </div>

      <div className={s.divider}>
        <span className={s.rule} />
        впервые здесь?
        <span className={s.rule} />
      </div>

      <Link
        href={next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`}
        className={`btn btn-secondary btn-lg ${s.wide}`}
      >
        Создать аккаунт
      </Link>
    </form>
  )
}
