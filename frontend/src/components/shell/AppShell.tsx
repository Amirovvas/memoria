"use client"

import {
  FolderHeart,
  Gift,
  Heart,
  House,
  LayoutTemplate,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense, useState, useSyncExternalStore, type ReactNode } from "react"
import { CATEGORIES } from "@/src/lib/catalog"
import { photo } from "@/src/lib/photos"
import { useApp } from "../providers/AppProvider"
import { CategoryIcon, Logo, ThemeToggle } from "../ui/bits"
import { HeaderUser, MobileHeaderUser, SidebarUser } from "./UserMenu"

const NAV = [
  { href: "/", label: "Главная", icon: House },
  { href: "/templates", label: "Все шаблоны", icon: LayoutTemplate },
  { href: "/projects", label: "Мои проекты", icon: FolderHeart },
  { href: "/gifts", label: "Мои подарки", icon: Gift },
  { href: "/favorites", label: "Избранное", icon: Heart },
  { href: "/trash", label: "Корзина", icon: Trash2 },
]

function useMedia(query: string, serverValue: boolean) {
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

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarContent({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const { trashedProjects, favorites } = useApp()

  return (
    <div className="flex h-full flex-col">
      <nav className="space-y-0.5 px-3" aria-label="Основная навигация">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          const count = href === "/favorites" ? favorites.length : href === "/trash" ? trashedProjects.length : 0
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={compact ? label : undefined}
              className={`group flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors ${
                active ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2/70 hover:text-ink"
              } ${compact ? "justify-center px-0" : ""}`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-accent" : ""} />
              {!compact ? (
                <>
                  <span className="flex-1">{label}</span>
                  {count ? <span className="text-xs tabular-nums text-faint">{count}</span> : null}
                </>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {!compact ? <p className="eyebrow mb-2 px-3">Категории</p> : <div className="mx-auto mb-2 h-px w-8 bg-line" />}
        <ul className="space-y-0.5">
          {CATEGORIES.map((c) => {
            const href = `/category/${c.slug}`
            const active = pathname === href
            return (
              <li key={c.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  title={compact ? c.name : undefined}
                  className={`flex items-center gap-3 rounded-xl p-1.5 text-[13.5px] transition-colors ${
                    active ? "bg-surface-2 font-semibold text-ink" : "text-muted hover:bg-surface-2/70 hover:text-ink"
                  } ${compact ? "justify-center" : ""}`}
                >
                  {compact ? (
                    <span className="grid size-8 place-items-center">
                      <CategoryIcon icon={c.icon} size={17} strokeWidth={1.8} className={active ? "text-accent" : ""} />
                    </span>
                  ) : (
                    <>
                      <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo(c.cover, 96)} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <CategoryIcon icon={c.icon} size={14} className="text-faint" />
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-line px-3 py-3">
        <SidebarUser compact={compact} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp()
  const desktop = useMedia("(min-width: 1024px)", true)
  const compact = !desktop || sidebarCollapsed

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-bg transition-[width] duration-300 md:flex ${
        compact ? "w-[76px]" : "w-[272px]"
      }`}
    >
      <div className={`flex h-[72px] shrink-0 items-center ${compact ? "justify-center" : "justify-between pl-6 pr-3"}`}>
        <Logo compact={compact} />
        {!compact ? (
          <button className="icon-btn text-muted" onClick={() => setSidebarCollapsed(true)} aria-label="Свернуть меню">
            <PanelLeftClose size={18} />
          </button>
        ) : null}
      </div>
      {compact && desktop ? (
        <button className="icon-btn mx-auto mb-2 text-muted" onClick={() => setSidebarCollapsed(false)} aria-label="Развернуть меню">
          <PanelLeftOpen size={18} />
        </button>
      ) : null}
      <div className="min-h-0 flex-1">
        <SidebarContent compact={compact} />
      </div>
    </aside>
  )
}

function HeaderSearch({ className = "" }: { className?: string }) {
  const router = useRouter()
  const [q, setQ] = useState("")
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        router.push(q.trim() ? `/templates?q=${encodeURIComponent(q.trim())}` : "/templates")
      }}
    >
      <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="input h-11 pl-11"
        placeholder="Поиск шаблонов: море, свадьба, плёнка…"
        aria-label="Поиск шаблонов"
      />
    </form>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="animate-fade-in absolute inset-0 bg-[var(--scrim)]" onClick={onClose} />
      <div className="animate-pop-in absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col bg-bg shadow-float">
        <div className="flex h-16 shrink-0 items-center justify-between pl-5 pr-3">
          <Logo />
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть меню">
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SidebarContent compact={false} onNavigate={onClose} />
        </div>
      </div>
    </div>
  )
}

function BottomNav() {
  const pathname = usePathname()
  const items = [
    { href: "/", label: "Главная", icon: House },
    { href: "/templates", label: "Шаблоны", icon: LayoutTemplate },
    { href: "/projects", label: "Проекты", icon: FolderHeart },
    { href: "/favorites", label: "Избранное", icon: Heart },
  ]
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Мобильная навигация"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`flex w-16 flex-col items-center gap-1 text-[11px] font-semibold ${
              isActive(pathname, it.href) ? "text-ink" : "text-faint"
            }`}
          >
            <it.icon size={21} strokeWidth={isActive(pathname, it.href) ? 2.2 : 1.8} />
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false)

  return (
    <>
      <div className="flex min-h-dvh">
        <Suspense fallback={<div className="hidden w-[76px] shrink-0 md:block lg:w-[272px]" />}>
          <Sidebar />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* desktop / tablet header */}
          <header className="sticky top-0 z-30 hidden h-[72px] items-center gap-4 border-b border-transparent bg-bg/90 px-6 backdrop-blur md:flex lg:px-10">
            <HeaderSearch className="w-full max-w-md" />
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <Suspense fallback={<span className="skeleton ml-1 size-9 rounded-full" />}>
                <HeaderUser />
              </Suspense>
            </div>
          </header>
          {/* mobile header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-bg/95 px-3 backdrop-blur md:hidden">
            <button className="icon-btn" onClick={() => setDrawer(true)} aria-label="Открыть меню">
              <Menu size={20} />
            </button>
            <Logo />
            <div className="ml-auto flex items-center">
              <Link href="/templates" className="icon-btn" aria-label="Поиск">
                <Search size={19} />
              </Link>
              <ThemeToggle />
              <Suspense fallback={<span className="skeleton mx-1 size-8 rounded-full" />}>
                <MobileHeaderUser />
              </Suspense>
            </div>
          </header>
          {/* a size container: pages lay out by the width left beside the sidebar (@-variants), not the window's */}
          <main className="@container flex-1 pb-28 md:pb-16">{children}</main>
        </div>
      </div>
      <Suspense>
        <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
        <BottomNav />
      </Suspense>
    </>
  )
}
