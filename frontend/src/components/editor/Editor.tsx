"use client"

import {
  ArrowLeft,
  CloudCheck,
  Download,
  Eye,
  Images,
  LayoutTemplate,
  Loader2,
  Maximize,
  Minus,
  PanelLeftClose,
  Plus,
  Redo2,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { autoPlace, emptySlotCount } from "@/src/lib/collage/build"
import { DECOS, FORMATS } from "@/src/lib/collage/styles"
import type { CollageDoc, CollageEl, PhotoEl, TextEl } from "@/src/lib/collage/types"
import { TEMPLATE_BY_ID } from "@/src/lib/catalog"
import { isSamplePhoto } from "@/src/lib/photos"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp, type Project } from "../providers/AppProvider"
import { useMedia } from "../ui/bits"
import { ContextBar } from "./ContextBar"
import { EditorCtx, useHistory, type EditorApi, type Tool } from "./context"
import { ExportDialog } from "./ExportDialog"
import { PHOTO_MIME, PhotosPanel, TemplatesPanel, TextPanel } from "./panels"
import { PreviewOverlay } from "./PreviewOverlay"

const TOOLS: { key: Tool; label: string; title: string; icon: typeof Images }[] = [
  { key: "templates", label: "Шаблон", title: "Шаблоны и композиция", icon: LayoutTemplate },
  { key: "photos", label: "Фото", title: "Фотографии", icon: Images },
  { key: "text", label: "Текст", title: "Текст", icon: Type },
]

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5]

function patchEl(d: CollageDoc, id: string, patch: Partial<CollageEl>): CollageDoc {
  return { ...d, elements: d.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as CollageEl) : e)) }
}

/** Once the user brings their own photos, stock examples are cleared so the remaining empty places are obvious. */
function clearSamples(d: CollageDoc): CollageDoc {
  return {
    ...d,
    elements: d.elements.map((e) => (e.kind === "photo" && !e.fixed && isSamplePhoto(e.src) ? { ...e, src: null } : e)),
  }
}

/** Element height in % of the canvas height, when it is known without measuring. */
function heightPct(el: CollageEl, ratio: number) {
  if (el.kind === "photo") return el.h
  if (el.kind === "deco") return el.w * DECOS[el.deco].ratio * ratio
  return null
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
}

interface Gesture {
  mode: "move" | "resize"
  el: CollageEl
  sx: number
  sy: number
  rect: DOMRect
  before: CollageDoc
  moved: boolean
  wasSelected: boolean
}

function SaveStatus({ state, onSave }: { state: "saved" | "saving" | "unsaved"; onSave: () => void }) {
  if (state === "unsaved")
    return (
      <button className="btn btn-sm btn-secondary" onClick={onSave}>
        Сохранить
      </button>
    )
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted" aria-live="polite">
      {state === "saving" ? <Loader2 size={14} className="animate-spin" /> : <CloudCheck size={15} className="text-sage" />}
      <span className="max-lg:hidden">{state === "saving" ? "Сохранение…" : "Сохранено"}</span>
    </span>
  )
}

function PanelBody({ tool }: { tool: Tool }) {
  if (tool === "templates") return <TemplatesPanel />
  if (tool === "text") return <TextPanel />
  return <PhotosPanel />
}

