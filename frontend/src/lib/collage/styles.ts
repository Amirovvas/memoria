import type { CSSProperties } from "react"
import type {
  ColorToken,
  DecoKey,
  FontKey,
  FormatKey,
  LookKey,
  PaletteKey,
  PatternKey,
  StyleKey,
  TextRole,
  ToneKey,
  Treatment,
} from "./types"

export const FORMATS: Record<FormatKey, { label: string; hint: string; ratio: number; orientation: Orientation }> = {
  "4:5": { label: "4:5", hint: "Пост", ratio: 4 / 5, orientation: "portrait" },
  "3:4": { label: "3:4", hint: "Печать A4", ratio: 3 / 4, orientation: "portrait" },
  "1:1": { label: "1:1", hint: "Квадрат", ratio: 1, orientation: "square" },
  "9:16": { label: "9:16", hint: "Сторис", ratio: 9 / 16, orientation: "portrait" },
  "4:3": { label: "4:3", hint: "Альбом", ratio: 4 / 3, orientation: "landscape" },
  "2:3": { label: "2:3", hint: "Pinterest", ratio: 2 / 3, orientation: "portrait" },
}

export type Orientation = "portrait" | "square" | "landscape"

export const ORIENTATIONS: Record<Orientation, string> = {
  portrait: "Вертикальная",
  square: "Квадратная",
  landscape: "Горизонтальная",
}

export interface Palette {
  name: string
  bg: string
  ink: string
  muted: string
  accent: string
  accent2: string
  paper: string
}

export const PALETTES: Record<PaletteKey, Palette> = {
  cream: { name: "Сливки", bg: "#f4eee3", ink: "#2a241d", muted: "#7a6e60", accent: "#b5583b", accent2: "#d9b99b", paper: "#fffdf8" },
  sand: { name: "Песок", bg: "#efe5d3", ink: "#33291c", muted: "#7f7058", accent: "#c08a3e", accent2: "#9db0a0", paper: "#fffcf5" },
  terracotta: { name: "Терракота", bg: "#ead6c4", ink: "#3a2418", muted: "#84604a", accent: "#a9472a", accent2: "#e6b07e", paper: "#fff9f1" },
  blush: { name: "Пудра", bg: "#f3e1dc", ink: "#3b2326", muted: "#8c6a6c", accent: "#b9525f", accent2: "#e9b8b0", paper: "#fffaf8" },
  sage: { name: "Шалфей", bg: "#e5e9dd", ink: "#2c3226", muted: "#6b735f", accent: "#6e7f5a", accent2: "#c9b79a", paper: "#fbfbf6" },
  ocean: { name: "Море", bg: "#e0e7ea", ink: "#1e2d36", muted: "#5f7480", accent: "#2f6f8f", accent2: "#e8c9a0", paper: "#fdfdfb" },
  noir: { name: "Ночь", bg: "#1b1815", ink: "#f1e9dc", muted: "#a79a88", accent: "#d69a5c", accent2: "#5b4c3e", paper: "#f6f0e6" },
  white: { name: "Белый", bg: "#ffffff", ink: "#1d1b19", muted: "#8a837a", accent: "#c2563e", accent2: "#e8d9c4", paper: "#ffffff" },
  black: { name: "Чёрный", bg: "#0f0e0d", ink: "#f4efe7", muted: "#9c9388", accent: "#e9b872", accent2: "#3a332c", paper: "#f7f2ea" },
  butter: { name: "Масло", bg: "#f4e8b9", ink: "#3a2f12", muted: "#8a7a45", accent: "#c0632f", accent2: "#e9d58a", paper: "#fffdf4" },
  lilac: { name: "Лаванда", bg: "#e3dbf0", ink: "#2e2640", muted: "#7b7091", accent: "#7a5cb0", accent2: "#f4c8d8", paper: "#fdfcff" },
  olive: { name: "Олива", bg: "#474f36", ink: "#f3efe2", muted: "#c3c3a6", accent: "#e7c27d", accent2: "#6b7550", paper: "#f8f5ea" },
  cherry: { name: "Вишня", bg: "#7b1e26", ink: "#fbefe9", muted: "#e6b9b6", accent: "#ffd7c9", accent2: "#a8434b", paper: "#fff8f4" },
  linen: { name: "Лён", bg: "#ece3d8", ink: "#6b5d50", muted: "#8f8173", accent: "#8a7766", accent2: "#d9cbbb", paper: "#f7f1ea" },
  mist: { name: "Туман", bg: "#efeeea", ink: "#2b2a28", muted: "#8a8984", accent: "#2b2a28", accent2: "#e9e4d6", paper: "#fbfbf9" },
  neon: { name: "Неон", bg: "#111111", ink: "#f5f1e8", muted: "#9c9388", accent: "#f4d03f", accent2: "#333333", paper: "#ffffff" },
  sky: { name: "Небо", bg: "#cfe1ef", ink: "#1b2d3d", muted: "#5d7488", accent: "#2d6c9c", accent2: "#f2d6a8", paper: "#ffffff" },
}

