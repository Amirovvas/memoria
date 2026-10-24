"use client"

import { Heart } from "lucide-react"
import Link from "next/link"
import { EDITORS_TEMPLATES, TEMPLATE_BY_ID } from "@/src/lib/catalog"
import { useApp } from "../providers/AppProvider"
import { TemplateGrid } from "../templates/TemplateGrid"
import { EmptyState, SectionHeader, plural } from "../ui/bits"

function HeartArt() {
  return (
    <div className="relative h-40 w-56">
      <div className="absolute left-4 top-6 h-28 w-24 -rotate-12 rounded-sm border border-line bg-surface p-2 pb-6 shadow-card">
        <div className="h-full w-full rounded-[2px] bg-surface-2" />
      </div>
      <div className="absolute right-4 top-6 h-28 w-24 rotate-12 rounded-sm border border-line bg-surface p-2 pb-6 shadow-card">
        <div className="h-full w-full rounded-[2px] bg-surface-3" />
      </div>
      <div className="absolute left-1/2 top-0 grid h-32 w-28 -translate-x-1/2 place-items-center rounded-sm border border-line bg-surface p-2 pb-7 shadow-card">
        <div className="grid h-full w-full place-items-center rounded-[2px] bg-accent-soft">
          <Heart size={30} className="animate-float fill-accent text-accent" />
        </div>
      </div>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 -rotate-3 font-hand text-xl text-muted">сохраню на потом</span>
    </div>
  )
}

export function FavoritesPage() {
  const { favorites } = useApp()
  const list = favorites.map((id) => TEMPLATE_BY_ID[id]).filter(Boolean)

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-10">
      <header className="pb-8 pt-4">
        <p className="eyebrow">Сохранённое</p>
        <h1 className="display mt-2 text-5xl sm:text-6xl">Избранное</h1>
        <p className="mt-2 text-[15px] text-muted">
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
          <section className="mt-10">
            <SectionHeader eyebrow="Для вдохновения" title="Выбор редакции" />
            <TemplateGrid templates={EDITORS_TEMPLATES} showCategory />
          </section>
        </>
      )}
    </div>
  )
}
