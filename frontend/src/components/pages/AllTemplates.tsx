"use client"

import { useSearchParams } from "next/navigation"
import { COLLECTIONS } from "@/src/lib/catalog"
import { TemplateGallery } from "../templates/TemplateGallery"

export function AllTemplates() {
  const params = useSearchParams()
  const q = params.get("q") ?? ""
  const collection = COLLECTIONS.find((c) => c.id === params.get("collection"))
  return <TemplateGallery key={`${q}|${collection?.id ?? ""}`} initialQuery={q} collection={collection} />
}
