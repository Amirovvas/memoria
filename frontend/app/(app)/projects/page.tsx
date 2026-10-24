import type { Metadata } from "next"
import { ProjectsPage } from "@/src/components/pages/ProjectsPage"

export const metadata: Metadata = { title: "Мои проекты" }

export default function Page() {
  return <ProjectsPage />
}
