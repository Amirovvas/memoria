"use client"

import { ChevronDown, ImagePlus, Minus, PencilLine, Plus, RefreshCw, Sparkles, Trash2, Upload, X } from "lucide-react"
import type { ReactNode } from "react"
import { FONTS, PALETTES, TEXT_SWATCHES } from "@/src/lib/collage/styles"
import type { FontKey, TextEl } from "@/src/lib/collage/types"
import { useApp } from "../providers/AppProvider"
import { Popover } from "../ui/Menu"
import { useEditor } from "./context"
import { CaptionAssistant } from "./panels"

function BarButton({ children, onClick, label, danger }: { children: ReactNode; onClick?: () => void; label?: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors hover:bg-surface-2 ${
        danger ? "text-accent" : "text-ink"
      }`}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="mx-0.5 h-5 w-px shrink-0 bg-line" />

function ColorPicker({ value, onChange, side }: { value: string; onChange: (c: string) => void; side: "top" | "bottom" }) {
  const { doc } = useEditor()
  const pal = PALETTES[doc.palette]
  const colors = [...new Set([pal.ink, pal.accent, pal.muted, pal.paper, ...TEXT_SWATCHES])]
  return (
    <Popover
      side={side}
      align="center"
      className="w-56 p-3"
      trigger={({ toggle }) => (
        <button onClick={toggle} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-surface-2" aria-label="Цвет" title="Цвет">
          <span className="size-5 rounded-full ring-2 ring-surface outline outline-1 outline-line-strong" style={{ background: value }} />
        </button>
      )}
    >
      <p className="eyebrow mb-2">Цвет</p>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`aspect-square rounded-full ring-1 ring-black/10 transition hover:scale-110 ${value === c ? "outline-2 outline-offset-2 outline-accent" : ""}`}
            style={{ background: c }}
            aria-label={c}
          />
        ))}
        <label className="relative grid aspect-square cursor-pointer place-items-center rounded-full border border-dashed border-line-strong text-muted">
          <Plus size={12} />
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
      </div>
    </Popover>
  )
}

function TextTools({ el, side }: { el: TextEl; side: "top" | "bottom" }) {
  const { updateEl, removeEl, startEditing } = useEditor()
  const font = FONTS[el.font]
  return (
    <>
      <Popover
        side={side}
        className="w-52"
        trigger={({ toggle, open }) => (
          <button onClick={toggle} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold hover:bg-surface-2" aria-expanded={open}>
            <span style={{ fontFamily: font.css }} className="max-w-24 truncate text-[15px] font-medium">
              {font.label}
            </span>
            <ChevronDown size={13} className="text-muted" />
          </button>
        )}
      >
        {(close) =>
          (Object.keys(FONTS) as FontKey[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                updateEl(el.id, { font: k })
                close()
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-surface-2 ${el.font === k ? "bg-surface-2" : ""}`}
            >
              <span style={{ fontFamily: FONTS[k].css, fontSize: 18 * FONTS[k].scale + 2 }}>{FONTS[k].label}</span>
              <span className="text-xs text-faint" style={{ fontFamily: FONTS[k].css }}>
                Аа
              </span>
            </button>
          ))
        }
      </Popover>
      <Divider />
      <div className="flex shrink-0 items-center">
        <button className="icon-btn size-8" onClick={() => updateEl(el.id, { size: Math.max(1, +(el.size / 1.12).toFixed(2)) })} aria-label="Меньше">
          <Minus size={15} />
        </button>
        <span className="w-8 text-center text-[13px] font-semibold tabular-nums">{Math.round(el.size * 10)}</span>
        <button className="icon-btn size-8" onClick={() => updateEl(el.id, { size: Math.min(30, +(el.size * 1.12).toFixed(2)) })} aria-label="Больше">
          <Plus size={15} />
        </button>
      </div>
      <Divider />
      <ColorPicker value={el.color} onChange={(c) => updateEl(el.id, { color: c, colorToken: undefined })} side={side} />
      <Divider />
      <BarButton onClick={() => startEditing(el.id)} label="Изменить текст">
        <PencilLine size={15} /> <span className="max-sm:hidden">Изменить</span>
      </BarButton>
      <Popover
        side={side}
        align="right"
        className="w-72 p-3"
        trigger={({ toggle }) => (
          <BarButton onClick={toggle} label="AI-подписи">
            <Sparkles size={15} className="text-accent" /> <span className="max-sm:hidden">AI</span>
          </BarButton>
        )}
      >
        {(close) => (
          <>
            <p className="mb-2 text-sm font-semibold">Подписи от AI</p>
            <CaptionAssistant
              compact
              onPick={(t) => {
                updateEl(el.id, { text: t })
                close()
              }}
            />
          </>
        )}
      </Popover>
      <BarButton onClick={() => removeEl(el.id)} label="Удалить текст" danger>
        <Trash2 size={15} />
      </BarButton>
    </>
  )
}

