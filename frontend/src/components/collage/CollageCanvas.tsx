"use client"

import { Plus } from "lucide-react"
import { memo, type CSSProperties, type DragEvent, type PointerEvent, type Ref } from "react"
import { framesLocked } from "@/src/lib/collage/build"
import { DECOS, FONTS, FORMATS, LOOKS, PALETTES, TONES, patternStyle } from "@/src/lib/collage/styles"
import type { CollageDoc, CollageEl, DecoEl, PhotoEl, TextEl } from "@/src/lib/collage/types"
import { cropOf, fallbackSrc, sizedSrc } from "@/src/lib/photos"
import { DecoArt } from "./Deco"
import s from "./CollageCanvas.module.css"

export interface CanvasHandlers {
  selectedId?: string | null
  editingId?: string | null
  dropTargetId?: string | null
  onElementPointerDown?: (e: PointerEvent, el: CollageEl) => void
  onHandlePointerDown?: (e: PointerEvent, el: CollageEl) => void
  onBackgroundPointerDown?: (e: PointerEvent) => void
  onTextDoubleClick?: (el: TextEl) => void
  onTextCommit?: (id: string, text: string) => void
  onPhotoDragOver?: (e: DragEvent, el: PhotoEl) => void
  onPhotoDragLeave?: (e: DragEvent, el: PhotoEl) => void
  onPhotoDrop?: (e: DragEvent, el: PhotoEl) => void
}

interface Props extends CanvasHandlers {
  doc: CollageDoc
  /** pixel width to request remote photos at */
  imgWidth?: number
  editable?: boolean
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLDivElement>
}

function seeded(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return () => {
    h = (h * 1103515245 + 12345) | 0
    return ((h >>> 0) % 1000) / 1000
  }
}

function tornClip(id: string) {
  const r = seeded(id)
  const pts: string[] = []
  const n = 14
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${r() * 2.2}%`)
  for (let i = 1; i <= n; i++) pts.push(`${100 - r() * 1.6}% ${(i / n) * 100}%`)
  for (let i = n - 1; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - r() * 2.2}%`)
  for (let i = n - 1; i >= 1; i--) pts.push(`${r() * 1.6}% ${(i / n) * 100}%`)
  return `polygon(${pts.join(",")})`
}

/** Rough brightness of a #rrggbb colour, 0–1; enough to tell a light colour from a dark one. */
function luminance(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16)
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

function shapeRadius(el: PhotoEl, ratio: number): string | undefined {
  if (el.shape === "circle") return "50%"
  if (el.shape === "arch") {
    const v = Math.min(100, ((el.w * ratio) / el.h) * 50)
    return `50% 50% 0.6cqw 0.6cqw / ${v}% ${v}% 0.6cqw 0.6cqw`
  }
  return undefined
}

/**
 * The part of the photo the frame shows. Scaling around the same point the photo is aligned to
 * keeps fx/fy spanning the whole picture at any zoom: 0 shows its left (top) edge, 100 its right (bottom).
 */
function framing(el: PhotoEl): CSSProperties | undefined {
  if (el.fx === undefined && el.fy === undefined && !el.zoom) return undefined
  const at = `${el.fx ?? 50}% ${el.fy ?? 50}%`
  return { objectPosition: at, transformOrigin: at, transform: el.zoom && el.zoom !== 1 ? `scale(${el.zoom})` : undefined }
}

