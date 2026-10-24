import { LAYOUTS, type ElementSpec } from "./layouts"
import { isSamplePhoto } from "../photos"
import { PALETTES, STYLES, resolveColor } from "./styles"
import type {
  CollageDoc,
  CollageEl,
  LayoutKey,
  LookKey,
  PaletteKey,
  PhotoEl,
  StyleKey,
  TemplateTexts,
  TextEl,
  TextRole,
} from "./types"

function counterIds(prefix: string) {
  let n = 0
  return () => `${prefix}-${n++}`
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}


function textFromSpec(spec: Extract<ElementSpec, { kind: "text" }>, style: StyleKey, palette: PaletteKey, id: string): TextEl {
  const role = STYLES[style].roles[spec.role]
  const token = spec.color ?? role.color
  return {
    id,
    kind: "text",
    x: spec.x,
    y: spec.y,
    w: spec.w,
    rot: spec.rot,
    text: spec.text,
    role: spec.role,
    font: role.font,
    size: spec.size,
    color: resolveColor(palette, token),
    colorToken: token,
    align: spec.align,
    weight: role.weight,
    italic: role.italic,
    upper: role.upper,
    tracking: role.tracking,
  }
}

function materialize(
  specs: ElementSpec[],
  photos: (string | null)[],
  style: StyleKey,
  palette: PaletteKey,
  makeId: () => string = uid,
) {
  let i = 0
  const elements: CollageEl[] = []
  for (const spec of specs) {
    if (spec.kind === "photo" && spec.fixed) {
      elements.push({
        id: makeId(),
        kind: "photo",
        x: spec.x,
        y: spec.y,
        w: spec.w,
        h: spec.h,
        rot: spec.rot,
        shape: spec.shape,
        plain: true,
        fixed: true,
        src: spec.src ?? null,
      })
    } else if (spec.kind === "photo") {
      elements.push({
        id: makeId(),
        kind: "photo",
        x: spec.x,
        y: spec.y,
        w: spec.w,
        h: spec.h,
        rot: spec.rot,
        shape: spec.shape,
        caption: spec.caption,
        plain: spec.plain,
        mono: spec.mono,
        src: photos[i] ?? null,
      })
      i++
    } else if (spec.kind === "text") {
      if (!spec.text.trim()) continue
      elements.push(textFromSpec(spec, style, palette, makeId()))
    } else {
      elements.push({
        id: makeId(),
        kind: "deco",
        x: spec.x,
        y: spec.y,
        w: spec.w,
        rot: spec.rot,
        deco: spec.deco,
        color: resolveColor(palette, spec.color),
        colorToken: spec.color,
        label: spec.label,
        ratio: spec.ratio,
      })
    }
  }
  return elements
}

export interface BuildOptions {
  look?: LookKey
  layout: LayoutKey
  style?: StyleKey
  palette: PaletteKey
  photos: (string | null)[]
  texts: TemplateTexts
  /** deterministic element ids, so server and client render the same markup */
  idPrefix?: string
}

export function buildDoc({ layout, style, palette, photos, texts, idPrefix, look }: BuildOptions): CollageDoc {
  const def = LAYOUTS[layout]
  const s = style ?? def.defaultStyle
  const st = STYLES[s]
  return {
    layout,
    format: def.format,
    style: s,
    palette,
    bg: PALETTES[palette].bg,
    bgFromPalette: true,
    pattern: st.pattern,
    tone: st.tone,
    look,
    treatment: st.treatment,
    elements: materialize(
      def.build(texts),
      photos,
      s,
      palette,
      idPrefix ? counterIds(idPrefix) : uid,
    ),
  }
}

