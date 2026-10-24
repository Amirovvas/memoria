import type { Metadata } from "next"
import { Suspense } from "react"
import { FormSkeleton } from "@/src/components/auth/FormSkeleton"
import { RegisterForm } from "@/src/components/auth/RegisterForm"

export const metadata: Metadata = { title: "Регистрация" }

export default function Page() {
  return (
    <Suspense fallback={<FormSkeleton fields={3} />}>
      <RegisterForm />
    </Suspense>
  )
}
