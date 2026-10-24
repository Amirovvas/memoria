"use client"

import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useLogout, useUser } from "@/src/hooks/useAuth"
import type { User } from "@/src/lib/api"
import { useApp } from "../providers/AppProvider"
import { MenuItem, Popover } from "../ui/Menu"

export function Avatar({ user, className = "size-8 text-base" }: { user: User; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-sage-soft font-serif font-semibold uppercase text-sage ${className}`}
      aria-hidden
    >
      {user.name.trim().charAt(0) || "?"}
    </span>
  )
}

/** Signing out clears the session; RequireAuth then sends the page to /login. */
export function useSignOut() {
  const logout = useLogout()
  const { toast } = useApp()
  return () => logout.mutate(undefined, { onSettled: () => toast("Вы вышли из аккаунта") })
}

/** Bottom of the sidebar. The app shell renders only for a signed-in user, so `user` is always there. */
export function SidebarUser({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  const { data: user } = useUser()
  const signOut = useSignOut()
  if (!user) return null

  return (
    <div className={`flex items-center gap-1 ${compact ? "flex-col" : ""}`}>
      <Link
        href="/settings"
        onClick={onNavigate}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-surface-2 ${compact ? "justify-center" : ""}`}
        title={compact ? user.name : undefined}
      >
        <Avatar user={user} />
        {!compact ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold">{user.name}</span>
            <span className="block truncate text-xs text-muted">{user.email}</span>
          </span>
        ) : null}
      </Link>
      <button className="icon-btn text-muted hover:text-ink" onClick={signOut} aria-label="Выйти" title="Выйти">
        <LogOut size={17} />
      </button>
    </div>
  )
}

/** Top-right of the desktop header: avatar with an account menu. */
export function HeaderUser() {
  const { data: user } = useUser()
  const signOut = useSignOut()
  if (!user) return null

  return (
    <Popover
      align="right"
      className="w-64"
      trigger={({ toggle, open }) => (
        <button
          className="ml-1 rounded-full ring-offset-2 ring-offset-bg transition-shadow hover:ring-2 hover:ring-line-strong"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Меню аккаунта"
        >
          <Avatar user={user} className="size-9 text-lg" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center gap-3 px-3 pb-3 pt-2">
            <Avatar user={user} className="size-10 text-xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <div className="mb-1 h-px bg-line" />
          <Link
            href="/settings"
            onClick={close}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            <Settings size={16} className="text-muted" /> Настройки
          </Link>
          <MenuItem
            danger
            icon={<LogOut />}
            onClick={() => {
              close()
              signOut()
            }}
          >
            Выйти
          </MenuItem>
        </>
      )}
    </Popover>
  )
}

/** Mobile header: avatar linking to the account settings. */
export function MobileHeaderUser() {
  const { data: user } = useUser()
  if (!user) return null
  return (
    <Link href="/settings" className="mx-1 rounded-full" aria-label="Аккаунт">
      <Avatar user={user} />
    </Link>
  )
}
