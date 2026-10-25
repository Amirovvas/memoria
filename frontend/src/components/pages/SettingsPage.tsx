"use client"

import { Check, Cloud, Loader2, LogOut, Moon, Sun } from "lucide-react"
import { useState, type ReactNode } from "react"
import { useUpdateProfile } from "@/src/hooks/useUpdateProfile"
import { useUser } from "@/src/hooks/useUser"
import type { User } from "@/src/lib/api"
import { useApp, type Settings } from "../providers/AppProvider"
import { Avatar, useSignOut } from "../shell/UserMenu"
import { plural } from "../ui/bits"
import page from "./page.module.css"
import s from "./SettingsPage.module.css"

function Section({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className={s.section}>
      <div>
        <h2 className={s.sectionTitle}>{title}</h2>
        {text ? <p className={s.sectionText}>{text}</p> : null}
      </div>
      <div className={s.minW0}>{children}</div>
    </section>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className={s.toggle}>
      <span>
        <span className={s.toggleLabel}>{label}</span>
        {hint ? <span className={s.toggleHint}>{hint}</span> : null}
      </span>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={s.switch}>
        <span className={s.knob} />
      </button>
    </label>
  )
}

function ThemeCard({ dark, active, onClick }: { dark: boolean; active: boolean; onClick: () => void }) {
  const c = dark
    ? { bg: "#141210", surface: "#1c1916", line: "#312c26", ink: "#f2ece3", accent: "#d47f5f" }
    : { bg: "#f6f1e9", surface: "#fffdf9", line: "#e4dbcd", ink: "#1f1b16", accent: "#b4553a" }
  return (
    <button onClick={onClick} className={s.themeCard} aria-pressed={active}>
      <div className={s.preview} style={{ background: c.bg }}>
        <div className={s.previewInner}>
          <div className={s.previewSide} style={{ background: c.surface, border: `1px solid ${c.line}` }}>
            <div className={s.previewAccent} style={{ background: c.accent }} />
            {[0, 1, 2].map((i) => (
              <div key={i} className={s.previewLine} style={{ background: c.ink }} />
            ))}
          </div>
          <div className={s.previewTiles}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={s.previewTile} style={{ background: c.surface, border: `1px solid ${c.line}` }} />
            ))}
          </div>
        </div>
        {active ? (
          <span className={s.check}>
            <Check size={14} />
          </span>
        ) : null}
      </div>
      <span className={s.themeName}>
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
      <div className={s.profile}>
        <Avatar user={{ ...user, name: name || user.name }} className={s.avatar} />
        <div className={s.fields}>
          <label className={s.field}>
            <span className={s.fieldLabel}>Имя</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required />
          </label>
          <label className={s.field}>
            <span className={s.fieldLabel}>Почта</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
        </div>
      </div>
      <div className={s.profileActions}>
        <button type="submit" className="btn btn-primary" disabled={!dirty || update.isPending}>
          {update.isPending ? <Loader2 size={16} className="animate-spin" /> : null} Сохранить
        </button>
        <button type="button" className={`btn btn-ghost ${s.muted}`} onClick={signOut}>
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
    <div className={s.page}>
      <header className={s.header}>
        <p className="eyebrow">Аккаунт</p>
        <h1 className={`display ${page.title}`}>Настройки</h1>
      </header>

      <Section title="Профиль" text="Имя видно на общих коллажах.">
        <ProfileSection />
      </Section>

      <Section title="Оформление" text="Тема интерфейса. Сами коллажи всегда выглядят одинаково.">
        <div className={s.themes}>
          <ThemeCard dark={false} active={theme === "light"} onClick={() => setTheme("light")} />
          <ThemeCard dark active={theme === "dark"} onClick={() => setTheme("dark")} />
        </div>
      </Section>

      <Section title="Редактор">
        <div className={s.toggles}>
          <Toggle checked={settings.autosave} onChange={set("autosave")} label="Автосохранение" hint="Сохранять изменения сразу, без кнопки «Сохранить»" />
          <Toggle checked={settings.showGuides} onChange={set("showGuides")} label="Направляющие" hint="Показывать линии выравнивания по центру при перетаскивании" />
        </div>
      </Section>

      <Section title="Экспорт" text="Формат по умолчанию в окне скачивания.">
        <div className={s.formats}>
          {(["png", "jpg", "pdf"] as const).map((f) => (
            <button
              key={f}
              onClick={() => updateSettings({ defaultFormat: f })}
              className={`${s.format} ${settings.defaultFormat === f ? s.formatActive : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Хранилище" text="Проекты, избранное и фото хранятся в вашем аккаунте и доступны с любого устройства.">
        <div className={s.storage}>
          <span className={s.storageIcon}>
            <Cloud size={18} />
          </span>
          <dl className={s.stats}>
            {[
              [activeProjects.length, plural(activeProjects.length, "проект", "проекта", "проектов")],
              [trashedProjects.length, "в корзине"],
              [favorites.length, "в избранном"],
              [uploads.length, plural(uploads.length, "фото", "фото", "фото")],
            ].map(([n, label]) => (
              <div key={String(label)}>
                <dt className={`display ${s.statValue}`}>{n}</dt>
                <dd className={s.muted}>{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </div>
  )
}