function ReplaceMenu({ slotId, hasPhoto, side }: { slotId: string; hasPhoto: boolean; side: "top" | "bottom" }) {
  const { placePhoto, openFilePicker, setTool } = useEditor()
  const { uploads } = useApp()
  if (!uploads.length) {
    return (
      <BarButton onClick={() => openFilePicker(slotId)}>
        {hasPhoto ? <RefreshCw size={15} /> : <ImagePlus size={15} />} {hasPhoto ? "Заменить фото" : "Добавить фото"}
      </BarButton>
    )
  }
  return (
    <Popover
      side={side}
      className="w-72 p-3"
      trigger={({ toggle }) => (
        <BarButton onClick={toggle}>
          {hasPhoto ? <RefreshCw size={15} /> : <ImagePlus size={15} />} {hasPhoto ? "Заменить фото" : "Добавить фото"}
        </BarButton>
      )}
    >
      {(close) => (
        <>
          <button
            className="btn btn-sm btn-primary w-full"
            onClick={() => {
              close()
              openFilePicker(slotId)
            }}
          >
            <Upload size={14} /> С устройства
          </button>
          <p className="eyebrow mb-2 mt-4">Из загруженных</p>
          <div className="grid max-h-52 grid-cols-4 gap-1.5 overflow-y-auto scrollbar-thin">
            {uploads.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  placePhoto(slotId, u.src)
                  close()
                }}
                className="aspect-square overflow-hidden rounded-md ring-1 ring-line hover:ring-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.src} alt={u.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button
            className="mt-3 w-full text-xs font-semibold text-muted hover:text-ink"
            onClick={() => {
              close()
              setTool("photos")
            }}
          >
            Все фото
          </button>
        </>
      )}
    </Popover>
  )
}

export function ContextBar({ side = "bottom" }: { side?: "top" | "bottom" }) {
  const { selected, updateEl, removeEl, select } = useEditor()
  if (!selected) return null

  let tools: ReactNode
  if (selected.kind === "photo") {
    tools = (
      <>
        <ReplaceMenu slotId={selected.id} hasPhoto={!!selected.src} side={side} />
        <Divider />
        {selected.src ? (
          <BarButton onClick={() => updateEl(selected.id, { src: null })} danger>
            <Trash2 size={15} /> Удалить фото
          </BarButton>
        ) : (
          <BarButton onClick={() => removeEl(selected.id)} danger>
            <Trash2 size={15} /> Убрать рамку
          </BarButton>
        )}
      </>
    )
  } else if (selected.kind === "text") {
    tools = <TextTools el={selected} side={side} />
  } else {
    tools = (
      <>
        <span className="px-2 text-[13px] font-semibold text-muted">Декор</span>
        <ColorPicker value={selected.color} onChange={(c) => updateEl(selected.id, { color: c, colorToken: undefined })} side={side} />
        <Divider />
        <BarButton onClick={() => removeEl(selected.id)} danger>
          <Trash2 size={15} /> Удалить
        </BarButton>
      </>
    )
  }

  return (
    <div
      className="animate-pop-in flex max-w-full items-center gap-0.5 rounded-[22px] border border-line bg-surface p-1 shadow-card"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-0.5">{tools}</div>
      <Divider />
      <button className="icon-btn size-9 text-muted" onClick={() => select(null)} aria-label="Снять выделение">
        <X size={16} />
      </button>
    </div>
  )
}
