"use client"

import { FolderSearch } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState } from "../ui/bits"
import { Editor } from "./Editor"
import s from "./EditorRoute.module.css"

function EditorSkeleton() {
  return (
    <div className={s.skeleton}>
      <div className={s.top} />
      <div className={s.body}>
        <div className={s.rail} />
        <div className={s.stage}>
          <div className={`skeleton ${s.canvas}`} />
        </div>
      </div>
    </div>
  )
}

export function EditorRoute() {
  const params = useSearchParams()
  const { ready, getProject } = useApp()
  const id = params.get("project")
  if (!ready) return <EditorSkeleton />

  const project = id ? getProject(id) : undefined
  if (!project || project.deletedAt) {
    return (
      <div className={s.missing}>
        <EmptyState
          art={<EmptyArt icon={<FolderSearch size={26} />} />}
          title="Проект не найден"
          text="Возможно, он был удалён или принадлежит другому аккаунту."
          action={
            <>
              <Link href="/projects" className="btn btn-primary">
                Мои проекты
              </Link>
              <Link href="/templates" className="btn btn-secondary">
                Выбрать шаблон
              </Link>
            </>
          }
        />
      </div>
    )
  }
  return <Editor key={project.id} project={project} initialTool={params.get("panel") === "upload" ? "photos" : undefined} />
}