/** Switches the overall style and/or palette while keeping every element where the user put it. */
export function restyle(doc: CollageDoc, next: { style?: StyleKey; palette?: PaletteKey }): CollageDoc {
  const style = next.style ?? doc.style
  const palette = next.palette ?? doc.palette
  const prev = STYLES[doc.style]
  const st = STYLES[style]
  const styleChanged = style !== doc.style

  const elements = doc.elements.map((el): CollageEl => {
    if (el.kind === "text") {
      let out: TextEl = el
      if (styleChanged) {
        const r = st.roles[el.role]
        const followsRole = el.colorToken === prev.roles[el.role].color
        out = {
          ...out,
          font: r.font,
          weight: r.weight,
          italic: r.italic,
          upper: r.upper,
          tracking: r.tracking,
          colorToken: followsRole ? r.color : out.colorToken,
        }
      }
      return out.colorToken ? { ...out, color: resolveColor(palette, out.colorToken) } : out
    }
    if (el.kind === "deco" && el.colorToken) {
      return { ...el, color: resolveColor(palette, el.colorToken) }
    }
    return el
  })

  return {
    ...doc,
    style,
    palette,
    bg: doc.bgFromPalette ? PALETTES[palette].bg : doc.bg,
    pattern: styleChanged ? st.pattern : doc.pattern,
    tone: styleChanged ? st.tone : doc.tone,
    treatment: styleChanged ? st.treatment : doc.treatment,
    elements,
  }
}

/** Re-arranges the current photos and texts into another composition. */
export function applyLayout(doc: CollageDoc, layout: LayoutKey): CollageDoc {
  const photos = photoEls(doc).map((p) => p.src)
  const filled = photos.filter(Boolean)
  const empty = photos.filter((p) => !p)
  const texts = textsFromDoc(doc)
  const built = buildDoc({ layout, style: doc.style, palette: doc.palette, photos: [...filled, ...empty], texts })
  return {
    ...built,
    bg: doc.bg,
    bgFromPalette: doc.bgFromPalette,
    pattern: doc.pattern,
    tone: doc.tone,
    look: doc.look,
    treatment: doc.treatment,
  }
}

export function textsFromDoc(doc: CollageDoc): TemplateTexts {
  const byRole = (role: TextRole, n = 0) =>
    doc.elements.filter((e): e is TextEl => e.kind === "text" && e.role === role)[n]?.text ?? ""
  const label = doc.elements.find((e) => e.kind === "deco" && e.label)
  return {
    title: byRole("title"),
    subtitle: byRole("subtitle"),
    note: byRole("hand"),
    date: byRole("meta"),
    place: byRole("meta", 1),
    label: label && label.kind === "deco" ? (label.label ?? "") : "",
  }
}

/** Photo places of the collage — artwork pieces are not counted. */
export function photoEls(doc: CollageDoc) {
  return doc.elements.filter((e): e is PhotoEl => e.kind === "photo" && !e.fixed)
}

export function emptySlotCount(doc: CollageDoc) {
  return photoEls(doc).filter((p) => !p.src).length
}

/**
 * Puts the given photos into the composition: empty places first, then places that still hold a sample photo.
 * Photos the user already placed stay untouched.
 */
export function autoPlace(doc: CollageDoc, srcs: string[]): CollageDoc {
  const used = new Set(photoEls(doc).map((p) => p.src))
  const queue = srcs.filter((s) => !used.has(s))
  const isSample = isSamplePhoto
  const order = [
    ...photoEls(doc).filter((p) => !p.src),
    ...photoEls(doc).filter((p) => isSample(p.src)),
  ].map((p) => p.id)
  const assign = new Map<string, string>()
  for (const id of order) {
    const next = queue.shift()
    if (!next) break
    assign.set(id, next)
  }
  return {
    ...doc,
    elements: doc.elements.map((e) => (e.kind === "photo" && assign.has(e.id) ? { ...e, src: assign.get(e.id)! } : e)),
  }
}

export function newTextEl(doc: CollageDoc, role: TextRole, text: string): TextEl {
  const r = STYLES[doc.style].roles[role]
  const size = role === "title" ? 7 : role === "hand" ? 4 : role === "subtitle" ? 2.8 : 2
  return {
    id: uid(),
    kind: "text",
    x: 20,
    y: 44,
    w: 60,
    rot: 0,
    text,
    role,
    font: r.font,
    size,
    color: resolveColor(doc.palette, r.color),
    colorToken: r.color,
    align: "center",
    weight: r.weight,
    italic: r.italic,
    upper: r.upper,
    tracking: r.tracking,
  }
}

