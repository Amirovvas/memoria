import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthSplash, RequireAuth } from "@/src/components/auth/RequireAuth"
import { EditorRoute } from "@/src/components/editor/EditorRoute"

export const metadata: Metadata = { title: "Редактор" }

export default function Page() {
  return (
    <Suspense fallback={<AuthSplash />}>
      <RequireAuth>
        <EditorRoute />
      </RequireAuth>
    </Suspense>
  )
}