export function resolveColor(palette: PaletteKey, token: ColorToken) {
  return PALETTES[palette][token]
}

export const FONTS: Record<FontKey, { label: string; css: string; scale: number }> = {
  serif: { label: "Cormorant", css: "var(--font-cormorant), Georgia, serif", scale: 1 },
  editorial: { label: "Playfair", css: "var(--font-playfair), Georgia, serif", scale: 0.88 },
  sans: { label: "Manrope", css: "var(--font-manrope), system-ui, sans-serif", scale: 0.78 },
  hand: { label: "Caveat", css: "var(--font-caveat), cursive", scale: 1.18 },
  script: { label: "Marck Script", css: "var(--font-marck), cursive", scale: 1.05 },
  mono: { label: "Plex Mono", css: "var(--font-plex-mono), monospace", scale: 0.72 },
}

interface RoleStyle {
  font: FontKey
  weight: number
  italic?: boolean
  upper?: boolean
  tracking?: number
  color: ColorToken
}

export interface CollageStyle {
  name: string
  description: string
  treatment: Treatment
  pattern: PatternKey
  tone: ToneKey
  roles: Record<TextRole, RoleStyle>
}

export const STYLES: Record<StyleKey, CollageStyle> = {
  minimal: {
    name: "Minimal",
    description: "Воздух, тонкая типографика, чистые кадры",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "serif", weight: 500, color: "ink", tracking: -0.01 },
      subtitle: { font: "sans", weight: 500, color: "muted" },
      hand: { font: "serif", weight: 500, italic: true, color: "accent" },
      meta: { font: "sans", weight: 600, upper: true, tracking: 0.2, color: "muted" },
    },
  },
  vintage: {
    name: "Vintage",
    description: "Тёплые оттенки, бумага и рамки с полями",
    treatment: "border",
    pattern: "paper",
    tone: "warm",
    roles: {
      title: { font: "editorial", weight: 500, italic: true, color: "ink" },
      subtitle: { font: "serif", weight: 500, italic: true, color: "muted" },
      hand: { font: "script", weight: 400, color: "accent" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.14, color: "muted" },
    },
  },
  film: {
    name: "Film",
    description: "Плёночные кадры, перфорация и приглушённый цвет",
    treatment: "film",
    pattern: "none",
    tone: "fade",
    roles: {
      title: { font: "mono", weight: 500, upper: true, tracking: 0.08, color: "ink" },
      subtitle: { font: "mono", weight: 400, color: "muted" },
      hand: { font: "hand", weight: 500, color: "accent" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.18, color: "muted" },
    },
  },
  scrapbook: {
    name: "Scrapbook",
    description: "Рваные края, скотч, записки от руки",
    treatment: "torn",
    pattern: "kraft",
    tone: "none",
    roles: {
      title: { font: "hand", weight: 700, color: "ink" },
      subtitle: { font: "serif", weight: 500, italic: true, color: "muted" },
      hand: { font: "hand", weight: 500, color: "accent" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.12, color: "muted" },
    },
  },
  editorial: {
    name: "Editorial",
    description: "Журнальная вёрстка и крупные заголовки",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "editorial", weight: 600, upper: true, tracking: 0.02, color: "ink" },
      subtitle: { font: "serif", weight: 500, italic: true, color: "muted" },
      hand: { font: "serif", weight: 500, italic: true, color: "accent" },
      meta: { font: "sans", weight: 700, upper: true, tracking: 0.24, color: "muted" },
    },
  },
  polaroid: {
    name: "Polaroid",
    description: "Мгновенные снимки с подписями",
    treatment: "polaroid",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "hand", weight: 600, color: "ink" },
      subtitle: { font: "sans", weight: 500, color: "muted" },
      hand: { font: "hand", weight: 500, color: "accent" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.14, color: "muted" },
    },
  },
  dreamy: {
    name: "Dreamy",
    description: "Кадры без рамок поверх фото и подпись от руки",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "hand", weight: 500, color: "paper" },
      subtitle: { font: "sans", weight: 500, color: "paper" },
      hand: { font: "hand", weight: 400, color: "paper" },
      meta: { font: "sans", weight: 500, tracking: 0.3, color: "paper" },
    },
  },
  soft: {
    name: "Soft",
    description: "Мягкая плёнка, лён и тонкие подписи",
    treatment: "plain",
    pattern: "paper",
    tone: "fade",
    roles: {
      title: { font: "serif", weight: 500, italic: true, color: "ink" },
      subtitle: { font: "serif", weight: 500, tracking: 0.03, color: "ink" },
      hand: { font: "serif", weight: 500, tracking: 0.03, color: "ink" },
      meta: { font: "serif", weight: 500, italic: true, color: "muted" },
    },
  },
  kodak: {
    name: "Kodak",
    description: "Плёночные кадры, подписи Kodak и рукописный заголовок",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "script", weight: 400, color: "paper" },
      subtitle: { font: "serif", weight: 500, color: "paper" },
      hand: { font: "hand", weight: 500, color: "paper" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.12, color: "accent" },
    },
  },
  night: {
    name: "Night",
    description: "Чёрно-белая сетка и крупный заголовок",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "sans", weight: 800, upper: true, tracking: 0.01, color: "paper" },
      subtitle: { font: "sans", weight: 500, color: "paper" },
      hand: { font: "script", weight: 400, color: "paper" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.14, color: "muted" },
    },
  },
  notes: {
    name: "Notes",
    description: "Бумажные карточки с короткими заметками",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "hand", weight: 600, color: "ink" },
      subtitle: { font: "mono", weight: 500, color: "ink" },
      hand: { font: "mono", weight: 500, color: "ink" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.14, color: "muted" },
    },
  },
  quiet: {
    name: "Quiet",
    description: "Тихие кадры и строка машинописного текста",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "sans", weight: 600, color: "paper" },
      subtitle: { font: "mono", weight: 500, color: "paper" },
      hand: { font: "hand", weight: 500, color: "paper" },
      meta: { font: "mono", weight: 500, upper: true, tracking: 0.06, color: "paper" },
    },
  },
  dump: {
    name: "Dump",
    description: "Сетка девяти кадров и надпись в два шрифта",
    treatment: "plain",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "editorial", weight: 500, upper: true, tracking: 0.08, color: "paper" },
      subtitle: { font: "sans", weight: 500, color: "paper" },
      hand: { font: "script", weight: 400, color: "accent" },
      meta: { font: "sans", weight: 700, upper: true, tracking: 0.2, color: "paper" },
    },
  },
  collage: {
    name: "Collage",
    description: "Снимки в белой рамке внахлёст, как на стене",
    treatment: "border",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "script", weight: 400, color: "ink" },
      subtitle: { font: "sans", weight: 500, color: "muted" },
      hand: { font: "hand", weight: 500, color: "accent" },
      meta: { font: "sans", weight: 700, upper: true, tracking: 0.22, color: "muted" },
    },
  },
  pinterest: {
    name: "Pinterest",
    description: "Мягкие скругления и сетка-мудборд",
    treatment: "rounded",
    pattern: "none",
    tone: "none",
    roles: {
      title: { font: "serif", weight: 600, color: "ink" },
      subtitle: { font: "sans", weight: 500, color: "muted" },
      hand: { font: "script", weight: 400, color: "accent" },
      meta: { font: "sans", weight: 700, upper: true, tracking: 0.2, color: "muted" },
    },
  },
}

