import type {
  Align,
  ColorToken,
  DecoKey,
  FormatKey,
  LayoutKey,
  Shape,
  StyleKey,
  TemplateTexts,
  TextRole,
} from "./types"
import { cropSrc } from "../photos"
import { REF, TRAIL_CARDS, type Box, type Reference, type Size } from "./references"

export interface PhotoSpec {
  kind: "photo"
  x: number
  y: number
  w: number
  h: number
  rot: number
  shape: Shape
  caption?: string
  plain?: boolean
  /** artwork piece with its own picture, not a photo place */
  fixed?: boolean
  src?: string
  mono?: boolean
}

export interface TextSpec {
  kind: "text"
  role: TextRole
  text: string
  x: number
  y: number
  w: number
  size: number
  align: Align
  rot: number
  color?: ColorToken
}

export interface DecoSpec {
  kind: "deco"
  deco: DecoKey
  x: number
  y: number
  w: number
  rot: number
  color: ColorToken
  label?: string
  ratio?: number
}

export type ElementSpec = PhotoSpec | TextSpec | DecoSpec

export interface LayoutDef {
  name: string
  description: string
  format: FormatKey
  slots: number
  defaultStyle: StyleKey
  build: (t: TemplateTexts) => ElementSpec[]
}

const P = (x: number, y: number, w: number, h: number, rot = 0, shape: Shape = "rect", caption?: string): PhotoSpec => ({
  kind: "photo",
  x,
  y,
  w,
  h,
  rot,
  shape,
  caption,
})

/** Full-bleed photo without a frame — used as a photo background. */
const B = (x: number, y: number, w: number, h: number): PhotoSpec => ({ kind: "photo", x, y, w, h, rot: 0, shape: "rect", plain: true })

const T = (
  role: TextRole,
  text: string,
  x: number,
  y: number,
  w: number,
  size: number,
  align: Align = "left",
  rot = 0,
  color?: ColorToken,
): TextSpec => ({ kind: "text", role, text, x, y, w, size, align, rot, color })

const D = (
  deco: DecoKey,
  x: number,
  y: number,
  w: number,
  rot = 0,
  color: ColorToken = "accent",
  label?: string,
  ratio?: number,
): DecoSpec => ({
  kind: "deco",
  deco,
  x,
  y,
  w,
  rot,
  color,
  label,
  ratio,
})

/** Full-bleed black-and-white photo. */
const BW = (x: number, y: number, w: number, h: number): PhotoSpec => ({ ...B(x, y, w, h), mono: true })

/**
 * Film-edge label running down the frame, its first letter at (cx, top) in % of canvas width.
 * `height` is the canvas height in the same units (100 / format ratio).
 */
const filmLabel = (label: string, cx: number, top: number, w: number, height: number) =>
  D("filmtext", cx - w / 2, ((top + w / 2 - (w * 0.03) / 2) / height) * 100, w, 90, "muted", label)

/** A pixel box of a reference image as x, y, w, h in % of the canvas. */
const rect = ([x0, y0, x1, y1]: Box, [W, H]: Size) =>
  [(x0 / W) * 100, (y0 / H) * 100, ((x1 - x0) / W) * 100, ((y1 - y0) / H) * 100] as const

/** Photo places of a reference, full-bleed. */
const slotsOf = (r: Reference) => r.slots.map((b) => B(...rect(b, r.size)))

/** Photo places of a reference, framed by the style. */
const framesOf = (r: Reference) => r.slots.map((b) => P(...rect(b, r.size)))

/** The reference picture — whole or one piece of it — as fixed artwork. */
const art = (r: Reference, b: Box = [0, 0, r.size[0], r.size[1]]): PhotoSpec => {
  const [x, y, w, h] = rect(b, r.size)
  return { kind: "photo", x, y, w, h, rot: 0, shape: "rect", plain: true, fixed: true, src: cropSrc(r.src, r.size, b) }
}

/** A plain piece of the reference (`from`) stretched over `to`, e.g. to hide printed text under its own background. */
const patch = (r: Reference, from: Box, to: Box): PhotoSpec => ({ ...art(r, to), src: cropSrc(r.src, r.size, from) })

