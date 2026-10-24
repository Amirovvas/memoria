"use client"

import { RotateCcw, Trash2, X } from "lucide-react"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState, TimeAgo } from "../ui/bits"

export function TrashPage() {
  const { trashedProjects, restoreProject, deleteProject, emptyTrash } = useApp()

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-8 pt-4">
        <div>
          <p className="eyebrow">Библиотека</p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">Корзина</h1>
          <p className="mt-2 text-[15px] text-muted">Проекты хранятся здесь 30 дней, потом удаляются навсегда.</p>
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5">
          {trashedProjects.map((p) => (
            <article key={p.id} className="animate-fade-up">
              <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-2 p-[9%] opacity-70 ring-1 ring-line grayscale-[40%]">
                <div className="w-full">
                  <CollageCanvas doc={p.doc} imgWidth={360} className="shadow-card" />
                </div>
              </div>
              <h3 className="mt-3 truncate text-[15px] font-semibold">{p.name}</h3>
              <p className="text-[13px] text-muted">
                Удалён <TimeAgo ts={p.deletedAt!} />
              </p>
              <div className="mt-3 flex gap-2">
                <button className="btn btn-sm btn-secondary flex-1" onClick={() => restoreProject(p.id)}>
                  <RotateCcw size={14} /> Восстановить
                </button>
                <button className="icon-btn size-[2.125rem] text-muted" onClick={() => deleteProject(p.id)} aria-label="Удалить навсегда" title="Удалить навсегда">
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
