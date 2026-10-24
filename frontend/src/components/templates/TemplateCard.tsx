"use client"

import { Heart, PenLine, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { CATEGORY_BY_SLUG, templateDoc, type Template } from "@/src/lib/catalog"
import { STYLES } from "@/src/lib/collage/styles"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp } from "../providers/AppProvider"

export function useOpenTemplate() {
  const router = useRouter()
  const { createFromTemplate } = useApp()
  return useCallback(
    (templateId: string) => {
      const id = createFromTemplate(templateId)
      router.push(`/editor?project=${id}`)
    },
    [createFromTemplate, router],
  )
}

/** `overlay` sits on top of a picture; `plain` sits in a row of text next to the title. */
export function FavoriteButton({
  id,
  className = "",
  size = "size-9",
  tone = "overlay",
}: {
  id: string
  className?: string
  size?: string
  tone?: "overlay" | "plain"
}) {
  const { isFavorite, toggleFavorite } = useApp()
  const on = isFavorite(id)
  const look =
    tone === "overlay"
      ? "bg-white/90 text-[#2a241d] shadow-soft backdrop-blur hover:scale-105"
      : `border transition-colors ${on ? "border-accent/30 bg-accent-soft" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"}`
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite(id)
      }}
      className={`grid ${size} shrink-0 place-items-center rounded-full transition-all active:scale-90 ${look} ${className}`}
      aria-label={on ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={on}
      title={on ? "В избранном" : "В избранное"}
    >
      <Heart size={17} className={on ? "fill-accent text-accent" : ""} />
    </button>
  )
}

export function TemplateCard({
  template: t,
  showCategory,
  imgWidth = 480,
}: {
  template: Template
  showCategory?: boolean
  imgWidth?: number
}) {
  const open = useOpenTemplate()

  // its own size container: phone-width cards get compact badges and a smaller heart
  return (
    <article className="group animate-fade-up @container/card">
      {/* a div, not a <button>: the collage inside is block content */}
      <div
        role="button"
        tabIndex={0}
        className="relative cursor-pointer overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
        onClick={() => open(t.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            open(t.id)
          }
        }}
        aria-label={`Редактировать шаблон «${t.title}»`}
      >
        <CollageCanvas doc={templateDoc(t)} imgWidth={imgWidth} />

        <div className="pointer-events-none absolute left-2 top-2 flex gap-1 @[13rem]/card:left-3 @[13rem]/card:top-3 @[13rem]/card:gap-1.5">
          {t.editorsPick ? (
            <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-1 text-[11px] font-semibold text-bg @[13rem]/card:px-2.5" title="Выбор редакции">
              <Sparkles size={11} />
              <span className="sr-only @[13rem]/card:not-sr-only">Выбор редакции</span>
            </span>
          ) : t.isNew ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#2a241d]">Новинка</span>
          ) : null}
          {t.premium ? <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-ink">Pro</span> : null}
        </div>

        <span
          className="pointer-events-none absolute inset-0 hidden items-end justify-center bg-black/0 p-4 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100 lg:flex"
          aria-hidden
        >
          <span className="btn btn-sm btn-accent translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
            <PenLine size={15} /> Редактировать
          </span>
        </span>
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5 @[13rem]/card:mt-3 @[13rem]/card:gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold @[13rem]/card:text-[15px]">{t.title}</h3>
          <p className="mt-0.5 truncate text-[12px] text-muted @[13rem]/card:text-[13px]">
            {showCategory ? `${CATEGORY_BY_SLUG[t.category].short} · ` : ""}
            {t.slots} фото · {STYLES[t.style].name}
          </p>
        </div>
        <FavoriteButton id={t.id} tone="plain" size="size-8 @[13rem]/card:size-9" />
      </div>
    </article>
  )
}

export function TemplateCardSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div>
      <div className={`skeleton rounded-2xl ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`} />
      <div className="skeleton mt-3 h-4 w-2/3 rounded-full" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded-full" />
    </div>
  )
}