export function Editor({ project, initialTool }: { project: Project; initialTool?: Tool }) {
  const router = useRouter()
  const { saveProject, renameProject, touchProject, settings, uploads, addFiles, toast } = useApp()
  // Projects started before looks existed pick theirs up from the template they came from.
  const { doc, commit, live, settle, undo, redo, canUndo, canRedo } = useHistory(
    project.doc.look || !project.templateId ? project.doc : { ...project.doc, look: TEMPLATE_BY_ID[project.templateId]?.look },
  )
  const mobile = useMedia("(max-width: 767px)")

  const [name, setName] = useState(project.name)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tool, setToolState] = useState<Tool | null>(initialTool ?? (mobile ? null : "photos"))
  const [zoom, setZoom] = useState(1)
  const [preview, setPreview] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved")
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [fileDrag, setFileDrag] = useState(false)
  const [guides, setGuides] = useState({ v: false, h: false })
  const [area, setArea] = useState({ w: 900, h: 700 })

  const areaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const fileTarget = useRef<string | null>(null)
  const gesture = useRef<Gesture | null>(null)
  const lastEdit = useRef<{ key: string; t: number } | null>(null)
  const firstRender = useRef(true)

  const ratio = FORMATS[doc.format].ratio
  const selected = useMemo(() => doc.elements.find((e) => e.id === selectedId) ?? null, [doc, selectedId])
  const empty = emptySlotCount(doc)

  /* ---------- lifecycle ---------- */

  useEffect(() => {
    touchProject(project.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id])

  useLayoutEffect(() => {
    const node = areaRef.current
    if (!node) return
    const ro = new ResizeObserver(([entry]) => setArea({ w: entry.contentRect.width, h: entry.contentRect.height }))
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  const saveNow = useCallback(() => {
    saveProject(project.id, { doc })
    setSaveState("saved")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, project.id])

  // Autosave shortly after the last change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!settings.autosave) {
      setSaveState("unsaved")
      return
    }
    setSaveState("saving")
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = setTimeout(saveNow, 700)
    return () => clearTimeout(t)
  }, [doc, settings.autosave, saveNow])

  /* ---------- editing API ---------- */

  const select = useCallback((id: string | null) => {
    setSelectedId(id)
    setEditingId(null)
  }, [])

  const setTool = useCallback((t: Tool | null) => setToolState(t), [])

  const updateEl = useCallback(
    (id: string, patch: Partial<CollageEl>) => {
      // Typing in a field becomes one undo step instead of one step per letter.
      const key = `${id}:${Object.keys(patch).join(",")}`
      const now = Date.now()
      const typing = "text" in patch && lastEdit.current?.key === key && now - lastEdit.current.t < 1200
      lastEdit.current = { key, t: now }
      ;(typing ? live : commit)((d) => patchEl(d, id, patch))
    },
    [commit, live],
  )

  const removeEl = useCallback(
    (id: string) => {
      commit((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) }))
      setSelectedId((s) => (s === id ? null : s))
      setEditingId(null)
    },
    [commit],
  )

  const addEl = useCallback(
    (el: CollageEl) => {
      commit((d) => ({ ...d, elements: [...d.elements, el] }))
      setSelectedId(el.id)
      if (mobile) setToolState(null)
    },
    [commit, mobile],
  )

  const placePhoto = useCallback(
    (slotId: string, src: string) => {
      commit((d) => patchEl(d, slotId, { src }))
      setSelectedId(slotId)
    },
    [commit],
  )

  const autoFill = useCallback(
    (srcs?: string[]) => {
      const list = srcs ?? uploads.map((u) => u.src)
      if (!list.length) return
      commit((d) => clearSamples(autoPlace(d, list)))
      toast("Фото размещены в композиции", "success")
    },
    [commit, uploads, toast],
  )

  const openFilePicker = useCallback((slotId?: string) => {
    fileTarget.current = slotId ?? null
    fileRef.current?.click()
  }, [])

  const placeFiles = useCallback(
    async (files: FileList | File[], slotId: string | null) => {
      const added = await addFiles(files)
      if (!added.length) return
      const srcs = added.map((a) => a.src)
      if (slotId) {
        commit((d) => autoPlace(patchEl(d, slotId, { src: srcs[0] }), srcs.slice(1)))
        setSelectedId(slotId)
      } else {
        commit((d) => clearSamples(autoPlace(d, srcs)))
      }
    },
    [addFiles, commit],
  )

  const startEditing = useCallback((id: string) => {
    setSelectedId(id)
    setEditingId(id)
  }, [])

  const api: EditorApi = {
    doc,
    category: project.category,
    projectName: name,
    selected,
    commit,
    updateEl,
    removeEl,
    addEl,
    select,
    startEditing,
    placePhoto,
    autoFill,
    openFilePicker,
    setTool,
  }

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || preview || exportOpen) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redo()
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault()
        removeEl(selectedId)
      } else if (e.key === "Escape") {
        select(null)
      } else if (selectedId && e.key.startsWith("Arrow")) {
        e.preventDefault()
        const step = e.shiftKey ? 2 : 0.5
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0
        commit((d) => {
          const el = d.elements.find((x) => x.id === selectedId)
          return el ? patchEl(d, selectedId, { x: el.x + dx, y: el.y + dy }) : d
        })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redo, removeEl, select, commit, selectedId, preview, exportOpen])

  /* ---------- pointer: move & resize ---------- */

  const startGesture = (e: ReactPointerEvent, el: CollageEl, mode: Gesture["mode"]) => {
    if (e.button !== 0 || !canvasRef.current) return
    gesture.current = {
      mode,
      el,
      sx: e.clientX,
      sy: e.clientY,
      rect: canvasRef.current.getBoundingClientRect(),
      before: doc,
      moved: false,
      wasSelected: selectedId === el.id,
    }

    const move = (ev: PointerEvent) => {
      const g = gesture.current
      if (!g) return
      const px = ev.clientX - g.sx
      const py = ev.clientY - g.sy
      if (!g.moved && Math.hypot(px, py) < 4) return
      g.moved = true
      const dx = (px / g.rect.width) * 100
      const dy = (py / g.rect.height) * 100
      const src = g.el

      if (g.mode === "move") {
        let x = src.x + dx
        let y = src.y + dy
        const hp = heightPct(src, ratio)
        let v = false
        let h = false
        if (settings.showGuides) {
          if (Math.abs(x + src.w / 2 - 50) < 1.2) {
            x = 50 - src.w / 2
            v = true
          }
          if (hp !== null && Math.abs(y + hp / 2 - 50) < 1.2) {
            y = 50 - hp / 2
            h = true
          }
        }
        setGuides((cur) => (cur.v === v && cur.h === h ? cur : { v, h }))
        x = Math.min(100 - src.w * 0.2, Math.max(-src.w * 0.8, x))
        y = Math.min(98, Math.max(-(hp ?? 10) * 0.8, y))
        live((d) => patchEl(d, src.id, { x, y }))
      } else {
        const f = Math.max(0.25, (src.w + (dx + dy * (1 / ratio)) / 2) / src.w)
        if (src.kind === "photo") live((d) => patchEl(d, src.id, { w: Math.max(6, src.w * f), h: Math.max(4, src.h * f) }))
        else if (src.kind === "text") live((d) => patchEl(d, src.id, { w: src.w * f, size: Math.max(0.8, src.size * f) }))
        else live((d) => patchEl(d, src.id, { w: Math.max(2, src.w * f) }))
      }
    }

    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      const g = gesture.current
      gesture.current = null
      setGuides({ v: false, h: false })
      if (!g) return
      if (g.moved) {
        settle(g.before)
        return
      }
      // A plain tap: empty frames ask for a photo, a second tap on a text starts typing.
      if (g.mode === "move" && g.el.kind === "photo" && !g.el.src) openFilePicker(g.el.id)
      if (g.mode === "move" && g.el.kind === "text" && g.wasSelected) setEditingId(g.el.id)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }

  /* ---------- drag & drop of photos ---------- */

  const hasPhotoData = (e: DragEvent) => e.dataTransfer.types.includes(PHOTO_MIME) || e.dataTransfer.types.includes("Files")

  const onPhotoDragOver = (e: DragEvent, el: PhotoEl) => {
    if (!hasPhotoData(e)) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
    if (dropTarget !== el.id) setDropTarget(el.id)
  }

  const onPhotoDrop = (e: DragEvent, el: PhotoEl) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
    setFileDrag(false)
    const src = e.dataTransfer.getData(PHOTO_MIME)
    if (src) placePhoto(el.id, src)
    else if (e.dataTransfer.files.length) placeFiles(e.dataTransfer.files, el.id)
  }

  const rootDrag = {
    onDragOver: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return
      e.preventDefault()
      if (!fileDrag) setFileDrag(true)
    },
    onDragLeave: (e: DragEvent) => {
      if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) setFileDrag(false)
    },
    onDrop: (e: DragEvent) => {
      if (!e.dataTransfer.files.length) return
      e.preventDefault()
      setFileDrag(false)
      setDropTarget(null)
      placeFiles(e.dataTransfer.files, null)
    },
  }

  /* ---------- layout ---------- */

  // vertical room keeps the zoom bar clear; the side margin shrinks with the area, so a narrow tablet canvas stays big
  const padY = mobile ? 28 : 136
  const padX = mobile ? 28 : Math.min(136, Math.max(48, area.w * 0.14))
  const fitW = Math.max(160, Math.min(area.w - padX, (area.h - padY) * ratio))
  const canvasW = Math.round(fitW * zoom)
  const zoomIdx = ZOOMS.indexOf(zoom)
  const activeTool = TOOLS.find((t) => t.key === tool)

  const goBack = () => {
    saveNow()
    router.push("/projects")
  }

  return (
    <EditorCtx.Provider value={api}>
      <div className="flex h-dvh flex-col overflow-hidden bg-bg" {...rootDrag}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) placeFiles(e.target.files, fileTarget.current)
            e.target.value = ""
          }}
        />

        {/* ---------- top bar ---------- */}
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line bg-surface px-2 sm:h-16 sm:gap-2 sm:px-4">
          <button className="icon-btn" onClick={goBack} aria-label="Назад к проектам" title="Назад к проектам">
            <ArrowLeft size={19} />
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => renameProject(project.id, name)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="h-9 w-full min-w-0 max-w-[260px] truncate rounded-lg bg-transparent px-2 font-serif text-lg font-semibold outline-none transition-colors hover:bg-surface-2 focus:bg-surface-2 sm:text-xl"
            aria-label="Название проекта"
          />
          <div className="mx-1 hidden h-6 w-px bg-line sm:block" />
          <button className="icon-btn" onClick={undo} disabled={!canUndo} aria-label="Отменить" title="Отменить (Ctrl+Z)">
            <Undo2 size={18} />
          </button>
          <button className="icon-btn" onClick={redo} disabled={!canRedo} aria-label="Повторить" title="Повторить (Ctrl+Shift+Z)">
            <Redo2 size={18} />
          </button>
          <div className="ml-1 hidden sm:block">
            <SaveStatus state={saveState} onSave={saveNow} />
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button className="btn btn-ghost max-sm:hidden" onClick={() => setPreview(true)}>
              <Eye size={17} /> Предпросмотр
            </button>
            <button className="icon-btn sm:hidden" onClick={() => setPreview(true)} aria-label="Предпросмотр">
              <Eye size={19} />
            </button>
            <button className="btn btn-accent max-sm:size-10 max-sm:px-0" onClick={() => setExportOpen(true)} aria-label="Скачать">
              <Download size={17} /> <span className="max-sm:hidden">Скачать</span>
            </button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1">
          {/* ---------- tool rail ---------- */}
          {!mobile ? (
            <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-3" aria-label="Инструменты">
              {TOOLS.map((t) => {
                const active = tool === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setToolState(active ? null : t.key)}
                    className={`relative flex w-[62px] flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold transition-colors ${
                      active ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2/60 hover:text-ink"
                    }`}
                    aria-pressed={active}
                  >
                    <t.icon size={20} strokeWidth={active ? 2.1 : 1.8} className={active ? "text-accent" : ""} />
                    {t.label}
                    {t.key === "photos" && empty ? (
                      <span className="absolute right-2 top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] text-accent-ink">
                        {empty}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </nav>
          ) : null}

          {/* ---------- side panel ---------- */}
          {!mobile && activeTool ? (
            <aside className="animate-fade-in flex w-[290px] shrink-0 flex-col border-r border-line bg-surface lg:w-[330px]">
              <div className="flex h-14 shrink-0 items-center justify-between pl-5 pr-2">
                <h2 className="text-[15px] font-semibold">{activeTool.title}</h2>
                <button className="icon-btn text-muted" onClick={() => setToolState(null)} aria-label="Скрыть панель" title="Скрыть панель">
                  <PanelLeftClose size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 scrollbar-thin">
                <PanelBody tool={activeTool.key} />
              </div>
            </aside>
          ) : null}

          {/* ---------- workspace ---------- */}
          <main className="relative flex min-w-0 flex-1 flex-col bg-surface-2">
            <div
              ref={areaRef}
              className="relative min-h-0 flex-1 overflow-auto scrollbar-thin"
              onPointerDown={(e) => {
                if (!(e.target as HTMLElement).closest(".collage-el")) select(null)
              }}
            >
              <div
                className="flex min-h-full items-center justify-center"
                style={{ padding: `${padY / 2}px ${padX / 2}px`, minWidth: canvasW + padX, width: "100%" }}
              >
                <div className="relative shrink-0" style={{ width: canvasW }}>
                  <CollageCanvas
                    ref={canvasRef}
                    doc={doc}
                    editable
                    imgWidth={1000}
                    className="shadow-float"
                    selectedId={selectedId}
                    editingId={editingId}
                    dropTargetId={dropTarget}
                    onElementPointerDown={(e, el) => {
                      e.stopPropagation()
                      if (editingId && editingId !== el.id) setEditingId(null)
                      setSelectedId(el.id)
                      startGesture(e, el, "move")
                    }}
                    onHandlePointerDown={(e, el) => startGesture(e, el, "resize")}
                    onBackgroundPointerDown={() => select(null)}
                    onTextDoubleClick={(el: TextEl) => startEditing(el.id)}
                    onTextCommit={(id, text) => {
                      const cur = doc.elements.find((x) => x.id === id)
                      if (cur?.kind === "text" && cur.text !== text) commit((d) => patchEl(d, id, { text }))
                      setEditingId(null)
                    }}
                    onPhotoDragOver={onPhotoDragOver}
                    onPhotoDragLeave={() => setDropTarget(null)}
                    onPhotoDrop={onPhotoDrop}
                  />
                  {guides.v ? <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-accent/70" /> : null}
                  {guides.h ? <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-accent/70" /> : null}
                </div>
              </div>
            </div>

            {/* context toolbar for the selected element */}
            {!mobile ? (
              <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
                <div className="pointer-events-auto">
                  <ContextBar />
                </div>
              </div>
            ) : null}

            {/* bottom: empty-slot hint and zoom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex items-end justify-between gap-3 px-3 sm:bottom-4 sm:px-4">
              <div className="min-w-0">
                {empty && !selected ? (
                  <div className="animate-fade-up pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-3.5 pr-1.5 text-[13px] shadow-card">
                    <span className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />
                    <span className="truncate">
                      Осталось заполнить: <b>{empty}</b>
                      <span className="text-muted max-md:hidden"> — нажмите на пустую рамку</span>
                    </span>
                    <button className="btn btn-sm btn-primary h-8" onClick={() => openFilePicker()}>
                      <Upload size={14} /> <span className="max-sm:hidden">Загрузить</span>
                    </button>
                  </div>
                ) : null}
              </div>
              {!mobile ? (
                <div className="pointer-events-auto flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface p-1 shadow-soft">
                  <button className="icon-btn size-8" disabled={zoomIdx <= 0} onClick={() => setZoom(ZOOMS[zoomIdx - 1])} aria-label="Уменьшить">
                    <Minus size={15} />
                  </button>
                  <span className="w-12 text-center text-xs font-semibold tabular-nums">{Math.round(zoom * 100)}%</span>
                  <button className="icon-btn size-8" disabled={zoomIdx >= ZOOMS.length - 1} onClick={() => setZoom(ZOOMS[zoomIdx + 1])} aria-label="Увеличить">
                    <Plus size={15} />
                  </button>
                  <span className="mx-0.5 h-5 w-px bg-line" />
                  <button className="icon-btn size-8" onClick={() => setZoom(1)} aria-label="Вписать в экран" title="Вписать в экран">
                    <Maximize size={14} />
                  </button>
                </div>
              ) : null}
            </div>

            {fileDrag ? (
              <div className="pointer-events-none absolute inset-3 z-20 grid place-items-center rounded-3xl border-2 border-dashed border-accent bg-accent-soft/70">
                <p className="flex items-center gap-2 text-lg font-semibold text-accent">
                  <Upload size={20} /> Отпустите — разложим фото по рамкам
                </p>
              </div>
            ) : null}
          </main>
        </div>

        {/* ---------- mobile: context bar, tools, sheet ---------- */}
        {mobile ? (
          <>
            {selected && !tool ? (
              <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-30 flex justify-center px-3">
                <div className="pointer-events-auto max-w-full">
                  <ContextBar side="top" />
                </div>
              </div>
            ) : null}
            <nav
              className="z-40 flex h-[68px] shrink-0 items-stretch justify-around border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
              aria-label="Инструменты"
            >
              {TOOLS.map((t) => {
                const active = tool === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setToolState(active ? null : t.key)}
                    className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-accent" : "text-muted"}`}
                  >
                    <t.icon size={21} strokeWidth={active ? 2.2 : 1.8} />
                    {t.label}
                    {t.key === "photos" && empty ? <span className="absolute right-[calc(50%-18px)] top-2.5 size-2 rounded-full bg-accent" /> : null}
                  </button>
                )
              })}
            </nav>
            {activeTool ? (
              <div className="fixed inset-x-0 bottom-[68px] z-30 flex max-h-[58dvh] flex-col rounded-t-3xl border-t border-line bg-surface shadow-float animate-sheet-up">
                <div className="flex shrink-0 items-center justify-between py-2 pl-5 pr-2">
                  <span className="mx-auto h-1 w-10 rounded-full bg-line-strong" />
                </div>
                <div className="-mt-2 flex shrink-0 items-center justify-between pb-2 pl-5 pr-2">
                  <h2 className="text-[15px] font-semibold">{activeTool.title}</h2>
                  <button className="icon-btn text-muted" onClick={() => setToolState(null)} aria-label="Закрыть">
                    <X size={18} />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
                  <PanelBody tool={activeTool.key} />
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        <PreviewOverlay
          open={preview}
          onClose={() => setPreview(false)}
          onDownload={() => {
            setPreview(false)
            setExportOpen(true)
          }}
          doc={doc}
          name={name}
        />
        <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} doc={doc} name={name} projectId={project.id} />
      </div>
    </EditorCtx.Provider>
  )
}