export const PATTERNS: Record<PatternKey, string> = {
  none: "Без узора",
  paper: "Бумага",
  kraft: "Крафт",
  grid: "Клетка",
  dots: "Точки",
  lines: "Линейка",
}

const NOISE_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 0.09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"
// Base64 keeps the inner url(#n) out of sight of CSS parsers such as the one html-to-image uses for export.
const NOISE = `url("data:image/svg+xml;base64,${btoa(NOISE_SVG.replace("%23", "#"))}")`

export function patternStyle(pattern: PatternKey, ink: string): CSSProperties {
  const faint = `color-mix(in oklab, ${ink} 9%, transparent)`
  switch (pattern) {
    case "paper":
      return { backgroundImage: NOISE }
    case "kraft":
      return {
        backgroundImage: `${NOISE}, radial-gradient(circle at 20% 10%, rgb(255 255 255 / 0.18), transparent 50%), radial-gradient(circle at 80% 90%, rgb(120 80 40 / 0.08), transparent 55%)`,
      }
    case "grid":
      return {
        backgroundImage: `linear-gradient(${faint} 1px, transparent 1px), linear-gradient(90deg, ${faint} 1px, transparent 1px)`,
        backgroundSize: "5cqw 5cqw",
      }
    case "dots":
      return {
        backgroundImage: `radial-gradient(${faint.replace("9%", "22%")} 0.18cqw, transparent 0.22cqw)`,
        backgroundSize: "3.2cqw 3.2cqw",
      }
    case "lines":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 4.4cqw, ${faint} 4.4cqw calc(4.4cqw + 1px))`,
      }
    default:
      return {}
  }
}

export const TONES: Record<ToneKey, { label: string; filter: string }> = {
  none: { label: "Натуральный", filter: "none" },
  warm: { label: "Тёплый", filter: "sepia(0.2) saturate(1.06) contrast(1.02)" },
  fade: { label: "Плёнка", filter: "contrast(0.9) saturate(0.82) brightness(1.04) sepia(0.08)" },
  mono: { label: "Ч/Б", filter: "grayscale(1) contrast(1.06)" },
}

export const LOOKS: Record<LookKey, { label: string; filter: string; overlay?: string; blend?: CSSProperties["mixBlendMode"] }> = {
  bloom: {
    label: "Весенняя дымка",
    filter: "sepia(0.42) saturate(0.68) contrast(0.78) brightness(1.08) blur(0.4px)",
    overlay: "rgb(242 232 214 / 0.3)",
    blend: "screen",
  },
  dusk: {
    label: "Сумерки у моря",
    filter: "sepia(0.35) saturate(1.1) hue-rotate(-12deg) contrast(0.92) brightness(0.86)",
    overlay: "rgb(255 140 110 / 0.14)",
    blend: "multiply",
  },
  golden: {
    label: "Закатное золото",
    filter: "sepia(0.32) saturate(1.25) hue-rotate(-16deg) contrast(1.02) brightness(0.9)",
    overlay: "rgb(255 120 90 / 0.12)",
    blend: "soft-light",
  },
  flash: {
    label: "Вспышка",
    filter: "contrast(1.2) saturate(1.15) brightness(0.9) sepia(0.3) hue-rotate(-8deg)",
    overlay: "rgb(255 186 105 / 0.16)",
    blend: "soft-light",
  },
  noir: {
    label: "Чёрно-белая плёнка",
    filter: "grayscale(1) contrast(1.12) brightness(0.92)",
  },
  kodak: {
    label: "Kodak Portra",
    filter: "sepia(0.28) saturate(1.2) contrast(1.06) brightness(0.95) hue-rotate(-8deg)",
    overlay: "rgb(255 178 120 / 0.14)",
    blend: "soft-light",
  },
  moss: {
    label: "Тёмная зелень",
    filter: "sepia(0.25) saturate(0.75) contrast(1.06) brightness(0.84) hue-rotate(8deg)",
    overlay: "rgb(70 90 60 / 0.16)",
    blend: "soft-light",
  },
  sea: {
    label: "Пасмурное море",
    filter: "saturate(0.62) contrast(0.9) brightness(1.03) sepia(0.14)",
    overlay: "rgb(175 192 198 / 0.2)",
    blend: "soft-light",
  },
}

export const DECOS: Record<DecoKey, { name: string; ratio: number; group: "travel" | "love" | "party" | "paper" | "nature" }> = {
  tape: { name: "Скотч", ratio: 0.3, group: "paper" },
  ticket: { name: "Билет", ratio: 0.42, group: "travel" },
  stamp: { name: "Марка", ratio: 1.22, group: "travel" },
  postmark: { name: "Штемпель", ratio: 0.5, group: "travel" },
  map: { name: "Карта", ratio: 0.72, group: "travel" },
  plane: { name: "Самолёт", ratio: 0.6, group: "travel" },
  heart: { name: "Сердце", ratio: 0.9, group: "love" },
  star: { name: "Звезда", ratio: 1, group: "party" },
  sparkle: { name: "Искра", ratio: 1, group: "party" },
  confetti: { name: "Конфетти", ratio: 0.6, group: "party" },
  balloon: { name: "Шарик", ratio: 1.9, group: "party" },
  flower: { name: "Цветок", ratio: 1, group: "nature" },
  leaf: { name: "Ветка", ratio: 1.6, group: "nature" },
  sun: { name: "Солнце", ratio: 1, group: "nature" },
  arrow: { name: "Стрелка", ratio: 0.55, group: "paper" },
  scribble: { name: "Обводка", ratio: 0.62, group: "paper" },
  note: { name: "Записка", ratio: 0.5, group: "paper" },
  pin: { name: "Кнопка", ratio: 1, group: "paper" },
  clip: { name: "Скрепка", ratio: 2.3, group: "paper" },
  line: { name: "Линия", ratio: 0.005, group: "paper" },
  lines: { name: "Строки", ratio: 0.32, group: "paper" },
  filmtext: { name: "Подпись плёнки", ratio: 0.03, group: "paper" },
  card: { name: "Карточка", ratio: 0.8, group: "paper" },
  torn: { name: "Рваный край", ratio: 0.05, group: "paper" },
  bow: { name: "Бант", ratio: 1.8, group: "love" },
}

export const BACKGROUND_SWATCHES = [
  "#f4eee3",
  "#fffdf8",
  "#efe5d3",
  "#ead6c4",
  "#f3e1dc",
  "#e5e9dd",
  "#e0e7ea",
  "#d9cfc1",
  "#c9b79a",
  "#2b2622",
  "#1b1815",
  "#3a4a3f",
]

export const TEXT_SWATCHES = ["#2a241d", "#fffdf8", "#7a6e60", "#b5583b", "#b9525f", "#6e7f5a", "#2f6f8f", "#c08a3e"]
