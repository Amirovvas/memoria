"use client"

import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useLogout } from "@/src/hooks/useLogout"
import { useUser } from "@/src/hooks/useUser"
import type { User } from "@/src/lib/api"
import { useApp } from "../providers/AppProvider"
import { MenuItem, Popover } from "../ui/Menu"
import s from "./UserMenu.module.css"

/** `className` sets the size and font size; small by default. */
export function Avatar({ user, className = s.avatarSm }: { user: User; className?: string }) {
  return (
    <span className={`${s.avatar} ${className}`} aria-hidden>
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
    <div className={`${s.sidebarUser} ${compact ? s.stacked : ""}`}>
      <Link
        href="/settings"
        onClick={onNavigate}
        className={`${s.userLink} ${compact ? s.centered : ""}`}
        title={compact ? user.name : undefined}
      >
        <Avatar user={user} />
        {!compact ? (
          <span className={s.userText}>
            <span className={`${s.truncate} ${s.userName}`}>{user.name}</span>
            <span className={`${s.truncate} ${s.userEmail}`}>{user.email}</span>
          </span>
        ) : null}
      </Link>
      <button className={`icon-btn ${s.signOut}`} onClick={signOut} aria-label="Выйти" title="Выйти">
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
      className={s.menu}
      trigger={({ toggle, open }) => (
        <button className={s.trigger} onClick={toggle} aria-expanded={open} aria-label="Меню аккаунта">
          <Avatar user={user} className={s.avatarMd} />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className={s.menuHead}>
            <Avatar user={user} className={s.avatarLg} />
            <div className={s.minW0}>
              <p className={`${s.truncate} ${s.menuName}`}>{user.name}</p>
              <p className={`${s.truncate} ${s.menuEmail}`}>{user.email}</p>
            </div>
          </div>
          <div className={s.separator} />
          <Link href="/settings" onClick={close} className={s.menuLink}>
            <Settings size={16} className={s.menuIcon} /> Настройки
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
    <Link href="/settings" className={s.mobileLink} aria-label="Аккаунт">
      <Avatar user={user} />
    </Link>
  )
}
