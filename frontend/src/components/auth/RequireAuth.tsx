"use client"

import { RotateCw, WifiOff } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { useUser } from "@/src/hooks/useAuth"
import { Logo } from "../ui/bits"

/** Full-screen placeholder while the session is being checked. */
export function AuthSplash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg">
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
      <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div className="animate-fade-up max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
            <WifiOff size={24} />
          </span>
          <h1 className="display mt-5 text-4xl">Сервер недоступен</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Не получилось проверить вход. Проверьте интернет и попробуйте ещё раз.</p>
          <button className="btn btn-primary mt-6" onClick={() => refetch()} disabled={isFetching}>
            <RotateCw size={16} className={isFetching ? "animate-spin" : ""} /> Повторить
          </button>
        </div>
      </div>
    )
  }

  return <AuthSplash />
}
