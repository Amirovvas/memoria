"use client"

import { Heart } from "lucide-react"
import Link from "next/link"
import { EDITORS_TEMPLATES, TEMPLATE_BY_ID } from "@/src/lib/catalog"
import { useApp } from "../providers/AppProvider"
import { TemplateGrid } from "../templates/TemplateGrid"
import { EmptyState, SectionHeader, plural } from "../ui/bits"
import page from "./page.module.css"
import s from "./FavoritesPage.module.css"

function HeartArt() {
  return (
    <div className={s.art}>
      <div className={`${s.polaroid} ${s.left}`}>
        <div className={s.photo} />
      </div>
      <div className={`${s.polaroid} ${s.right}`}>
        <div className={`${s.photo} ${s.photoAlt}`} />
      </div>
      <div className={`${s.polaroid} ${s.center}`}>
        <div className={`${s.photo} ${s.photoHeart}`}>
          <Heart size={30} className={`animate-float ${s.heart}`} />
        </div>
      </div>
      <span className={s.caption}>сохраню на потом</span>
    </div>
  )
}

export function FavoritesPage() {
  const { favorites } = useApp()
  const list = favorites.map((id) => TEMPLATE_BY_ID[id]).filter(Boolean)

  return (
    <div className={page.page}>
      <header className={s.header}>
        <p className="eyebrow">Сохранённое</p>
        <h1 className={`display ${page.title}`}>Избранное</h1>
        <p className={page.lead}>
          {list.length
            ? `${list.length} ${plural(list.length, "шаблон", "шаблона", "шаблонов")} — нажмите на сердце, чтобы убрать`
            : "Шаблоны, которые вам понравились"}
        </p>
      </header>

      {list.length ? (
        <TemplateGrid templates={list} showCategory />
      ) : (
        <>
          <EmptyState
            art={<HeartArt />}
            title="Пока здесь пусто"
            text="Нажимайте ♡ на шаблонах, которые нравятся, — они соберутся здесь, и к ним будет легко вернуться."
            action={
              <Link href="/templates" className="btn btn-accent">
                Найти шаблоны
              </Link>
            }
          />
          <section className={s.picks}>
            <SectionHeader eyebrow="Для вдохновения" title="Выбор редакции" />
            <TemplateGrid templates={EDITORS_TEMPLATES} showCategory />
          </section>
        </>
      )}
    </div>
  )
}
