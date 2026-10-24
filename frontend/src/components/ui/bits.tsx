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
    <Link href="/" className="flex items-center gap-2.5" aria-label="Memoria — на главную">
      <span className="relative grid size-9 shrink-0 place-items-center">
        <span className="absolute inset-0 rotate-[-8deg] rounded-[9px] border border-line-strong bg-surface" />
        <span className="absolute inset-0 rotate-[6deg] rounded-[9px] bg-accent" />
        <span className="relative font-serif text-xl font-semibold italic leading-none text-accent-ink">M</span>
      </span>
      {!compact ? <span className="font-serif text-[26px] font-semibold leading-none tracking-tight">Memoria</span> : null}
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
    <div className="animate-fade-up mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      {art}
      <h3 className="display mt-6 text-3xl">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}

/** Three tilted blank polaroids — used as illustration in empty states. */
export function EmptyArt({ icon }: { icon: ReactNode }) {
  return (
    <div className="relative h-36 w-48">
      <div className="absolute left-2 top-4 h-28 w-24 -rotate-12 rounded-sm border border-line bg-surface p-2 pb-6 shadow-card">
        <div className="h-full w-full rounded-[2px] bg-surface-2" />
      </div>
      <div className="absolute right-2 top-3 h-28 w-24 rotate-[10deg] rounded-sm border border-line bg-surface p-2 pb-6 shadow-card">
        <div className="h-full w-full rounded-[2px] bg-surface-3" />
      </div>
      <div className="absolute left-1/2 top-0 grid h-32 w-26 -translate-x-1/2 place-items-center rounded-sm border border-line bg-surface p-2 pb-7 shadow-card">
        <div className="grid h-full w-full place-items-center rounded-[2px] bg-accent-soft text-accent">{icon}</div>
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
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="display text-[32px] sm:text-[38px]">{title}</h2>
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
