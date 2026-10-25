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
import s from "./ProjectCard.module.css"

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
    <Modal open={open} onClose={onClose} label="Переименовать проект" className={s.dialog}>
      <form
        className={s.form}
        onSubmit={(e) => {
          e.preventDefault()
          const value = new FormData(e.currentTarget).get("name")?.toString() ?? ""
          onSave(value)
          onClose()
        }}
      >
        <h2 className={`display ${s.dialogTitle}`}>Переименовать</h2>
        <p className={s.dialogText}>Название видно только вам — в списке проектов и при экспорте.</p>
        <input name="name" defaultValue={name} autoFocus maxLength={60} className={`input ${s.nameInput}`} />
        <div className={s.actions}>
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
    <article className={`animate-fade-up ${s.card}`}>
      <Link href={href} className={s.thumb}>
        <div className={s.collage}>
          <CollageCanvas doc={p.doc} imgWidth={compact ? 320 : 420} className={s.canvas} />
        </div>
        {empty ? <span className={s.draft}>Черновик · {empty} пуст.</span> : null}
        <span className={s.cta}>
          <span className={`btn btn-sm ${s.ctaButton}`}>
            <PenLine size={14} /> Продолжить
          </span>
        </span>
      </Link>
      <div className={s.meta}>
        <div className={s.info}>
          <h3 className={s.name}>
            <Link href={href}>{p.name}</Link>
          </h3>
          <p className={s.sub}>
            {CATEGORY_BY_SLUG[p.category]?.short ?? "Коллаж"} · <TimeAgo ts={p.updatedAt} />
          </p>
        </div>
        <Popover
          align="right"
          trigger={({ toggle, open }) => (
            <button className={`icon-btn ${s.more}`} onClick={toggle} aria-expanded={open} aria-label="Действия с проектом">
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
              <div className={s.separator} />
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
