"use client"

import type { Template } from "@/src/lib/catalog"
import { TemplateCard, TemplateCardSkeleton } from "./TemplateCard"

/** Pinterest-like masonry of template cards; a click opens the template in the editor. */
export function TemplateGrid({
  templates,
  loading,
  showCategory,
  // by the content width beside the sidebar (main is the size container)
  columns = "columns-2 @3xl:columns-3 @6xl:columns-4 @[110rem]:columns-5",
}: {
  templates: Template[]
  loading?: boolean
  showCategory?: boolean
  columns?: string
}) {
  return (
    <div className={`${columns} gap-4 sm:gap-6`}>
      {loading
        ? Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="mb-6 break-inside-avoid">
              <TemplateCardSkeleton tall={i % 3 === 1} />
            </div>
          ))
        : templates.map((t) => (
            <div key={t.id} className="mb-6 break-inside-avoid sm:mb-8">
              <TemplateCard template={t} showCategory={showCategory} />
            </div>
          ))}
    </div>
  )
}
