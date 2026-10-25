"use client"

import {
  Cake,
  Camera,
  Gem,
  GraduationCap,
  Flower2,
  Heart,
  House,
  LayoutGrid,
  Moon,
  Plane,
  Plus,
  Scissors,
  Smartphone,
  Star,
  Sun,
  Users,
  type LucideProps,
} from "lucide-react"
import Link from "next/link"
import { useSyncExternalStore, type ComponentType, type ReactNode } from "react"
import type { CategoryIcon as IconKey } from "@/src/lib/catalog"
import { useApp } from "../providers/AppProvider"
import s from "./bits.module.css"

const ICONS: Record<IconKey, ComponentType<LucideProps>> = {
  plane: Plane,
  heart: Heart,
  cake: Cake,
  users: Users,
  camera: Camera,
  home: House,
  graduation: GraduationCap,
  gem: Gem,
  grid: LayoutGrid,
  flower: Flower2,
  scissors: Scissors,
  phone: Smartphone,
  star: Star,
  plus: Plus,
}

export function CategoryIcon({ icon, ...props }: { icon: IconKey } & LucideProps) {
  const Icon = ICONS[icon]
  return <Icon {...props} />
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className={s.logo} aria-label="Memoria — на главную">
      <span className={s.mark}>
        <span className={s.markBack} />
        <span className={s.markFront} />
        <span className={s.markLetter}>M</span>
      </span>
      {!compact ? <span className={s.wordmark}>Memoria</span> : null}
    </Link>
  )
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useApp()
  const dark = theme === "dark"
  return (
    <button
      className={`icon-btn ${className}`}
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export function EmptyState({
  art,
  title,
  text,
  action,
}: {
  art?: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className={`animate-fade-up ${s.empty}`}>
      {art}
      <h3 className={`display ${s.emptyTitle}`}>{title}</h3>
      <p className={s.emptyText}>{text}</p>
      {action ? <div className={s.emptyActions}>{action}</div> : null}
    </div>
  )
}

/** Three tilted blank polaroids — used as illustration in empty states. */
export function EmptyArt({ icon }: { icon: ReactNode }) {
  return (
    <div className={s.art}>
      <div className={`${s.polaroid} ${s.polaroidLeft}`}>
        <div className={s.photo} />
      </div>
      <div className={`${s.polaroid} ${s.polaroidRight}`}>
        <div className={`${s.photo} ${s.photoAlt}`} />
      </div>
      <div className={`${s.polaroid} ${s.polaroidCenter}`}>
        <div className={`${s.photo} ${s.photoIcon}`}>{icon}</div>
      </div>
    </div>
  )
}

export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

const subscribe = () => () => {}
/** true only after hydration — for values that differ between server and browser (relative dates). */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "auto" })
const dtf = new Intl.DateTimeFormat("ru", { day: "numeric", month: "short", timeZone: "UTC" })

function relativeTime(ts: number) {
  const diff = (ts - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return "только что"
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute")
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour")
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day")
  return new Intl.DateTimeFormat("ru", { day: "numeric", month: "short" }).format(ts)
}

export function TimeAgo({ ts }: { ts: number }) {
  const hydrated = useHydrated()
  return <span>{hydrated ? relativeTime(ts) : dtf.format(ts)}</span>
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className={s.sectionHeader}>
      <div>
        {eyebrow ? <p className={`eyebrow ${s.sectionEyebrow}`}>{eyebrow}</p> : null}
        <h2 className={`display ${s.sectionTitle}`}>{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}
