"use client"

import { FolderOpen, LayoutTemplate, Search, SearchX, Trash2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { CATEGORY_BY_SLUG } from "@/src/lib/catalog"
import { ProjectCard } from "../projects/ProjectCard"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState, plural } from "../ui/bits"
import { SelectChip } from "../ui/Menu"
import { Modal } from "../ui/Modal"
import page from "./page.module.css"
import s from "./ProjectsPage.module.css"

type Sort = "updated" | "created" | "name"

export function ProjectsPage() {
  const { activeProjects, trashedProjects, trashAllProjects, toast } = useApp()
  const [confirmAll, setConfirmAll] = useState(false)
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
    <div className={page.page}>
      <header className={page.header}>
        <div>
          <p className="eyebrow">Библиотека</p>
          <h1 className={`display ${page.title}`}>Мои проекты</h1>
          <p className={page.lead}>
            {activeProjects.length} {plural(activeProjects.length, "коллаж", "коллажа", "коллажей")} · автосохранение включено
          </p>
        </div>
        <div className={s.headerActions}>
          {activeProjects.length ? (
            <button className={`btn btn-lg btn-ghost ${s.trashAll}`} onClick={() => setConfirmAll(true)}>
              <Trash2 size={18} /> Удалить все
            </button>
          ) : null}
          <Link href="/templates" className="btn btn-lg btn-secondary">
            <LayoutTemplate size={18} /> Шаблоны
          </Link>
        </div>
      </header>

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)} label="Удалить все проекты" className={s.dialog}>
        <div className={s.dialogBody}>
          <h2 className={`display ${s.dialogTitle}`}>Удалить все проекты?</h2>
          <p className={s.dialogText}>
            {activeProjects.length} {plural(activeProjects.length, "коллаж", "коллажа", "коллажей")} попадут в корзину. Оттуда их
            можно восстановить, пока корзина не очищена.
          </p>
          <div className={s.dialogActions}>
            <button className="btn btn-ghost" onClick={() => setConfirmAll(false)}>
              Отмена
            </button>
            <button
              className="btn btn-accent"
              onClick={() => {
                const n = trashAllProjects()
                setConfirmAll(false)
                if (n) toast(`${n} ${plural(n, "проект перемещён", "проекта перемещены", "проектов перемещены")} в корзину`)
              }}
            >
              <Trash2 size={16} /> Удалить все
            </button>
          </div>
        </div>
      </Modal>

      <div className={page.toolbar}>
        <div className={page.toolbarRow}>
          <div className={s.search}>
            <Search size={16} className={page.searchIcon} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию"
              className={`input ${page.searchInput}`}
              aria-label="Поиск по названию"
            />
          </div>
          <div className={`scrollbar-none ${s.types}`}>
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
        <div className={`${page.grid} ${s.list}`}>
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {trashedProjects.length ? (
        <p className={page.footnote}>
          В корзине {trashedProjects.length} {plural(trashedProjects.length, "проект", "проекта", "проектов")} ·{" "}
          <Link href="/trash" className={page.link}>
            Открыть корзину
          </Link>
        </p>
      ) : null}
    </div>
  )
}
