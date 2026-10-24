import type { Metadata } from "next"
import { TrashPage } from "@/src/components/pages/TrashPage"

export const metadata: Metadata = { title: "Корзина" }

export default function Page() {
  return <TrashPage />
}
