"use client"

import { Heart, PenLine, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { memo, useCallback } from "react"
import { CATEGORY_BY_SLUG, templateDoc, type Template } from "@/src/lib/catalog"
import { STYLES } from "@/src/lib/collage/styles"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp } from "../providers/AppProvider"
import { cx } from "@/src/lib/cx"
import s from "./TemplateCard.module.css"

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

/** `overlay` sits on top of a picture; `plain` sits in a row of text next to the title. `className` may change the size. */
export function FavoriteButton({
  id,
  className = "",
  tone = "overlay",
}: {
  id: string
  className?: string
  tone?: "overlay" | "plain"
}) {
  const { isFavorite, toggleFavorite } = useApp()
  const on = isFavorite(id)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite(id)
      }}
      className={cx(s.favorite, tone === "overlay" ? s.overlay : s.plain, on && s.on, className)}
      aria-label={on ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={on}
      title={on ? "В избранном" : "В избранное"}
    >
      <Heart size={17} className={on ? s.heartOn : ""} />
    </button>
  )
}

// a grid re-places its cards on every resize and filter; cards whose template did not change stay as they are
export const TemplateCard = memo(function TemplateCard({
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
    <article className={`animate-fade-up ${s.card}`}>
      {/* a div, not a <button>: the collage inside is block content */}
      <div
        role="button"
        tabIndex={0}
        className={s.frame}
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

        <div className={s.badges}>
          {t.editorsPick ? (
            <span className={`${s.badge} ${s.pick}`} title="Выбор редакции">
              <Sparkles size={11} />
              <span className={s.pickLabel}>Выбор редакции</span>
            </span>
          ) : t.isNew ? (
            <span className={`${s.badge} ${s.isNew}`}>Новинка</span>
          ) : null}
          {t.premium ? <span className={`${s.badge} ${s.pro}`}>Pro</span> : null}
        </div>

        <span className={s.hoverLayer} aria-hidden>
          <span className={`btn btn-sm btn-accent ${s.hoverButton}`}>
            <PenLine size={15} /> Редактировать
          </span>
        </span>
      </div>

      <div className={s.meta}>
        <div className={s.minW0}>
          <h3 className={s.title}>{t.title}</h3>
          <p className={s.sub}>
            {showCategory ? `${CATEGORY_BY_SLUG[t.category].short} · ` : ""}
            {t.slots} фото · {STYLES[t.style].name}
          </p>
        </div>
        <FavoriteButton id={t.id} tone="plain" className={s.cardFavorite} />
      </div>
    </article>
  )
})