function PhotoContent({ el, doc, index, imgWidth, editable }: { el: PhotoEl; doc: CollageDoc; index: number; imgWidth: number; editable: boolean }) {
  const ratio = FORMATS[doc.format].ratio
  const { paper, ink, bg, accent } = PALETTES[doc.palette]
  // empty frames are paper-coloured; on dark palettes the ink is light too, so the darker colour marks them
  const mark = luminance(ink) < luminance(bg) ? ink : bg
  let treatment = el.plain || el.fixed ? "plain" : doc.treatment
  if (el.shape !== "rect" && (treatment === "polaroid" || treatment === "torn" || treatment === "film")) treatment = "border"
  const radius = shapeRadius(el, ratio) ?? (treatment === "rounded" ? "2cqw" : treatment === "plain" ? "0.2cqw" : "0")

  const crop = el.src ? cropOf(el.src) : null
  // Frames cut from a reference collage are already graded; the user's photos take on the reference look.
  const look = doc.look && el.src && !crop && !el.fixed ? LOOKS[doc.look] : null
  const baseFilter = crop ? "none" : look ? look.filter : TONES[doc.tone].filter
  const photoFilter = el.mono ? `${baseFilter === "none" ? "" : `${baseFilter} `}grayscale(1) contrast(1.08)` : baseFilter
  const lookOverlay = look?.overlay ? (
    <span className={s.layer} style={{ background: look.overlay, mixBlendMode: look.blend }} />
  ) : null
  const image = el.src && crop ? (
    <div className={s.clip} style={{ borderRadius: radius }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={el.src}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        className={s.cropped}
        style={{
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
          width: `${100 / crop.w}%`,
          height: `${100 / crop.h}%`,
          maxWidth: "none",
          filter: photoFilter,
        }}
      />
    </div>
  ) : el.src ? (
    <span className={s.clip} style={{ borderRadius: radius }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sizedSrc(el.src, imgWidth)}
        alt=""
        crossOrigin="anonymous"
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const img = e.currentTarget
          if (img.dataset.fallback) return
          img.dataset.fallback = "1"
          img.src = fallbackSrc(el.id)
        }}
        className={s.photo}
        style={{ filter: photoFilter, borderRadius: radius, ...framing(el) }}
      />
      {lookOverlay}
    </span>
  ) : (
    <div
      className={s.placeholder}
      style={{
        borderRadius: radius,
        background: `color-mix(in oklab, ${mark} 6%, ${paper})`,
        border: `0.3cqw dashed color-mix(in oklab, ${mark} 35%, transparent)`,
        color: `color-mix(in oklab, ${mark} 70%, transparent)`,
        gap: "1cqw",
      }}
    >
      <span className={s.plus} style={{ background: accent, color: luminance(accent) > 0.6 ? mark : "#fff" }}>
        <Plus style={{ width: "55%", height: "55%" }} strokeWidth={2.4} />
      </span>
      <span style={{ fontFamily: FONTS.sans.css, fontSize: "1.8cqw", fontWeight: 600 }}>
        {editable ? "Добавить фото" : `Фото ${index + 1}`}
      </span>
    </div>
  )

  if (treatment === "polaroid") {
    return (
      <div
        className={s.frame}
        style={{
          background: paper,
          padding: "1.3cqw 1.3cqw 5.2cqw",
          boxShadow: "0 0.5cqw 1.4cqw rgb(30 20 10 / 0.2), 0 0.1cqw 0.3cqw rgb(30 20 10 / 0.15)",
        }}
      >
        {image}
        {el.caption ? (
          <span
            className={s.caption}
            style={{ bottom: "1.2cqw", fontFamily: FONTS.hand.css, fontSize: "2.6cqw", color: "#3a3128", lineHeight: 1 }}
          >
            {el.caption}
          </span>
        ) : null}
      </div>
    )
  }
  if (treatment === "border") {
    return (
      <div
        className={s.fill}
        style={{
          background: paper,
          padding: "1cqw",
          borderRadius: radius,
          boxShadow: "0 0.4cqw 1.1cqw rgb(30 20 10 / 0.16)",
        }}
      >
        {image}
      </div>
    )
  }
  if (treatment === "film") {
    const holes = "repeating-linear-gradient(90deg, transparent 0 0.7cqw, #e8e0d2 0.7cqw 1.7cqw, transparent 1.7cqw 2.4cqw)"
    return (
      <div className={s.frame} style={{ background: "#16130f", padding: "2.4cqw 0.9cqw" }}>
        <div className={s.strip} style={{ top: "0.75cqw", height: "0.9cqw", backgroundImage: holes, opacity: 0.9 }} />
        <div className={s.strip} style={{ bottom: "0.75cqw", height: "0.9cqw", backgroundImage: holes, opacity: 0.9 }} />
        {image}
      </div>
    )
  }
  if (treatment === "torn") {
    return (
      <div className={s.fill} style={{ filter: "drop-shadow(0 0.4cqw 0.6cqw rgb(30 20 10 / 0.22))" }}>
        <div className={s.fill} style={{ background: paper, padding: "0.9cqw", clipPath: tornClip(el.id) }}>
          {image}
        </div>
      </div>
    )
  }
  // Frames cut from a reference keep their own light; other wide photos get the scrim under captions.
  if (el.plain && el.src && !crop && el.w >= 90 && el.h >= 40) {
    // A soft scrim keeps titles readable when they sit on top of a full-bleed photo.
    return (
      <div className={s.frame}>
        {image}
        <div
          className={s.layer}
          style={{
            background:
              "linear-gradient(to top, rgb(0 0 0 / 0.42), transparent 38%), linear-gradient(to bottom, rgb(0 0 0 / 0.22), transparent 18%), rgb(0 0 0 / 0.14)",
          }}
        />
      </div>
    )
  }
  return <div className={s.fill}>{image}</div>
}

