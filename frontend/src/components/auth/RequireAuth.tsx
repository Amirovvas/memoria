"use client"

import { RotateCw, WifiOff } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { useUser } from "@/src/hooks/useUser"
import { Logo } from "../ui/bits"
import s from "./RequireAuth.module.css"

/** Full-screen placeholder while the session is being checked. */
export function AuthSplash() {
  return (
    <div className={s.screen}>
      <div className="animate-pulse">
        <Logo />
      </div>
    </div>
  )
}

/**
 * Renders its children only for a signed-in user. proxy.ts already turns away visitors without a cookie;
 * this catches a cookie that has expired or was revoked, and a logout on this page.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user, isPending, isError, refetch, isFetching } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams().toString()

  const signedOut = !isPending && !isError && !user
  useEffect(() => {
    if (!signedOut) return
    const next = pathname + (search ? `?${search}` : "")
    router.replace(next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`)
  }, [signedOut, pathname, search, router])

  if (user) return children

  if (isError) {
    return (
      <div className={`${s.screen} ${s.error}`}>
        <div className={`animate-fade-up ${s.box}`}>
          <span className={s.icon}>
            <WifiOff size={24} />
          </span>
          <h1 className={`display ${s.title}`}>Сервер недоступен</h1>
          <p className={s.text}>Не получилось проверить вход. Проверьте интернет и попробуйте ещё раз.</p>
          <button className={`btn btn-primary ${s.retry}`} onClick={() => refetch()} disabled={isFetching}>
            <RotateCw size={16} className={isFetching ? "animate-spin" : ""} /> Повторить
          </button>
        </div>
      </div>
    )
  }

  return <AuthSplash />
}
