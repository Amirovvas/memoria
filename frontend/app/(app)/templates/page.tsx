import type { Metadata } from "next"
import { Suspense } from "react"
import { AllTemplates } from "@/src/components/pages/AllTemplates"

export const metadata: Metadata = { title: "Все шаблоны" }

export default function Page() {
  return (
    <Suspense>
      <AllTemplates />
    </Suspense>
  )
}