function TextContent({
  el,
  editing,
  onCommit,
}: {
  el: TextEl
  editing: boolean
  onCommit?: (id: string, text: string) => void
}) {
  const font = FONTS[el.font]
  const style: CSSProperties = {
    fontFamily: font.css,
    fontSize: `${el.size * font.scale}cqw`,
    fontWeight: el.weight,
    fontStyle: el.italic ? "italic" : "normal",
    textTransform: el.upper ? "uppercase" : "none",
    letterSpacing: el.tracking ? `${el.tracking}em` : undefined,
    color: el.color,
    textAlign: el.align,
    lineHeight: 1.12,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    outline: "none",
  }
  if (editing) {
    return (
      <div
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        style={style}
        ref={(node) => {
          if (node && document.activeElement !== node) {
            node.focus()
            const range = document.createRange()
            range.selectNodeContents(node)
            window.getSelection()?.removeAllRanges()
            window.getSelection()?.addRange(range)
          }
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === "Escape") (e.currentTarget as HTMLElement).blur()
        }}
        onBlur={(e) => onCommit?.(el.id, e.currentTarget.innerText.replace(/\n$/, ""))}
      >
        {el.text}
      </div>
    )
  }
  return <div style={style}>{el.text}</div>
}

function DecoContent({ el }: { el: DecoEl }) {
  return (
    <div style={{ width: "100%", height: `${el.w * (el.ratio ?? DECOS[el.deco].ratio)}cqw` }}>
      <DecoArt deco={el.deco} color={el.color} label={el.label} id={el.id} ratio={el.ratio} />
    </div>
  )
}

// Galleries draw a hundred of these; memo keeps them still when unrelated app state (a favourite, a toast) changes.
export const CollageCanvas = memo(function CollageCanvas({
  doc,
  imgWidth = 700,
  editable = false,
  className = "",
  style,
  ref,
  selectedId,
  editingId,
  dropTargetId,
  onElementPointerDown,
  onHandlePointerDown,
  onBackgroundPointerDown,
  onTextDoubleClick,
  onTextCommit,
  onPhotoDragOver,
  onPhotoDragLeave,
  onPhotoDrop,
}: Props) {
  const ratio = FORMATS[doc.format].ratio
  const ink = PALETTES[doc.palette].ink
  const anchored = editable && framesLocked(doc)
  let photoIndex = -1

  return (
    <div
      ref={ref}
      className={`${s.collage} ${className}`}
      data-edit={editable ? "true" : undefined}
      style={{ aspectRatio: `${ratio}`, background: doc.bg, ...style }}
      onPointerDown={editable ? onBackgroundPointerDown : undefined}
    >
      {doc.pattern !== "none" ? (
        <div className={s.layer} style={patternStyle(doc.pattern, ink)} />
      ) : null}

      {doc.elements.map((el) => {
        // Artwork pieces are part of the background: they never take pointer input.
        const locked = el.kind === "photo" && !!el.fixed
        const selected = editable && !locked && selectedId === el.id
        const editing = editable && editingId === el.id
        let content
        let box: CSSProperties

        if (el.kind === "photo") {
          if (!el.fixed) photoIndex++
          box = { left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%` }
          content = <PhotoContent el={el} doc={doc} index={photoIndex} imgWidth={imgWidth} editable={editable} />
        } else if (el.kind === "text") {
          box = { left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%` }
          content = <TextContent el={el} editing={editing} onCommit={onTextCommit} />
        } else {
          box = { left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%` }
          content = <DecoContent el={el} />
        }

        return (
          <div
            key={el.id}
            className={`${s.el} ${dropTargetId === el.id ? s.drop : ""} ${locked ? s.locked : ""}`}
            data-el-id={editable && !locked ? el.id : undefined}
            data-editing={editing ? "true" : undefined}
            data-pan={editable && el.kind === "photo" && el.src && !cropOf(el.src) ? "true" : undefined}
            style={{ ...box, transform: el.rot ? `rotate(${el.rot}deg)` : undefined }}
            onPointerDown={editable && !editing ? (e) => onElementPointerDown?.(e, el) : undefined}
            onDoubleClick={editable && el.kind === "text" ? () => onTextDoubleClick?.(el) : undefined}
            onDragOver={editable && el.kind === "photo" ? (e) => onPhotoDragOver?.(e, el) : undefined}
            onDragLeave={editable && el.kind === "photo" ? (e) => onPhotoDragLeave?.(e, el) : undefined}
            onDrop={editable && el.kind === "photo" ? (e) => onPhotoDrop?.(e, el) : undefined}
          >
            {content}
            {editable && !selected && !locked ? <span className={s.hover} /> : null}
            {selected ? (
              <>
                <span className={s.selected} />
                {!editing && !(anchored && el.kind === "photo") ? (
                  <span
                    className={s.handle}
                    style={{ right: -8, bottom: -8, cursor: "nwse-resize" }}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      onHandlePointerDown?.(e, el)
                    }}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        )
      })}
    </div>
  )
})
