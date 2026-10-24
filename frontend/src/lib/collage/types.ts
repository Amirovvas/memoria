export type FormatKey = "4:5" | "1:1" | "3:4" | "9:16" | "4:3" | "2:3"
export type StyleKey = "minimal" | "vintage" | "film" | "scrapbook" | "editorial" | "polaroid" | "pinterest" | "collage" | "dreamy" | "soft" | "kodak" | "night" | "notes" | "quiet" | "dump"
export type PaletteKey =
  | "cream"
  | "sage"
  | "terracotta"
  | "blush"
  | "noir"
  | "ocean"
  | "sand"
  | "white"
  | "black"
  | "butter"
  | "lilac"
  | "olive"
  | "cherry"
  | "sky"
  | "linen"
  | "mist"
  | "neon"
export type PatternKey = "none" | "paper" | "grid" | "dots" | "lines" | "kraft"
export type ToneKey = "none" | "warm" | "fade" | "mono"
/** colour grading copied from a reference collage, applied to the user's own photos */
export type LookKey = "bloom" | "dusk" | "golden" | "flash" | "sea" | "noir" | "kodak" | "moss"
export type FontKey = "serif" | "editorial" | "sans" | "hand" | "script" | "mono"
export type TextRole = "title" | "subtitle" | "hand" | "meta"
export type Shape = "rect" | "arch" | "circle"
export type Treatment = "plain" | "polaroid" | "rounded" | "film" | "torn" | "border"
export type ColorToken = "ink" | "muted" | "accent" | "accent2" | "paper" | "bg"
export type Align = "left" | "center" | "right"

export type DecoKey =
  | "tape"
  | "ticket"
  | "stamp"
  | "postmark"
  | "map"
  | "heart"
  | "star"
  | "sparkle"
  | "flower"
  | "leaf"
  | "sun"
  | "plane"
  | "arrow"
  | "scribble"
  | "confetti"
  | "note"
  | "pin"
  | "clip"
  | "balloon"
  | "line"
  | "lines"
  | "filmtext"
  | "card"
  | "torn"
  | "bow"

export type LayoutKey =
  | "polaroid-scatter"
  | "editorial"
  | "film-strip"
  | "minimal-grid"
  | "travel-journal"
  | "postcard"
  | "moodboard"
  | "arches"
  | "celebration"
  | "story"
  | "cover"
  | "wishboard"
  | "mosaic"
  | "overlap"
  | "backdrop"
  | "photobooth"
  | "wall"
  | "hero-row"
  | "sunset"
  | "bloom"
  | "triptych"
  | "night-out"
  | "sea-grid"
  | "bw-wedding"
  | "kodak-strip"
  | "kodak-big"
  | "bw-grid"
  | "paper-birthday"
  | "grid4"
  | "travel-mosaic"
  | "stack-caption"
  | "stack-quote"
  | "heart"
  | "kraft-notes"
  | "quote-bw"
  | "dark-scrapbook"
  | "grid9-dump"
  | "trail-notes"
  | "wedding-cover"
  | "save-the-date"
  | "wedding-program"
  | "wedding-details"
  | "wedding-forever"
  | "wedding-scatter"
  | "wedding-mood"
  | "wedding-letter"
  | "just-married"
  | "torn-stack"
  | "hike-journal"
  | "ride-journal"
  | "grad-torn"
  | "grad-film"
  | "grad-bows"
  | "blank"

interface BaseEl {
  id: string
  /** left edge, % of canvas width */
  x: number
  /** top edge, % of canvas height */
  y: number
  rot: number
}

export interface PhotoEl extends BaseEl {
  kind: "photo"
  /** % of canvas width / height */
  w: number
  h: number
  src: string | null
  shape: Shape
  caption?: string
  /** full-bleed photo drawn without the style frame (polaroid, border…) */
  plain?: boolean
  /** part of the template artwork: not a photo place, never replaced or selected */
  fixed?: boolean
  /** black and white, whatever the collage tone */
  mono?: boolean
}

export interface TextEl extends BaseEl {
  kind: "text"
  /** width in % of canvas width */
  w: number
  text: string
  role: TextRole
  font: FontKey
  /** font size in % of canvas width (cqw) */
  size: number
  color: string
  colorToken?: ColorToken
  align: Align
  weight: number
  italic?: boolean
  upper?: boolean
  tracking?: number
}

export interface DecoEl extends BaseEl {
  kind: "deco"
  /** width in % of canvas width; height follows the deco's natural ratio */
  w: number
  deco: DecoKey
  color: string
  colorToken?: ColorToken
  label?: string
  /** height / width, for decos whose shape varies per template (cards) */
  ratio?: number
}

export type CollageEl = PhotoEl | TextEl | DecoEl

export interface CollageDoc {
  layout: LayoutKey
  format: FormatKey
  style: StyleKey
  palette: PaletteKey
  bg: string
  /** true while the background still follows the palette */
  bgFromPalette: boolean
  pattern: PatternKey
  tone: ToneKey
  look?: LookKey
  treatment: Treatment
  elements: CollageEl[]
}

export interface TemplateTexts {
  title: string
  subtitle: string
  date: string
  note: string
  place: string
  label: string
}
