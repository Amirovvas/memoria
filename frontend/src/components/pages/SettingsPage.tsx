"use client"

import { Check, Cloud, Loader2, LogOut, Moon, Sun } from "lucide-react"
import { useState, type ReactNode } from "react"
import { useUpdateProfile, useUser } from "@/src/hooks/useAuth"
import type { User } from "@/src/lib/api"
import { useApp, type Settings } from "../providers/AppProvider"
import { Avatar, useSignOut } from "../shell/UserMenu"
import { plural } from "../ui/bits"

function Section({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-8 @3xl:grid-cols-[240px_1fr] @3xl:gap-10">
      <div>
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {text ? <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-3">
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-muted">{hint}</span> : null}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-surface-3"}`}
      >
        <span
          className={`absolute left-0 top-0.5 size-5 rounded-full bg-white shadow-soft transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  )
}

function ThemeCard({ dark, active, onClick }: { dark: boolean; active: boolean; onClick: () => void }) {
  const c = dark
    ? { bg: "#141210", surface: "#1c1916", line: "#312c26", ink: "#f2ece3", accent: "#d47f5f" }
    : { bg: "#f6f1e9", surface: "#fffdf9", line: "#e4dbcd", ink: "#1f1b16", accent: "#b4553a" }
  return (
    <button onClick={onClick} className="group text-left" aria-pressed={active}>
      <div
        className={`relative aspect-[16/10] overflow-hidden rounded-2xl border-2 p-3 transition-colors ${active ? "border-accent" : "border-line group-hover:border-line-strong"}`}
        style={{ background: c.bg }}
      >
        <div className="flex h-full gap-2">
          <div className="w-1/4 rounded-md" style={{ background: c.surface, border: `1px solid ${c.line}` }}>
            <div className="m-2 h-1.5 w-2/3 rounded-full" style={{ background: c.accent }} />
            {[0, 1, 2].map((i) => (
              <div key={i} className="mx-2 mt-1.5 h-1 rounded-full opacity-40" style={{ background: c.ink }} />
            ))}
          </div>
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded" style={{ background: c.surface, border: `1px solid ${c.line}` }} />
            ))}
          </div>
        </div>
        {active ? (
          <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-accent text-accent-ink">
            <Check size={14} />
          </span>
        ) : null}
      </div>
      <span className="mt-2 flex items-center gap-2 text-sm font-semibold">
        {dark ? <Moon size={15} /> : <Sun size={15} />} {dark ? "Тёмная" : "Светлая"}
      </span>
    </button>
  )
}

function ProfileForm({ user }: { user: User }) {
  const { toast } = useApp()
  const update = useUpdateProfile()
  const signOut = useSignOut()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const dirty = name.trim() !== user.name || email.trim().toLowerCase() !== user.email

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        update.mutate(
          { name: name.trim(), email: email.trim() },
          { onSuccess: () => toast("Профиль сохранён", "success"), onError: (err) => toast(err.message, "error") },
        )
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar user={{ ...user, name: name || user.name }} className="size-16 text-3xl" />
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted">Имя</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted">Почта</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 sm:pl-20">
        <button type="submit" className="btn btn-primary" disabled={!dirty || update.isPending}>
          {update.isPending ? <Loader2 size={16} className="animate-spin" /> : null} Сохранить
        </button>
        <button type="button" className="btn btn-ghost text-muted" onClick={signOut}>
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </form>
  )
}

function ProfileSection() {
  const { data: user } = useUser()
  if (!user) return null
  // keyed by the saved values, so the form resets after another tab or a save changes them
  return <ProfileForm key={`${user.name}|${user.email}`} user={user} />
}

export function SettingsPage() {
  const { theme, setTheme, settings, updateSettings, activeProjects, trashedProjects, favorites, uploads } = useApp()
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => updateSettings({ [k]: v } as Partial<Settings>)

  return (
    <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 lg:px-10">
      <header className="pb-8 pt-4">
        <p className="eyebrow">Аккаунт</p>
        <h1 className="display mt-2 text-5xl sm:text-6xl">Настройки</h1>
      </header>

      <Section title="Профиль" text="Имя видно на общих коллажах.">
        <ProfileSection />
      </Section>

      <Section title="Оформление" text="Тема интерфейса. Сами коллажи всегда выглядят одинаково.">
        <div className="grid max-w-md grid-cols-2 gap-4">
          <ThemeCard dark={false} active={theme === "light"} onClick={() => setTheme("light")} />
          <ThemeCard dark active={theme === "dark"} onClick={() => setTheme("dark")} />
        </div>
      </Section>

      <Section title="Редактор">
        <div className="divide-y divide-line">
          <Toggle checked={settings.autosave} onChange={set("autosave")} label="Автосохранение" hint="Сохранять изменения сразу, без кнопки «Сохранить»" />
          <Toggle checked={settings.showGuides} onChange={set("showGuides")} label="Направляющие" hint="Показывать линии выравнивания по центру при перетаскивании" />
        </div>
      </Section>

      <Section title="Экспорт" text="Формат по умолчанию в окне скачивания.">
        <div className="inline-flex rounded-full border border-line bg-surface p-1">
          {(["png", "jpg", "pdf"] as const).map((f) => (
            <button
              key={f}
              onClick={() => updateSettings({ defaultFormat: f })}
              className={`h-9 rounded-full px-5 text-sm font-semibold uppercase transition-colors ${
                settings.defaultFormat === f ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Уведомления">
        <Toggle checked={settings.emailDigest} onChange={set("emailDigest")} label="Подборка шаблонов на почту" hint="Раз в неделю — новые шаблоны и идеи для коллажей" />
      </Section>

      <Section title="Хранилище" text="Проекты, избранное и фото хранятся в вашем аккаунте и доступны с любого устройства.">
        <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-soft text-sage">
            <Cloud size={18} />
          </span>
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 text-sm @xl:grid-cols-4">
            {[
              [activeProjects.length, plural(activeProjects.length, "проект", "проекта", "проектов")],
              [trashedProjects.length, "в корзине"],
              [favorites.length, "в избранном"],
              [uploads.length, plural(uploads.length, "фото", "фото", "фото")],
            ].map(([n, label]) => (
              <div key={String(label)}>
                <dt className="display text-2xl">{n}</dt>
                <dd className="text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </div>
  )
}
