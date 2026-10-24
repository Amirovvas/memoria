"use client"

import { Copy, Ellipsis, PenLine, TextCursorInput, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CATEGORY_BY_SLUG } from "@/src/lib/catalog"
import { emptySlotCount } from "@/src/lib/collage/build"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp, type Project } from "../providers/AppProvider"
import { TimeAgo } from "../ui/bits"
import { MenuItem, Popover } from "../ui/Menu"
import { Modal } from "../ui/Modal"

export function RenameDialog({
  open,
  name,
  onClose,
  onSave,
}: {
  open: boolean
  name: string
  onClose: () => void
  onSave: (name: string) => void
}) {
  return (
    <Modal open={open} onClose={onClose} label="Переименовать проект" className="max-w-md">
      <form
        className="p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault()
          const value = new FormData(e.currentTarget).get("name")?.toString() ?? ""
          onSave(value)
          onClose()
        }}
      >
        <h2 className="display text-3xl">Переименовать</h2>
        <p className="mt-1 text-sm text-muted">Название видно только вам — в списке проектов и при экспорте.</p>
        <input name="name" defaultValue={name} autoFocus maxLength={60} className="input mt-6 h-12 text-[15px]" />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function ProjectCard({ project: p, compact }: { project: Project; compact?: boolean }) {
  const { renameProject, duplicateProject, trashProject } = useApp()
  const router = useRouter()
  const [renaming, setRenaming] = useState(false)
  const href = `/editor?project=${p.id}`
  const empty = emptySlotCount(p.doc)

  return (
    <article className="group animate-fade-up">
      <Link
        href={href}
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-surface-2 p-[9%] ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
      >
        <div className="w-full transition-transform duration-500 group-hover:scale-[1.02]">
          <CollageCanvas doc={p.doc} imgWidth={compact ? 320 : 420} className="shadow-card" />
        </div>
        {empty ? (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-muted backdrop-blur">
            Черновик · {empty} пуст.
          </span>
        ) : null}
        <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
          <span className="btn btn-sm bg-white text-[#1f1b16] shadow-card">
            <PenLine size={14} /> Продолжить
          </span>
        </span>
      </Link>
      <div className="mt-3 flex items-start gap-2 px-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold">
            <Link href={href} className="hover:text-accent">
              {p.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {CATEGORY_BY_SLUG[p.category]?.short ?? "Коллаж"} · <TimeAgo ts={p.updatedAt} />
          </p>
        </div>
        <Popover
          align="right"
          trigger={({ toggle, open }) => (
            <button className="icon-btn -mr-1 size-8 text-muted" onClick={toggle} aria-expanded={open} aria-label="Действия с проектом">
              <Ellipsis size={18} />
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuItem icon={<PenLine />} onClick={() => router.push(href)}>
                Открыть
              </MenuItem>
              <MenuItem
                icon={<TextCursorInput />}
                onClick={() => {
                  close()
                  setRenaming(true)
                }}
              >
                Переименовать
              </MenuItem>
              <MenuItem
                icon={<Copy />}
                onClick={() => {
                  close()
                  duplicateProject(p.id)
                }}
              >
                Дублировать
              </MenuItem>
              <div className="my-1 h-px bg-line" />
              <MenuItem
                danger
                icon={<Trash2 />}
                onClick={() => {
                  close()
                  trashProject(p.id)
                }}
              >
                Удалить
              </MenuItem>
            </>
          )}
        </Popover>
      </div>
      <RenameDialog open={renaming} name={p.name} onClose={() => setRenaming(false)} onSave={(n) => renameProject(p.id, n)} />
    </article>
  )
}
