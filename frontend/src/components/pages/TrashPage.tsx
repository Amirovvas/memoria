"use client"

import { RotateCcw, Trash2, X } from "lucide-react"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState, TimeAgo } from "../ui/bits"
import page from "./page.module.css"
import s from "./TrashPage.module.css"

export function TrashPage() {
  const { trashedProjects, restoreProject, deleteProject, emptyTrash } = useApp()

  return (
    <div className={page.page}>
      <header className={`${page.header} ${page.headerLoose}`}>
        <div>
          <p className="eyebrow">Библиотека</p>
          <h1 className={`display ${page.title}`}>Корзина</h1>
          <p className={page.lead}>Проекты хранятся здесь 30 дней, потом удаляются навсегда.</p>
        </div>
        {trashedProjects.length ? (
          <button className="btn btn-secondary" onClick={emptyTrash}>
            <Trash2 size={16} /> Очистить корзину
          </button>
        ) : null}
      </header>

      {trashedProjects.length === 0 ? (
        <EmptyState art={<EmptyArt icon={<Trash2 size={26} />} />} title="Корзина пуста" text="Удалённые проекты появятся здесь — их можно будет восстановить." />
      ) : (
        <div className={page.grid}>
          {trashedProjects.map((p) => (
            <article key={p.id} className="animate-fade-up">
              <div className={s.thumb}>
                <div className={s.collage}>
                  <CollageCanvas doc={p.doc} imgWidth={360} className={s.canvas} />
                </div>
              </div>
              <h3 className={s.name}>{p.name}</h3>
              <p className={s.date}>
                Удалён <TimeAgo ts={p.deletedAt!} />
              </p>
              <div className={s.actions}>
                <button className={`btn btn-sm btn-secondary ${s.restore}`} onClick={() => restoreProject(p.id)}>
                  <RotateCcw size={14} /> Восстановить
                </button>
                <button className={`icon-btn ${s.delete}`} onClick={() => deleteProject(p.id)} aria-label="Удалить навсегда" title="Удалить навсегда">
                  <X size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
