"use client"

import { FolderSearch } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState } from "../ui/bits"
import { Editor } from "./Editor"

function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-bg">
      <div className="h-16 border-b border-line bg-surface" />
      <div className="flex flex-1">
        <div className="hidden w-[76px] border-r border-line bg-surface md:block" />
        <div className="grid flex-1 place-items-center bg-surface-2">
          <div className="skeleton aspect-[4/5] w-[min(60vw,420px)] rounded-sm" />
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
      <div className="grid min-h-dvh place-items-center">
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
