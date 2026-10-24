import type { Metadata } from "next"
import { Suspense } from "react"
import { FormSkeleton } from "@/src/components/auth/FormSkeleton"
import { LoginForm } from "@/src/components/auth/LoginForm"

export const metadata: Metadata = { title: "Вход" }

export default function Page() {
  return (
    <Suspense fallback={<FormSkeleton fields={2} />}>
      <LoginForm />
    </Suspense>
  )
}
