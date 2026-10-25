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
import { cx } from "@/src/lib/cx"
import { HeaderUser, MobileHeaderUser, SidebarUser } from "./UserMenu"
import s from "./AppShell.module.css"

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
    <div className={s.content}>
      <nav className={s.nav} aria-label="Основная навигация">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          const count = href === "/favorites" ? favorites.length : href === "/trash" ? trashedProjects.length : 0
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={compact ? label : undefined}
              className={cx(s.navLink, active && s.active, compact && s.centered)}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className={active ? s.accent : ""} />
              {!compact ? (
                <>
                  <span className={s.grow}>{label}</span>
                  {count ? <span className={s.count}>{count}</span> : null}
                </>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className={`scrollbar-thin ${s.cats}`}>
        {!compact ? <p className={`eyebrow ${s.catsEyebrow}`}>Категории</p> : <div className={s.catsRule} />}
        <ul className={s.catList}>
          {CATEGORIES.map((c) => {
            const href = `/category/${c.slug}`
            const active = pathname === href
            return (
              <li key={c.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  title={compact ? c.name : undefined}
                  className={cx(s.catLink, active && s.active, compact && s.centered)}
                >
                  {compact ? (
                    <span className={s.catIcon}>
                      <CategoryIcon icon={c.icon} size={17} strokeWidth={1.8} className={active ? s.accent : ""} />
                    </span>
                  ) : (
                    <>
                      <span className={s.catThumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo(c.cover, 96)} alt="" className={s.cover} loading="lazy" />
                      </span>
                      <span className={s.catName}>{c.name}</span>
                      <CategoryIcon icon={c.icon} size={14} className={s.faint} />
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className={s.user}>
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
    <aside className={cx(s.sidebar, compact && s.sidebarCompact)}>
      <div className={s.sidebarHead}>
        <Logo compact={compact} />
        {!compact ? (
          <button className={`icon-btn ${s.mutedBtn}`} onClick={() => setSidebarCollapsed(true)} aria-label="Свернуть меню">
            <PanelLeftClose size={18} />
          </button>
        ) : null}
      </div>
      {compact && desktop ? (
        <button className={`icon-btn ${s.mutedBtn} ${s.expand}`} onClick={() => setSidebarCollapsed(false)} aria-label="Развернуть меню">
          <PanelLeftOpen size={18} />
        </button>
      ) : null}
      <div className={s.fill}>
        <SidebarContent compact={compact} />
      </div>
    </aside>
  )
}

function HeaderSearch() {
  const router = useRouter()
  const [q, setQ] = useState("")
  return (
    <form
      role="search"
      className={s.search}
      onSubmit={(e) => {
        e.preventDefault()
        router.push(q.trim() ? `/templates?q=${encodeURIComponent(q.trim())}` : "/templates")
      }}
    >
      <Search size={17} className={s.searchIcon} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className={`input ${s.searchInput}`}
        placeholder="Поиск шаблонов: море, свадьба, плёнка…"
        aria-label="Поиск шаблонов"
      />
    </form>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className={s.drawer}>
      <div className={`animate-fade-in ${s.scrim}`} onClick={onClose} />
      <div className={`animate-pop-in ${s.drawerPanel}`}>
        <div className={s.drawerHead}>
          <Logo />
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть меню">
            <X size={20} />
          </button>
        </div>
        <div className={s.fill}>
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
    <nav className={s.bottomNav} aria-label="Мобильная навигация">
      <div className={s.bottomInner}>
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={cx(s.bottomLink, isActive(pathname, it.href) && s.bottomActive)}>
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
      <div className={s.shell}>
        <Suspense fallback={<div className={s.sidebarFallback} />}>
          <Sidebar />
        </Suspense>
        <div className={s.column}>
          {/* desktop / tablet header */}
          <header className={s.desktopHeader}>
            <HeaderSearch />
            <div className={s.actions}>
              <ThemeToggle />
              <Suspense fallback={<span className={`skeleton ${s.avatarSkeleton}`} />}>
                <HeaderUser />
              </Suspense>
            </div>
          </header>
          {/* mobile header */}
          <header className={s.mobileHeader}>
            <button className="icon-btn" onClick={() => setDrawer(true)} aria-label="Открыть меню">
              <Menu size={20} />
            </button>
            <Logo />
            <div className={s.mobileActions}>
              <Link href="/templates" className="icon-btn" aria-label="Поиск">
                <Search size={19} />
              </Link>
              <ThemeToggle />
              <Suspense fallback={<span className={`skeleton ${s.mobileAvatarSkeleton}`} />}>
                <MobileHeaderUser />
              </Suspense>
            </div>
          </header>
          <main className={s.main}>{children}</main>
        </div>
      </div>
      <Suspense>
        <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
        <BottomNav />
      </Suspense>
    </>
  )
}
