import type { Metadata } from "next"
import { SettingsPage } from "@/src/components/pages/SettingsPage"

export const metadata: Metadata = { title: "Настройки" }

export default function Page() {
  return <SettingsPage />
}
