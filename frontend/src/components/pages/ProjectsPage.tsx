"use client"

import { FolderOpen, LayoutTemplate, Search, SearchX } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { CATEGORY_BY_SLUG } from "@/src/lib/catalog"
import { ProjectCard } from "../projects/ProjectCard"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState, plural } from "../ui/bits"
import { SelectChip } from "../ui/Menu"

type Sort = "updated" | "created" | "name"

export function ProjectsPage() {
  const { activeProjects, trashedProjects } = useApp()
  const [q, setQ] = useState("")
  const [type, setType] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>("updated")

  const types = useMemo(() => [...new Set(activeProjects.map((p) => p.category))], [activeProjects])
  const list = useMemo(() => {
    const out = activeProjects.filter(
      (p) => (!type || p.category === type) && (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())),
    )
    if (sort === "name") return [...out].sort((a, b) => a.name.localeCompare(b.name, "ru"))
    if (sort === "created") return [...out].sort((a, b) => b.createdAt - a.createdAt)
    return out
  }, [activeProjects, q, type, sort])

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6 pt-4">
        <div>
          <p className="eyebrow">Библиотека</p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">Мои проекты</h1>
          <p className="mt-2 text-[15px] text-muted">
            {activeProjects.length} {plural(activeProjects.length, "коллаж", "коллажа", "коллажей")} · автосохранение включено
          </p>
        </div>
        <Link href="/templates" className="btn btn-lg btn-secondary">
          <LayoutTemplate size={18} /> Шаблоны
        </Link>
      </header>

      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-[72px] lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию"
              className="input pl-10"
              aria-label="Поиск по названию"
            />
          </div>
          {/* own full-bleed row on phones, so the sort chip never covers it */}
          <div className="-mx-4 flex w-[calc(100%+2rem)] scroll-px-4 gap-2 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:w-auto sm:flex-1 sm:px-0">
            <button className="chip" data-active={!type ? "true" : undefined} onClick={() => setType(null)}>
              Все
            </button>
            {types.map((t) => (
              <button key={t} className="chip" data-active={type === t ? "true" : undefined} onClick={() => setType(t)}>
                {CATEGORY_BY_SLUG[t]?.short ?? t}
              </button>
            ))}
          </div>
          <SelectChip
            label="Сортировка"
            value={sort}
            onChange={(v) => setSort(v ?? "updated")}
            allLabel="Недавно изменённые"
            options={[
              { value: "updated", label: "Недавно изменённые" },
              { value: "created", label: "Недавно созданные" },
              { value: "name", label: "По названию" },
            ]}
          />
        </div>
      </div>

      {activeProjects.length === 0 ? (
        <EmptyState
          art={<EmptyArt icon={<FolderOpen size={26} />} />}
          title="Здесь появятся ваши коллажи"
          text="Выберите категорию слева и откройте понравившийся шаблон — проект сохранится автоматически."
          action={
            <Link href="/templates" className="btn btn-accent">
              Смотреть шаблоны
            </Link>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          art={<EmptyArt icon={<SearchX size={26} />} />}
          title="Ничего не нашлось"
          text="Попробуйте другое название или сбросьте фильтр по типу."
          action={
            <button
              className="btn btn-primary"
              onClick={() => {
                setQ("")
                setType(null)
              }}
            >
              Сбросить
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-6 sm:gap-x-6 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {trashedProjects.length ? (
        <p className="mt-12 text-center text-sm text-muted">
          В корзине {trashedProjects.length} {plural(trashedProjects.length, "проект", "проекта", "проектов")} ·{" "}
          <Link href="/trash" className="font-semibold text-ink hover:text-accent">
            Открыть корзину
          </Link>
        </p>
      ) : null}
    </div>
  )
}
