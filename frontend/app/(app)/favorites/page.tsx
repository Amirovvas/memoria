import type { Metadata } from "next"
import { FavoritesPage } from "@/src/components/pages/FavoritesPage"

export const metadata: Metadata = { title: "Избранное" }

export default function Page() {
  return <FavoritesPage />
}
