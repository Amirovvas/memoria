"use client"

import { ChevronDown, ImagePlus, Minus, PencilLine, Plus, RefreshCw, Sparkles, Trash2, Upload, X, ZoomIn, ZoomOut } from "lucide-react"
import type { ReactNode } from "react"
import { framesLocked, trayPhotos, withPhoto } from "@/src/lib/collage/build"
import { FONTS, PALETTES, TEXT_SWATCHES } from "@/src/lib/collage/styles"
import type { FontKey, PhotoEl, TextEl } from "@/src/lib/collage/types"
import { cropOf } from "@/src/lib/photos"
import { Popover } from "../ui/Menu"
import { useEditor } from "./context"
import { CaptionAssistant } from "./panels"
import s from "./ContextBar.module.css"

function BarButton({ children, onClick, label, danger }: { children: ReactNode; onClick?: () => void; label?: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`${s.barButton} ${danger ? s.danger : ""}`}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className={s.divider} />

function ColorPicker({ value, onChange, side }: { value: string; onChange: (c: string) => void; side: "top" | "bottom" }) {
  const { doc } = useEditor()
  const pal = PALETTES[doc.palette]
  const colors = [...new Set([pal.ink, pal.accent, pal.muted, pal.paper, ...TEXT_SWATCHES])]
  return (
    <Popover
      side={side}
      align="center"
      className={s.colorMenu}
      trigger={({ toggle }) => (
        <button onClick={toggle} className={s.colorTrigger} aria-label="Цвет" title="Цвет">
          <span className={s.colorDot} style={{ background: value }} />
        </button>
      )}
    >
      <p className={`eyebrow ${s.menuEyebrow}`}>Цвет</p>
      <div className={s.swatches}>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`${s.swatch} ${value === c ? s.swatchActive : ""}`}
            style={{ background: c }}
            aria-label={c}
          />
        ))}
        <label className={s.customColor}>
          <Plus size={12} />
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className={s.colorInput} />
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
        className={s.fontMenu}
        trigger={({ toggle, open }) => (
          <button onClick={toggle} className={s.fontTrigger} aria-expanded={open}>
            <span style={{ fontFamily: font.css }} className={s.fontName}>
              {font.label}
            </span>
            <ChevronDown size={13} className={s.muted} />
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
              className={`${s.fontOption} ${el.font === k ? s.fontActive : ""}`}
            >
              <span style={{ fontFamily: FONTS[k].css, fontSize: 18 * FONTS[k].scale + 2 }}>{FONTS[k].label}</span>
              <span className={s.fontSample} style={{ fontFamily: FONTS[k].css }}>
                Аа
              </span>
            </button>
          ))
        }
      </Popover>
      <Divider />
      <div className={s.size}>
        <button className={`icon-btn ${s.sizeButton}`} onClick={() => updateEl(el.id, { size: Math.max(1, +(el.size / 1.12).toFixed(2)) })} aria-label="Меньше">
          <Minus size={15} />
        </button>
        <span className={s.sizeValue}>{Math.round(el.size * 10)}</span>
        <button className={`icon-btn ${s.sizeButton}`} onClick={() => updateEl(el.id, { size: Math.min(30, +(el.size * 1.12).toFixed(2)) })} aria-label="Больше">
          <Plus size={15} />
        </button>
      </div>
      <Divider />
      <ColorPicker value={el.color} onChange={(c) => updateEl(el.id, { color: c, colorToken: undefined })} side={side} />
      <Divider />
      <BarButton onClick={() => startEditing(el.id)} label="Изменить текст">
        <PencilLine size={15} /> <span className={s.label}>Изменить</span>
      </BarButton>
      <Popover
        side={side}
        align="right"
        className={s.wideMenu}
        trigger={({ toggle }) => (
          <BarButton onClick={toggle} label="AI-подписи">
            <Sparkles size={15} className={s.accent} /> <span className={s.label}>AI</span>
          </BarButton>
        )}
      >
        {(close) => (
          <>
            <p className={s.aiTitle}>Подписи от AI</p>
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

const ZOOM_STEP = 1.2
const MAX_ZOOM = 4

/** Zooms the photo inside its frame; dragging the photo picks which part shows. */
function PhotoZoom({ el }: { el: PhotoEl }) {
  const { updateEl } = useEditor()
  const zoom = el.zoom ?? 1
  const set = (z: number) => updateEl(el.id, { zoom: z <= 1.001 ? undefined : +Math.min(MAX_ZOOM, z).toFixed(3) })
  return (
    <div className={s.size} title="Перетащите фото, чтобы выбрать нужную часть">
      <button className={`icon-btn ${s.sizeButton}`} disabled={zoom <= 1} onClick={() => set(zoom / ZOOM_STEP)} aria-label="Отдалить фото">
        <ZoomOut size={15} />
      </button>
      <span className={s.sizeValue}>{Math.round(zoom * 100)}%</span>
      <button className={`icon-btn ${s.sizeButton}`} disabled={zoom >= MAX_ZOOM} onClick={() => set(zoom * ZOOM_STEP)} aria-label="Приблизить фото">
        <ZoomIn size={15} />
      </button>
    </div>
  )
}

function ReplaceMenu({ slotId, hasPhoto, side }: { slotId: string; hasPhoto: boolean; side: "top" | "bottom" }) {
  const { doc, placePhoto, openFilePicker, setTool } = useEditor()
  const tray = trayPhotos(doc)
  if (!tray.length) {
    return (
      <BarButton onClick={() => openFilePicker(slotId)}>
        {hasPhoto ? <RefreshCw size={15} /> : <ImagePlus size={15} />} {hasPhoto ? "Заменить фото" : "Добавить фото"}
      </BarButton>
    )
  }
  return (
    <Popover
      side={side}
      className={s.wideMenu}
      trigger={({ toggle }) => (
        <BarButton onClick={toggle}>
          {hasPhoto ? <RefreshCw size={15} /> : <ImagePlus size={15} />} {hasPhoto ? "Заменить фото" : "Добавить фото"}
        </BarButton>
      )}
    >
      {(close) => (
        <>
          <button
            className={`btn btn-sm btn-primary ${s.wide}`}
            onClick={() => {
              close()
              openFilePicker(slotId)
            }}
          >
            <Upload size={14} /> С устройства
          </button>
          <p className={`eyebrow ${s.uploadsEyebrow}`}>Из загруженных</p>
          <div className={`scrollbar-thin ${s.thumbs}`}>
            {tray.map((src) => (
              <button
                key={src}
                onClick={() => {
                  placePhoto(slotId, src)
                  close()
                }}
                className={s.thumb}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className={s.cover} />
              </button>
            ))}
          </div>
          <button
            className={s.allPhotos}
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
  const { doc, selected, updateEl, removeEl, select } = useEditor()
  if (!selected) return null

  let tools: ReactNode
  if (selected.kind === "photo") {
    tools = (
      <>
        <ReplaceMenu slotId={selected.id} hasPhoto={!!selected.src} side={side} />
        {selected.src && !cropOf(selected.src) ? (
          <>
            <Divider />
            <PhotoZoom el={selected} />
          </>
        ) : null}
        {selected.src ? (
          <>
            <Divider />
            <BarButton onClick={() => updateEl(selected.id, withPhoto(selected, null))} danger>
              <Trash2 size={15} /> Удалить фото
            </BarButton>
          </>
        ) : !framesLocked(doc) ? (
          <>
            <Divider />
            <BarButton onClick={() => removeEl(selected.id)} danger>
              <Trash2 size={15} /> Убрать рамку
            </BarButton>
          </>
        ) : null}
      </>
    )
  } else if (selected.kind === "text") {
    tools = <TextTools el={selected} side={side} />
  } else {
    tools = (
      <>
        <span className={s.decorLabel}>Декор</span>
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
      className={`animate-pop-in ${s.bar}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className={s.tools}>{tools}</div>
      <Divider />
      <button className={`icon-btn ${s.close}`} onClick={() => select(null)} aria-label="Снять выделение">
        <X size={16} />
      </button>
    </div>
  )
}