export const LAYOUTS: Record<LayoutKey, LayoutDef> = {
  "polaroid-scatter": {
    name: "Россыпь снимков",
    description: "Polaroid-кадры, разбросанные по столу",
    format: "4:5",
    slots: 5,
    defaultStyle: "polaroid",
    build: (t) => [
      T("title", t.title, 8, 4, 84, 8.5, "center", -1.5),
      P(5, 16, 41, 30, -5, "rect", "море"),
      P(53, 14, 41, 29, 4),
      P(28, 40, 44, 32, -1.5, "rect", t.place.split("·")[0]?.trim()),
      P(4, 66, 40, 28, 3),
      P(56, 63, 40, 29, -4, "rect", "лучший день"),
      D("tape", 18, 14.4, 14, -8, "accent2"),
      D("tape", 67, 12.8, 13, 7, "accent2"),
      D("tape", 43, 38.5, 14, 2, "accent2"),
      D("heart", 85, 48, 6, 12),
      D("sparkle", 7, 52, 6),
      T("meta", t.date, 30, 95.5, 40, 2, "center"),
    ],
  },
  editorial: {
    name: "Журнал",
    description: "Разворот глянцевого журнала",
    format: "3:4",
    slots: 5,
    defaultStyle: "editorial",
    build: (t) => [
      T("meta", `Выпуск 07 — ${t.date}`, 6, 3.4, 50, 1.7),
      T("meta", t.place, 50, 3.4, 44, 1.7, "right"),
      D("line", 6, 6.3, 88, 0, "ink"),
      T("title", t.title, 6, 8, 88, 9),
      P(6, 19, 56, 47),
      P(65, 19, 29, 22.5),
      P(65, 43.5, 29, 22.5),
      T("subtitle", t.subtitle, 6, 68, 56, 3.4),
      P(6, 77, 28, 19),
      P(36, 77, 26, 19),
      T("meta", "Заметки", 65, 77.5, 29, 1.6),
      T("hand", t.note, 65, 80.5, 29, 3.4),
      D("line", 65, 95.5, 29, 0, "ink"),
    ],
  },
  "film-strip": {
    name: "Плёнка",
    description: "Две плёночные ленты и заметки",
    format: "4:5",
    slots: 6,
    defaultStyle: "film",
    build: (t) => [
      P(8, 4, 38, 22.5),
      P(8, 27, 38, 22.5),
      P(8, 50, 38, 22.5),
      P(8, 73, 38, 22.5),
      P(54, 4, 38, 22.5),
      P(54, 27, 38, 22.5),
      T("meta", t.date, 54, 53, 38, 2),
      T("title", t.title, 54, 57, 38, 6.4),
      T("subtitle", t.subtitle, 54, 69, 38, 2.6),
      T("hand", t.note, 54, 80, 36, 4.4, "left", -3),
      D("arrow", 72, 89.5, 13, 8),
    ],
  },
  "minimal-grid": {
    name: "Чистая сетка",
    description: "Шесть кадров и много воздуха",
    format: "1:1",
    slots: 6,
    defaultStyle: "minimal",
    build: (t) => [
      P(6, 6, 28, 34),
      P(36, 6, 28, 34),
      P(66, 6, 28, 34),
      P(6, 42, 28, 34),
      P(36, 42, 28, 34),
      P(66, 42, 28, 34),
      T("title", t.title, 6, 80.5, 58, 7),
      T("subtitle", t.subtitle, 6, 90.5, 58, 2.2),
      T("meta", t.date, 60, 83, 34, 1.8, "right"),
      T("meta", t.place, 60, 87, 34, 1.8, "right"),
    ],
  },
  "travel-journal": {
    name: "Дневник поездки",
    description: "Билеты, карта, марки и записи",
    format: "3:4",
    slots: 7,
    defaultStyle: "scrapbook",
    build: (t) => [
      P(5, 4, 47, 27, -3),
      D("tape", 20, 2.6, 15, -6, "accent2"),
      P(56, 6, 38, 22, 4),
      D("tape", 68, 4.8, 13, 8, "accent2"),
      D("map", 54, 31, 40, 2),
      D("stamp", 40, 25, 12, 8),
      T("title", t.title, 6, 33, 34, 7.5, "left", -2),
      P(5, 50, 30, 20, 2),
      P(37, 52, 22, 17, -5),
      D("ticket", 50, 56, 44, -4, "accent", t.label),
      P(6, 73, 32, 21, -2),
      P(40, 73, 25, 18, 4),
      P(67, 72, 28, 21, 3),
      D("tape", 46, 71.5, 12, -10, "accent2"),
      T("hand", t.note, 38, 92.6, 30, 3.2, "left", -2),
      T("meta", t.date, 66, 95.5, 29, 1.8, "right"),
    ],
  },
  postcard: {
    name: "Открытка",
    description: "Винтажная почтовая открытка",
    format: "4:3",
    slots: 3,
    defaultStyle: "vintage",
    build: (t) => [
      P(4, 6, 56, 88),
      T("hand", "Привет из", 64, 7, 20, 3.6, "left", -3),
      D("stamp", 84, 5, 11, 5),
      T("title", t.title, 64, 20, 30, 5.2),
      T("subtitle", t.subtitle, 64, 37, 32, 1.9),
      D("lines", 64, 48, 32, 0, "muted"),
      T("hand", t.note, 64, 46.5, 32, 2.8, "left", -1),
      P(64, 66, 14, 26, -5),
      P(80, 66, 14, 26, 4),
      D("postmark", 46, 70, 18, -12, "ink"),
    ],
  },
  moodboard: {
    name: "Мудборд",
    description: "Pinterest-сетка с разной высотой",
    format: "4:5",
    slots: 8,
    defaultStyle: "pinterest",
    build: (t) => [
      P(4, 4, 28, 28),
      P(4, 34, 28, 22),
      P(4, 58, 28, 38),
      T("meta", t.date, 36, 4.8, 28, 1.6, "center"),
      T("title", t.title, 36, 8, 28, 5.4, "center"),
      T("subtitle", t.subtitle, 36, 19.2, 28, 1.9, "center"),
      P(36, 26, 28, 34),
      P(36, 62, 28, 34),
      P(68, 4, 28, 24),
      P(68, 30, 28, 32),
      P(68, 64, 28, 32),
    ],
  },
  arches: {
    name: "Арки",
    description: "Мягкие арки и круглые рамки",
    format: "4:5",
    slots: 5,
    defaultStyle: "minimal",
    build: (t) => [
      T("meta", t.date, 10, 4.6, 80, 1.8, "center"),
      T("title", t.title, 10, 8, 80, 8, "center"),
      T("subtitle", t.subtitle, 15, 16.6, 70, 2.4, "center"),
      P(6, 24, 28, 40, 0, "arch"),
      P(36, 22, 28, 44, 0, "arch"),
      P(66, 24, 28, 40, 0, "arch"),
      P(12, 70, 24, 19.2, 0, "circle"),
      P(64, 70, 24, 19.2, 0, "circle"),
      T("hand", t.note, 37, 72.5, 26, 3.6, "center"),
      D("heart", 46, 84, 8),
      D("sparkle", 88, 17, 5, 0, "accent2"),
      D("sparkle", 7, 19, 3.6, 0, "accent2"),
    ],
  },
  celebration: {
    name: "Праздник",
    description: "Конфетти, круг в центре и подписи",
    format: "1:1",
    slots: 5,
    defaultStyle: "polaroid",
    build: (t) => [
      D("confetti", 0, 0, 100, 0),
      D("confetti", 0, 40, 100, 180, "accent2"),
      P(4, 6, 26, 26, -6),
      P(70, 6, 26, 26, 6),
      P(32, 8, 36, 36, 0, "circle"),
      P(4, 58, 28, 34, 4),
      P(68, 58, 28, 34, -4),
      T("title", t.title, 30, 48, 40, 6.5, "center"),
      T("subtitle", t.subtitle, 32, 68.5, 36, 2.2, "center"),
      T("hand", t.note, 32, 77, 36, 3.6, "center", -2),
      T("meta", t.date, 32, 90, 36, 1.8, "center"),
      D("balloon", 85, 35, 7, 8),
      D("star", 9, 40, 5, 0, "accent2"),
    ],
  },
  story: {
    name: "Сторис",
    description: "Вертикальный формат для соцсетей",
    format: "9:16",
    slots: 3,
    defaultStyle: "editorial",
    build: (t) => [
      T("meta", t.date, 8, 2.6, 84, 2.6),
      P(8, 6, 84, 42),
      P(8, 50, 40, 24, -3),
      P(52, 52, 40, 24, 3),
      D("tape", 20, 49, 16, -6, "accent2"),
      D("tape", 64, 51, 16, 5, "accent2"),
      T("title", t.title, 8, 79, 84, 10),
      T("hand", t.note, 8, 91.5, 84, 4.4),
    ],
  },
  cover: {
    name: "Обложка",
    description: "Фото на весь лист и крупный заголовок",
    format: "3:4",
    slots: 2,
    defaultStyle: "editorial",
    build: (t) => [
      P(0, 0, 100, 100),
      T("meta", [t.place, t.date].filter(Boolean).join(" · "), 6, 4, 88, 1.8, "center", 0, "paper"),
      T("title", t.title, 4, 7, 92, 13, "center", 0, "paper"),
      T("subtitle", t.subtitle, 6, 80, 54, 3.4, "left", 0, "paper"),
      T("meta", "Специальный выпуск", 6, 91, 54, 1.7, "left", 0, "paper"),
      P(64, 66, 30, 25, 4),
      D("tape", 72, 64.6, 13, -6, "accent2"),
    ],
  },
  wishboard: {
    name: "Доска желаний",
    description: "Карточки на кнопках вокруг цели",
    format: "4:3",
    slots: 7,
    defaultStyle: "pinterest",
    build: (t) => [
      P(3, 5, 27, 42, -3),
      P(33, 4, 32, 30, 2),
      P(69, 5, 28, 42, 4),
      D("note", 33, 38, 34, -2, "paper"),
      T("title", t.title, 35, 41.5, 30, 4, "center", -2),
      T("hand", t.note, 35, 54, 30, 2.6, "center", -2),
      P(3, 53, 24, 42, 3),
      P(29, 65, 20, 31, -4),
      P(51, 65, 20, 31, 3),
      P(73, 53, 24, 42, -3),
      D("pin", 15, 3, 3.2),
      D("pin", 48, 2.4, 3.2),
      D("pin", 82, 3, 3.2),
      D("pin", 49, 36.6, 3),
    ],
  },
  mosaic: {
    name: "Мозаика",
    description: "Девять снимков встык, как лента Pinterest",
    format: "4:5",
    slots: 9,
    defaultStyle: "minimal",
    build: () => [
      P(1.5, 1.2, 31.3, 40),
      P(1.5, 42.4, 31.3, 24),
      P(1.5, 67.6, 31.3, 31.2),
      P(34.35, 1.2, 31.3, 25),
      P(34.35, 27.4, 31.3, 40),
      P(34.35, 68.6, 31.3, 30.2),
      P(67.2, 1.2, 31.3, 32),
      P(67.2, 34.4, 31.3, 30),
      P(67.2, 65.6, 31.3, 33.2),
    ],
  },
  overlap: {
    name: "Внахлёст",
    description: "Снимки в рамках накладываются друг на друга до самых краёв",
    format: "4:5",
    slots: 7,
    defaultStyle: "collage",
    build: () => [
      P(-3, -2, 56, 34, -4),
      P(47, 1, 56, 30, 5),
      P(-5, 30, 52, 32, 3),
      P(44, 29, 60, 34, -3),
      P(-2, 61, 48, 34, -5),
      P(50, 64, 54, 36, 4),
      P(24, 38, 48, 30, -2),
    ],
  },
  backdrop: {
    name: "Фото-фон",
    description: "Большое фото на весь лист и три снимка поверх",
    format: "4:5",
    slots: 4,
    defaultStyle: "polaroid",
    build: (t) => [
      B(0, 0, 100, 100),
      T("meta", t.date, 6, 4, 88, 2, "center", 0, "paper"),
      P(7, 12, 44, 31, -6),
      P(49, 27, 44, 31, 5),
      P(12, 50, 44, 31, -3),
      T("title", t.title, 6, 85, 88, 9, "center", -2, "paper"),
    ],
  },
  photobooth: {
    name: "Фотобудка",
    description: "Вертикальная лента из трёх кадров",
    format: "9:16",
    slots: 3,
    defaultStyle: "minimal",
    build: (t) => [
      P(20, 4, 60, 26),
      P(20, 31, 60, 26),
      P(20, 58, 60, 26),
      T("hand", t.note, 10, 88, 80, 6, "center", -2),
    ],
  },
  wall: {
    name: "Стена снимков",
    description: "Одиннадцать фото плотно, с лёгким наклоном",
    format: "3:4",
    slots: 11,
    defaultStyle: "collage",
    build: () => [
      P(2, 2, 30, 22, -4),
      P(34, 3, 32, 24, 3),
      P(68, 1, 30, 22, -2),
      P(4, 25, 34, 26, 2),
      P(38, 28, 28, 21, -5),
      P(66, 24, 32, 26, 4),
      P(1, 52, 31, 24, -3),
      P(33, 50, 34, 26, 2),
      P(68, 52, 30, 22, -4),
      P(5, 76, 42, 22, 3),
      P(50, 77, 46, 21, -2),
    ],
  },
  "hero-row": {
    name: "Главный кадр",
    description: "Фото на пол-листа и три снимка на границе",
    format: "4:5",
    slots: 4,
    defaultStyle: "collage",
    build: (t) => [
      B(0, 0, 100, 63),
      P(4, 50, 30, 27, -5),
      P(35, 53, 30, 27, 2),
      P(66, 49, 30, 27, 6),
      T("title", t.title, 6, 83, 88, 7.5, "center"),
      T("meta", t.date, 6, 94, 88, 1.8, "center"),
    ],
  },
  sunset: {
    name: "Закат",
    description: "Четыре кадра лесенкой поверх фото моря и подпись от руки",
    format: "2:3",
    slots: 5,
    defaultStyle: "dreamy",
    build: (t) => [
      B(0, 0, 100, 100),
      P(12.2, 4.7, 42.9, 37.2),
      T("meta", "✧ ⋆ ✦ ⋆ ✧", 57, 28.2, 29, 2.4, "center"),
      P(42, 32.2, 45, 32),
      P(12.2, 48.1, 39.3, 31.4),
      P(51.5, 65.9, 36, 29.8),
      T("hand", t.note, 7, 78.5, 23, 3.6),
    ],
  },
  bloom: {
    name: "Тихая весна",
    description: "Четыре мягких кадра на льне и две тонкие подписи",
    format: "2:3",
    slots: 4,
    defaultStyle: "soft",
    build: (t) => [
      T("subtitle", t.subtitle, 7, 3.4, 30, 3.1),
      P(5.7, 11.5, 44.4, 42.6),
      P(51.6, 3, 44.4, 31.3),
      P(51.6, 35.2, 44.4, 44.8),
      P(5.7, 55.3, 44.4, 40.9),
      T("hand", t.note, 53, 86, 41.6, 3.1, "center"),
    ],
  },
  triptych: {
    name: "Три кадра",
    description: "Три снимка во всю ширину, один над другим",
    format: "9:16",
    slots: 3,
    defaultStyle: "minimal",
    build: () => [B(0, 0, 100, 33.2), B(0, 33.4, 100, 33.2), B(0, 66.8, 100, 33.2)],
  },
  "night-out": {
    name: "Ночь с друзьями",
    description: "Полароиды на скрепках и плёночная лента рядом",
    format: "9:16",
    slots: 7,
    defaultStyle: "polaroid",
    build: (t) => [
      P(1, 0.6, 48, 24.6, -3),
      P(1.5, 26.4, 48, 23.4, -3),
      P(1.5, 50.4, 47, 23.6, 3),
      P(3, 74.6, 49, 24.6, -2),
      D("clip", 40, -0.4, 4.4, 8, "muted"),
      D("clip", 36, 23.6, 4.4, 6, "muted"),
      D("clip", 39, 48.6, 4.4, 10, "muted"),
      D("clip", 37, 73, 4.4, 4, "muted"),
      B(51.5, 1.6, 46.5, 30),
      T("meta", t.label, 51.5, 32.6, 46.5, 1.3),
      B(51.5, 35, 46.5, 30),
      T("meta", t.label, 51.5, 65.9, 46.5, 1.3),
      B(51.5, 68.3, 46.5, 30),
    ],
  },
  "sea-grid": {
    name: "Море и мы",
    description: "Фото волны на весь фон и сетка снимков сбоку",
    format: "9:16",
    slots: 8,
    defaultStyle: "minimal",
    build: () => [
      B(0, 0, 100, 100),
      P(62.5, 0, 37.5, 17.7),
      P(31.7, 17.7, 32.2, 41.9),
      P(63.9, 17.7, 36.1, 21),
      P(63.9, 38.8, 36.1, 20.8),
      P(31.7, 59.6, 32.2, 20.7),
      P(63.9, 59.6, 36.1, 40.4),
      P(29.2, 80.3, 34.7, 19.7),
    ],
  },
  "bw-wedding": {
    name: "Чёрно-белая классика",
    description: "Шесть кадров внахлёст на чёрном, как плёночная фотосессия",
    format: "2:3",
    slots: 6,
    defaultStyle: "kodak",
    build: (t) => [
      B(0, 0, 100, 42),
      B(0, 69.35, 100, 30.65),
      B(45.65, 10.16, 47.28, 59.19),
      B(2.99, 54.95, 41.85, 34.45),
      B(13.32, 42.14, 41.58, 17.76),
      B(38.18, 74.47, 50.95, 23.06),
      T("title", t.title, 4, 2.5, 40, 8, "left", -3, "paper"),
    ],
  },
  "kodak-strip": {
    name: "Плёнка Kodak",
    description: "Три кадра слева и плёночная лента Kodak справа",
    format: "9:16",
    slots: 7,
    defaultStyle: "kodak",
    build: (t) => [
      B(0, 0, 50, 33.4),
      B(0, 33.4, 50, 33.2),
      B(0, 66.6, 50, 33.4),
      ...[0.35, 28.7, 57.05, 85.4].map((y) => D("filmtext", 52, y, 47, 0, "accent", "KODAK PORTRA 400      43      KODAK PORTRA 400")),
      ...[27.15, 55.5, 83.6].map((y) => D("filmtext", 62, y, 20, 0, "accent", "▸ 2")),
      B(52.7, 1.9, 45.1, 24.6),
      B(52.7, 30.35, 45.1, 24.5),
      B(52.7, 58.7, 45.1, 24.2),
      B(52.7, 86.8, 45.1, 13.2),
      T("title", t.title, 3, 44, 44, 8.5, "center", -3),
      T("hand", t.note, 3, 56, 44, 3.6, "center", -3),
    ],
  },
  "kodak-big": {
    name: "Кадр в центре",
    description: "Большой плёночный кадр с подписью и ряды снимков сверху и снизу",
    format: "9:16",
    slots: 7,
    defaultStyle: "kodak",
    build: (t) => [
      B(0, 0, 31, 22.7),
      B(34.1, 0, 32.5, 22.8),
      B(69.8, 0, 30.2, 22.8),
      D("filmtext", 1.5, 25.1, 97, 0, "paper", "KODAK PORTRA 400                       43                       KODAK P"),
      B(0, 27.5, 100, 45.1),
      D("filmtext", 15, 73.5, 20, 0, "accent", "▸ 2"),
      D("filmtext", 1.5, 75.1, 97, 0, "paper", "KODAK PORTRA 400   43   KODAK PORTRA 400   43   KODAK PORTRA 400"),
      B(0, 76.5, 30.7, 23.5),
      B(34.2, 76.5, 32.4, 23.5),
      B(69.8, 76.5, 30.2, 23.5),
      T("title", t.title, 8, 42, 84, 8.5, "center"),
      T("subtitle", t.subtitle, 10, 52, 80, 3.2, "center"),
    ],
  },
  "bw-grid": {
    name: "Сетка 21",
    description: "Двадцать один кадр встык и надпись по центру",
    format: "9:16",
    slots: 21,
    defaultStyle: "night",
    build: (t) => [
      ...Array.from({ length: 21 }, (_, i) => {
        const r = Math.floor(i / 3)
        const c = i % 3
        return B([0, 33.5, 66.9][c], r * 14.286 + 0.16, [32.9, 32.9, 33.1][c], 13.96)
      }),
      T("hand", t.note, 25, 42.4, 50, 6, "center", -4),
      T("title", t.title, 4, 47, 92, 7.8, "center"),
    ],
  },
  "paper-birthday": {
    name: "Белые рамки",
    description: "Семь кадров в бумажных рамках и надпись от руки поверх",
    format: "9:16",
    slots: 7,
    defaultStyle: "collage",
    build: (t) => [
      ...framesOf(REF.paperBirthday),
      D("tape", -1, 28, 13, -25, "accent2"),
      T("title", t.title, 6, 57.5, 62, 9.5, "left", -4, "ink"),
    ],
  },
  grid4: {
    name: "Четыре кадра",
    description: "Сетка 2 × 2 и подпись на стыке",
    format: "9:16",
    slots: 4,
    defaultStyle: "night",
    build: (t) => [...slotsOf(REF.roma), T("title", t.title, 25, 47.9, 50, 5.2, "center"), T("meta", t.date, 15, 46.4, 76, 1.9)],
  },
  "travel-mosaic": {
    name: "Мозаика поездки",
    description: "Двенадцать кадров вразбег и название места от руки",
    format: "9:16",
    slots: 12,
    defaultStyle: "dreamy",
    build: (t) => [...slotsOf(REF.vietnam), T("title", t.title, 24, 47.4, 52, 8, "center", -3)],
  },
  "stack-caption": {
    name: "Три вида",
    description: "Три кадра во всю ширину и короткая подпись с меткой места",
    format: "9:16",
    slots: 3,
    defaultStyle: "night",
    build: (t) => [...slotsOf(REF.como), T("subtitle", t.subtitle, 16, 47.3, 50, 2.7)],
  },
  "stack-quote": {
    name: "Цитата",
    description: "Три кадра во всю ширину и строка машинописного текста",
    format: "9:16",
    slots: 3,
    defaultStyle: "quiet",
    build: (t) => [...slotsOf(REF.golden), T("subtitle", t.subtitle, 4, 48.8, 92, 3.9, "center")],
  },
  heart: {
    name: "Сердце",
    description: "Восемнадцать снимков сердцем и словарное определение",
    format: "9:16",
    slots: 18,
    defaultStyle: "minimal",
    build: (t) => [
      ...slotsOf(REF.home),
      T("title", t.title, 68, 83.6, 30, 7.2),
      T("meta", t.date, 68.4, 88.6, 28, 1.25),
      T("subtitle", t.subtitle, 68.4, 90.6, 27, 1.35),
    ],
  },
  "kraft-notes": {
    name: "Крафт и заметки",
    description: "Скрапбук на крафте: записки, скотч и сухоцветы",
    format: "2:3",
    slots: 7,
    defaultStyle: "minimal",
    build: () => [
      art(REF.kraft),
      ...slotsOf(REF.kraft).map((p, i) => (i === 2 ? { ...p, rot: -6 } : i === 5 ? { ...p, rot: 4 } : p)),
      ...REF.kraft.overlays.map((b) => art(REF.kraft, b)),
    ],
  },
  "quote-bw": {
    name: "Цитата о памяти",
    description: "Четыре снимка на скотче и цитата прописью",
    format: "2:3",
    slots: 4,
    defaultStyle: "collage",
    build: (t) => [
      ...framesOf(REF.memoriesQuote),
      D("tape", 79, 12, 17, 28, "accent2"),
      D("tape", 2, 57, 17, -18, "accent2"),
      T("title", t.title, 20, 49.5, 72, 6.8, "center", -8),
    ],
  },
  "dark-scrapbook": {
    name: "Тёмный скрапбук",
    description: "Ретро-кадры на чёрном с цветами и записками",
    format: "9:16",
    slots: 7,
    defaultStyle: "minimal",
    build: () => [art(REF.roadTrip), ...slotsOf(REF.roadTrip), ...REF.roadTrip.overlays.map((b) => art(REF.roadTrip, b))],
  },
  "grid9-dump": {
    name: "Dump 3 × 3",
    description: "Девять кадров и надпись в два шрифта",
    format: "9:16",
    slots: 9,
    defaultStyle: "dump",
    build: (t) => [
      ...slotsOf(REF.travelDump),
      T("title", t.title, 15, 44.6, 70, 6.6, "center"),
      T("hand", t.note, 4, 46, 92, 21, "center", -7),
    ],
  },
  "trail-notes": {
    name: "Заметки в пути",
    description: "Плотная сетка снимков и три бумажные карточки с текстом",
    format: "9:16",
    slots: 14,
    defaultStyle: "notes",
    build: (t) => [
      art(REF.trail),
      ...slotsOf(REF.trail),
      ...TRAIL_CARDS.map((b) => {
        const [x, y, w] = rect(b, REF.trail.size)
        return D("card", x, y, w, 0, "paper", undefined, (b[3] - b[1]) / (b[2] - b[0]))
      }),
      T("title", t.title, 18.5, 16.3, 20.8, 3, "center"),
      T("subtitle", t.subtitle, 60.4, 41.3, 21, 2.5),
      T("hand", t.note, 18.7, 72, 30.2, 2.4, "center"),
    ],
  },
  "wedding-cover": {
    name: "Обложка журнала",
    description: "Один кадр на всю страницу и крупный заголовок, как свадебный номер глянца",
    format: "2:3",
    slots: 1,
    defaultStyle: "dump",
    build: (t) => [
      B(0, 0, 100, 100),
      T("title", "Married", 3, 3.2, 94, 17.5, "center"),
      T("meta", `The wedding issue · ${t.date}`, 10, 16.8, 80, 1.9, "center"),
      D("line", 30, 84.6, 40, 0, "paper"),
      T("subtitle", t.title, 6, 86.4, 88, 4.6, "center"),
      T("hand", t.note, 6, 91.6, 88, 5.2, "center"),
    ],
  },
  "save-the-date": {
    name: "Save the date",
    description: "Кадр-арка в центре, два снимка по бокам и дата под именами",
    format: "4:5",
    slots: 3,
    defaultStyle: "minimal",
    build: (t) => [
      T("hand", "Save the date", 8, 4.5, 84, 8.6, "center"),
      P(27, 17, 46, 52, 0, "arch"),
      P(4.5, 37, 19.5, 25, -4),
      P(76, 37, 19.5, 25, 4),
      T("title", t.title, 6, 72.5, 88, 7.4, "center"),
      D("line", 32, 83.2, 36, 0, "ink"),
      T("meta", `${t.date} · ${t.place}`, 6, 85.6, 88, 2.1, "center"),
      T("subtitle", "Приглашение будет позже", 6, 90.6, 88, 2.6, "center"),
    ],
  },
  "wedding-program": {
    name: "Программа дня",
    description: "Четыре кадра зигзагом и время каждого момента свадьбы",
    format: "9:16",
    slots: 4,
    defaultStyle: "minimal",
    build: (t) => {
      const rows: [string, string][] = [
        ["14:00", "Церемония"],
        ["16:00", "Фотопрогулка"],
        ["18:30", "Ужин"],
        ["21:00", "Первый танец"],
      ]
      return [
        T("meta", "Программа дня", 6, 3.2, 88, 2, "center"),
        T("title", t.title, 6, 5.6, 88, 8, "center"),
        ...rows.flatMap(([time, label], i) => {
          const y = 16 + i * 21
          const left = i % 2 === 0
          return [
            P(left ? 6 : 50, y, 44, 18.5, left ? -1.5 : 1.5),
            T("title", time, left ? 56 : 6, y + 5, 38, 9, left ? "left" : "right"),
            T("hand", label, left ? 56 : 6, y + 10.8, 38, 4.4, left ? "left" : "right"),
          ]
        }),
      ]
    },
  },
  "wedding-details": {
    name: "Детали",
    description: "Шесть деталей дня с подписями: кольца, букет, платье и другие",
    format: "4:5",
    slots: 6,
    defaultStyle: "pinterest",
    build: (t) => {
      const labels = ["кольца", "букет", "платье", "туфли", "приглашение", "торт"]
      return [
        T("hand", "the details", 6, 2.6, 88, 9.5, "center"),
        ...labels.flatMap((label, i) => {
          const col = i % 3
          const x = [5, 36.5, 68][col]
          const y = (i < 3 ? 15 : 55) + (col === 1 ? 4 : 0)
          return [P(x, y, 27, 30), T("meta", label, x, y + 31, 27, 1.7, "center")]
        }),
        T("subtitle", `${t.title} · ${t.date}`, 6, 95, 88, 2.2, "center"),
      ]
    },
  },
  "wedding-forever": {
    name: "Forever",
    description: "Два высоких кадра и один широкий, по стыку надпись прописью",
    format: "9:16",
    slots: 3,
    defaultStyle: "kodak",
    build: (t) => [
      B(0, 0, 49.6, 58),
      B(50.4, 0, 49.6, 58),
      B(0, 58.6, 100, 41.4),
      T("title", "forever", 0, 49.6, 100, 21, "center", -5),
      T("subtitle", t.title, 6, 91.2, 88, 3.6, "center"),
      T("meta", t.date, 6, 95.6, 88, 1.8, "center"),
    ],
  },
  "wedding-scatter": {
    name: "Снимки на скотче",
    description: "Пять снимков в белых рамках внахлёст, имена прописью и цветы",
    format: "9:16",
    slots: 5,
    defaultStyle: "collage",
    build: (t) => [
      T("title", t.title, 5, 3.5, 90, 10, "center", -2),
      T("meta", t.date, 5, 12.4, 90, 1.9, "center"),
      P(5, 17, 52, 25, -4),
      P(47, 24, 47, 23, 5),
      P(9, 44.5, 45, 22, 3),
      P(50, 49, 45, 25, -3),
      P(13, 70.5, 60, 23, -2),
      D("tape", 22, 15.8, 16, -8, "accent2"),
      D("tape", 66, 22.8, 15, 9, "accent2"),
      D("tape", 63, 47.8, 14, -6, "accent2"),
      D("tape", 35, 69.4, 16, 4, "accent2"),
      D("flower", 78, 74, 13, 12, "accent2"),
      D("leaf", 86, 78, 8, 24, "muted"),
      T("hand", t.note, 6, 95, 88, 4.2, "center", -2),
    ],
  },
  "wedding-mood": {
    name: "Свадебный мудборд",
    description: "Семь кадров колонками, как доска в Pinterest, и карточка с датой",
    format: "2:3",
    slots: 7,
    defaultStyle: "pinterest",
    build: (t) => [
      T("title", t.title, 4, 3.2, 62, 6.4),
      T("meta", t.place, 66, 4.6, 30, 1.7, "right"),
      P(4, 12, 29, 26),
      P(4, 40, 29, 20),
      P(4, 62, 29, 26),
      P(35.5, 12, 29, 18),
      D("card", 35.5, 32, 29, 0, "paper", undefined, (18 * 1.5) / 29),
      T("hand", "love story", 35.5, 36.2, 29, 6.4, "center", -4),
      T("meta", t.date, 35.5, 44.6, 29, 1.6, "center"),
      P(35.5, 52, 29, 36),
      P(67, 12, 29, 30),
      P(67, 44, 29, 44),
      T("subtitle", t.note, 4, 91.4, 92, 2.6, "center"),
    ],
  },
  "wedding-letter": {
    name: "Приглашение",
    description: "Большой кадр, письмо гостям, дата, место и маленький снимок",
    format: "4:5",
    slots: 2,
    defaultStyle: "minimal",
    build: (t) => [
      P(5, 5, 55, 90),
      T("meta", "Дорогие гости", 64, 8, 32, 1.8),
      T("hand", "Мы будем счастливы разделить с вами этот день", 64, 12.5, 32, 4.4),
      T("title", t.title, 64, 42, 32, 6.4),
      D("line", 64, 59.4, 32, 0, "ink"),
      T("meta", t.date, 64, 61.6, 32, 1.8),
      T("meta", t.place, 64, 65.4, 32, 1.8),
      P(64, 72, 32, 23, 2),
    ],
  },
  "just-married": {
    name: "Just married",
    description: "Шесть кадров встык и бумажная карточка с именами по центру",
    format: "4:5",
    slots: 6,
    defaultStyle: "minimal",
    build: (t) => [
      B(0, 0, 49.6, 32.9),
      B(50.4, 0, 49.6, 32.9),
      B(0, 33.55, 49.6, 32.9),
      B(50.4, 33.55, 49.6, 32.9),
      B(0, 67.1, 49.6, 32.9),
      B(50.4, 67.1, 49.6, 32.9),
      D("card", 26, 38.5, 48, 0, "paper", undefined, (23 * 1.25) / 48),
      T("hand", "just married", 26, 41.5, 48, 6, "center"),
      T("title", t.title, 26, 49.2, 48, 4.6, "center"),
      T("meta", t.date, 26, 56.4, 48, 1.6, "center"),
    ],
  },
  "torn-stack": {
    name: "Рваные края",
    description: "Четыре кадра встык, швы закрыты полосками рваной бумаги",
    format: "9:16",
    slots: 4,
    defaultStyle: "dreamy",
    build: (t) => [
      B(0, 0, 50.6, 42.6),
      B(49.4, 0, 50.6, 42.6),
      B(0, 41, 100, 30),
      B(0, 69.6, 100, 30.4),
      D("torn", 11, 19.9, 78, 91.5, "paper"),
      D("torn", -2, 40.1, 104, -1.2, "paper"),
      D("torn", -2, 68.6, 104, 0.9, "paper"),
      T("hand", t.note, 6, 91, 88, 6.5, "center", -3),
    ],
  },
  "hike-journal": {
    name: "Походный дневник",
    description: "Два снимка в рамках, заголовок от руки, машинописный рассказ и пейзаж с рваным краем",
    format: "4:5",
    slots: 3,
    defaultStyle: "notes",
    build: (t) => [
      D("card", 8.4, 5.2, 53.1, 0, "paper", undefined, 1.015),
      B(10.5, 7.4, 48.9, 38.8),
      D("postmark", 46, 2.6, 17, -8, "ink"),
      T("title", t.title, 63, 9.5, 35, 7.6, "center", 6),
      B(0, 63.5, 100, 36.5),
      D("torn", -2, 61.8, 104, -0.6, "paper"),
      D("torn", -2, 61, 104, 0.5, "bg"),
      D("card", 55, 29.6, 46, 0, "paper", undefined, 0.915),
      BW(57.2, 31.3, 40.5, 31),
      D("clip", 92.5, 26.8, 4.6, 6, "muted"),
      T("subtitle", t.subtitle, 4.3, 50, 48.5, 2.55),
      T("meta", t.place, 10, 94.3, 80, 1.8, "center", 0, "paper"),
    ],
  },
  "ride-journal": {
    name: "Велодневник",
    description: "Полароид, плёночные кадры на скотче, рассказ о маршруте и ч/б пейзаж",
    format: "4:5",
    slots: 4,
    defaultStyle: "notes",
    build: (t) => [
      D("card", 0.5, 4.3, 56, -1.5, "paper", undefined, 0.99),
      { ...B(2.5, 6.4, 52, 38.4), rot: -1.5 },
      D("tape", 21, 2.2, 15, -4, "accent2"),
      BW(0, 76.5, 66, 23.5),
      D("torn", -3, 75, 72, -1, "paper"),
      D("torn", -3, 74.2, 72, 0.6, "bg"),
      D("card", 53, 12.8, 48, 1.5, "paper", undefined, 1.08),
      { ...BW(55.5, 14.8, 43, 36.4), rot: 1.5 },
      D("tape", 80, 11.5, 14, 8, "accent2"),
      D("card", 44, 48.5, 54.5, 1.5, "paper", undefined, 1.04),
      { ...B(46.8, 50.6, 49, 41.6), rot: 1.5 },
      filmLabel("13 ▸", 54.2, 24, 30, 125),
      filmLabel("13A ▸", 54.2, 46, 30, 125),
      filmLabel("14 ▸", 45.4, 70, 30, 125),
      filmLabel("14A ▸", 45.4, 98, 30, 125),
      filmLabel("FILM NEGATIVE", 97.2, 92, 44, 125),
      T("title", t.title, 4.8, 50.2, 44, 6.5),
      T("subtitle", t.subtitle, 4.8, 58.6, 38.5, 2.45),
      T("meta", t.place, 2, 94.8, 62, 1.7, "center", 0, "paper"),
    ],
  },
  "grad-torn": {
    name: "Рваная бумага",
    description: "Четыре кадра, полоса рваной бумаги с заголовком прописью, бант и цветок",
    format: "4:5",
    slots: 4,
    defaultStyle: "collage",
    build: (t) => [
      ...slotsOf(REF.gradTorn),
      D("torn", -2, -3, 104, -1.5, "paper", undefined, 0.075),
      D("torn", -2, 20.6, 104, 0, "paper", undefined, 0.3),
      D("torn", -5, 90.4, 110, 5.8, "paper", undefined, 0.2),
      D("sparkle", 7, 20.4, 4, 0, "accent"),
      D("sparkle", 12.4, 23.2, 2.4, 0, "accent"),
      D("bow", 87, 36, 13, -12, "muted"),
      D("flower", 26, 80, 13, -10, "accent2"),
      D("leaf", 36, 81.5, 7, 22, "accent"),
      T("title", t.title, 1, 27.6, 64, 10.8, "center", -3, "accent"),
      T("subtitle", t.subtitle, 64, 31.6, 31, 2.6, "right"),
    ],
  },
  "grad-film": {
    name: "Плёнка выпускника",
    description: "Четыре кадра в чёрной плёнке на размытом фоне и подпись прописью",
    format: "9:16",
    slots: 4,
    defaultStyle: "kodak",
    build: (t) => {
      const r = REF.gradFilm
      const frame: Box = [100, 80, 340, 100]
      const H = 177.8
      return [
        art(r),
        ...slotsOf(r),
        // film edges and the caption of the original are covered by its own black frame and blurred background
        patch(r, frame, [74, 107, 94, 1006]),
        patch(r, frame, [349, 107, 386, 1006]),
        patch(r, frame, [641, 107, 662, 1006]),
        patch(r, [0, 1245, 736, 1300], [0, 1040, 736, 1245]),
        filmLabel("KODAK GOLD 200", 49.9, 30, 44, H),
        filmLabel("18 ▸", 49.9, 66, 30, H),
        filmLabel("KODAK GOLD 200", 49.9, 92, 44, H),
        filmLabel("003", 88.5, 15, 30, H),
        filmLabel("KODAK GOLD 200", 88.5, 45, 44, H),
        filmLabel("KODAK GOLD 200", 88.5, 104, 44, H),
        filmLabel("KODAK GOLD 200", 11.4, 112, 44, H),
        T("title", t.title, 4, 80.4, 92, 9.5, "center", 0, "accent"),
        D("line", 10, 91.2, 80, 0, "accent"),
        T("meta", t.date, 10, 92.4, 80, 3.4, "center", 0, "accent"),
      ]
    },
  },
  "grad-bows": {
    name: "Банты и ч/б",
    description: "Шесть чёрно-белых кадров на белом, два банта и заголовок прописью",
    format: "9:16",
    slots: 6,
    defaultStyle: "collage",
    build: (t) => [
      ...slotsOf(REF.gradBows),
      T("title", t.title, 4, 1.4, 62, 11, "center", -2),
      D("star", 48, 8.4, 3, 0, "accent2"),
      D("star", 19, 17.2, 2.6, 0, "accent2"),
      D("star", 50, 16.9, 2.6, 0, "accent2"),
      D("bow", 75, 0, 26, 4, "ink"),
      D("bow", -1, 71, 25, -6, "ink"),
    ],
  },
  blank: {
    name: "Свободный лист",
    description: "Четыре места под ваши фото",
    format: "4:5",
    slots: 4,
    defaultStyle: "minimal",
    build: (t) => [
      P(6, 6, 43, 39),
      P(51, 6, 43, 39),
      P(6, 47, 43, 39),
      P(51, 47, 43, 39),
      T("title", t.title, 6, 89, 88, 5.5, "center"),
    ],
  },
}

export const LAYOUT_KEYS = Object.keys(LAYOUTS) as LayoutKey[]
