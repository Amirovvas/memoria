"use client"

import { ImagePlus } from "lucide-react"
import type { CSSProperties, DragEvent, PointerEvent, Ref } from "react"
import { DECOS, FONTS, FORMATS, LOOKS, PALETTES, TONES, patternStyle } from "@/src/lib/collage/styles"
import type { CollageDoc, CollageEl, DecoEl, PhotoEl, TextEl } from "@/src/lib/collage/types"
import { cropOf, fallbackSrc, sizedSrc } from "@/src/lib/photos"
import { DecoArt } from "./Deco"

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

function shapeRadius(el: PhotoEl, ratio: number): string | undefined {
  if (el.shape === "circle") return "50%"
  if (el.shape === "arch") {
    const v = Math.min(100, ((el.w * ratio) / el.h) * 50)
    return `50% 50% 0.6cqw 0.6cqw / ${v}% ${v}% 0.6cqw 0.6cqw`
  }
  return undefined
}

function PhotoContent({ el, doc, index, imgWidth, editable }: { el: PhotoEl; doc: CollageDoc; index: number; imgWidth: number; editable: boolean }) {
  const ratio = FORMATS[doc.format].ratio
  const paper = PALETTES[doc.palette].paper
  const ink = PALETTES[doc.palette].ink
  let treatment = el.plain || el.fixed ? "plain" : doc.treatment
  if (el.shape !== "rect" && (treatment === "polaroid" || treatment === "torn" || treatment === "film")) treatment = "border"
  const radius = shapeRadius(el, ratio) ?? (treatment === "rounded" ? "2cqw" : treatment === "plain" ? "0.2cqw" : "0")

  const crop = el.src ? cropOf(el.src) : null
  // Frames cut from a reference collage are already graded; the user's photos take on the reference look.
  const look = doc.look && el.src && !crop && !el.fixed ? LOOKS[doc.look] : null
  const baseFilter = crop ? "none" : look ? look.filter : TONES[doc.tone].filter
  const photoFilter = el.mono ? `${baseFilter === "none" ? "" : `${baseFilter} `}grayscale(1) contrast(1.08)` : baseFilter
  const lookOverlay = look?.overlay ? (
    <span className="pointer-events-none absolute inset-0" style={{ background: look.overlay, mixBlendMode: look.blend }} />
  ) : null
  const image = el.src && crop ? (
    <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: radius }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={el.src}
        alt=""
        draggable={false}
        className="absolute block"
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
    <span className="relative block h-full w-full overflow-hidden" style={{ borderRadius: radius }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sizedSrc(el.src, imgWidth)}
        alt=""
        crossOrigin="anonymous"
        draggable={false}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget
          if (img.dataset.fallback) return
          img.dataset.fallback = "1"
          img.src = fallbackSrc(el.id)
        }}
        className="block h-full w-full object-cover"
        style={{ filter: photoFilter, borderRadius: radius }}
      />
      {lookOverlay}
    </span>
  ) : (
    <div
      className="flex h-full w-full flex-col items-center justify-center text-center"
      style={{
        borderRadius: radius,
        background: `color-mix(in oklab, ${ink} 6%, ${paper})`,
        border: `0.3cqw dashed color-mix(in oklab, ${ink} 30%, transparent)`,
        color: `color-mix(in oklab, ${ink} 55%, transparent)`,
        gap: "0.8cqw",
      }}
    >
      <ImagePlus style={{ width: "4.5cqw", height: "4.5cqw" }} strokeWidth={1.5} />
      <span style={{ fontFamily: FONTS.sans.css, fontSize: "1.7cqw", fontWeight: 600 }}>
        Фото {index + 1}
      </span>
    </div>
  )

  if (treatment === "polaroid") {
    return (
      <div
        className="relative h-full w-full"
        style={{
          background: paper,
          padding: "1.3cqw 1.3cqw 5.2cqw",
          boxShadow: "0 0.5cqw 1.4cqw rgb(30 20 10 / 0.2), 0 0.1cqw 0.3cqw rgb(30 20 10 / 0.15)",
        }}
      >
        {image}
        {el.caption ? (
          <span
            className="absolute inset-x-0 truncate text-center"
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
        className="h-full w-full"
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
      <div className="relative h-full w-full" style={{ background: "#16130f", padding: "2.4cqw 0.9cqw" }}>
        <div className="absolute inset-x-0" style={{ top: "0.75cqw", height: "0.9cqw", backgroundImage: holes, opacity: 0.9 }} />
        <div className="absolute inset-x-0" style={{ bottom: "0.75cqw", height: "0.9cqw", backgroundImage: holes, opacity: 0.9 }} />
        {image}
      </div>
    )
  }
  if (treatment === "torn") {
    return (
      <div className="h-full w-full" style={{ filter: "drop-shadow(0 0.4cqw 0.6cqw rgb(30 20 10 / 0.22))" }}>
        <div className="h-full w-full" style={{ background: paper, padding: "0.9cqw", clipPath: tornClip(el.id) }}>
          {image}
        </div>
      </div>
    )
  }
  // Frames cut from a reference keep their own light; other wide photos get the scrim under captions.
  if (el.plain && el.src && !crop && el.w >= 90 && el.h >= 40) {
    // A soft scrim keeps titles readable when they sit on top of a full-bleed photo.
    return (
      <div className="relative h-full w-full">
        {image}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(0 0 0 / 0.42), transparent 38%), linear-gradient(to bottom, rgb(0 0 0 / 0.22), transparent 18%), rgb(0 0 0 / 0.14)",
          }}
        />
      </div>
    )
  }
  return <div className="h-full w-full">{image}</div>
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

export function CollageCanvas({
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
  let photoIndex = -1

  return (
    <div
      ref={ref}
      className={`collage ${className}`}
      data-edit={editable ? "true" : undefined}
      style={{ aspectRatio: `${ratio}`, background: doc.bg, ...style }}
      onPointerDown={editable ? onBackgroundPointerDown : undefined}
    >
      {doc.pattern !== "none" ? (
        <div className="pointer-events-none absolute inset-0" style={patternStyle(doc.pattern, ink)} />
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
            className={`collage-el ${dropTargetId === el.id ? "slot-drop" : ""} ${locked ? "pointer-events-none" : ""}`}
            data-el-id={editable && !locked ? el.id : undefined}
            data-editing={editing ? "true" : undefined}
            style={{ ...box, transform: el.rot ? `rotate(${el.rot}deg)` : undefined }}
            onPointerDown={editable && !editing ? (e) => onElementPointerDown?.(e, el) : undefined}
            onDoubleClick={editable && el.kind === "text" ? () => onTextDoubleClick?.(el) : undefined}
            onDragOver={editable && el.kind === "photo" ? (e) => onPhotoDragOver?.(e, el) : undefined}
            onDragLeave={editable && el.kind === "photo" ? (e) => onPhotoDragLeave?.(e, el) : undefined}
            onDrop={editable && el.kind === "photo" ? (e) => onPhotoDrop?.(e, el) : undefined}
          >
            {content}
            {editable && !selected && !locked ? <span className="el-hover" /> : null}
            {selected ? (
              <>
                <span className="el-selected" />
                {!editing ? (
                  <span
                    className="el-handle"
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
}
