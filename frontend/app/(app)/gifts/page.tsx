import type { Metadata } from "next"
import { GiftsPage } from "@/src/components/pages/GiftsPage"

export const metadata: Metadata = { title: "Мои подарки" }

export default function Page() {
  return <GiftsPage />
}
