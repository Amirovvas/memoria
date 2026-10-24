import { Suspense } from "react"
import { AuthSplash, RequireAuth } from "@/src/components/auth/RequireAuth"
import { AppShell } from "@/src/components/shell/AppShell"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<AuthSplash />}>
      <RequireAuth>
        <AppShell>{children}</AppShell>
      </RequireAuth>
    </Suspense>
  )
}
