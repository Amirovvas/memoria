"use client"

import { Check, ImagePlus, Loader2, Plus, Sparkles, Type, Upload, Wand2, X } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { CATEGORY_BY_SLUG, TEMPLATES, captionsFor, templateDoc, templatesFor } from "@/src/lib/catalog"
import { applyLayout, emptySlotCount, newTextEl, photoEls, restyle, uid } from "@/src/lib/collage/build"
import { LAYOUTS, LAYOUT_KEYS } from "@/src/lib/collage/layouts"
import { BACKGROUND_SWATCHES, DECOS, FORMATS, PALETTES, PATTERNS, STYLES, resolveColor } from "@/src/lib/collage/styles"
import type { CollageDoc, DecoEl, DecoKey, PaletteKey, PatternKey, StyleKey, TextEl, TextRole } from "@/src/lib/collage/types"
import { CollageCanvas } from "../collage/CollageCanvas"
import { DecoArt } from "../collage/Deco"
import { useApp } from "../providers/AppProvider"
import { useEditor } from "./context"

function Group({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`mb-7 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="eyebrow">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/* ---------------- Templates ---------------- */

export function TemplatesPanel() {
  const { doc, commit, category } = useEditor()
  const cat = CATEGORY_BY_SLUG[category] ? category : "travel"
  const templates = templatesFor(cat).length ? templatesFor(cat) : TEMPLATES.slice(0, 8)
  const photosKey = photoEls(doc)
    .map((p) => p.src?.slice(-24))
    .join("|")

  // Each composition is previewed with the user's own photos and texts.
  const layouts = useMemo(
    () => LAYOUT_KEYS.filter((k) => k !== "blank").map((k) => ({ key: k, doc: applyLayout(doc, k) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photosKey, doc.style, doc.palette, doc.bg, doc.pattern],
  )

  return (
    <>
      <Group title={`Шаблоны · ${CATEGORY_BY_SLUG[cat].short}`}>
        <div className="grid grid-cols-2 gap-2.5">
          {templates.map((t) => {
            const active = doc.layout === t.layout && doc.style === t.style && doc.palette === t.palette
            return (
              <button
                key={t.id}
                onClick={() => commit((d) => ({ ...restyle(applyLayout(d, t.layout), { style: t.style, palette: t.palette }), look: t.look }))}
                className={`group relative overflow-hidden rounded-xl ring-1 transition ${active ? "ring-2 ring-accent" : "ring-line hover:ring-line-strong"}`}
                title={t.title}
              >
                <CollageCanvas doc={templateDoc(t)} imgWidth={220} />
                {active ? (
                  <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-accent text-accent-ink">
                    <Check size={12} />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Композиция с вашими фото">
        <div className="grid grid-cols-2 gap-2.5">
          {layouts.map(({ key, doc: d }) => (
            <button
              key={key}
              onClick={() => commit((cur) => applyLayout(cur, key))}
              className="text-left"
              title={LAYOUTS[key].description}
            >
              <span
                className={`block overflow-hidden rounded-xl ring-1 transition ${doc.layout === key ? "ring-2 ring-accent" : "ring-line hover:ring-line-strong"}`}
              >
                <CollageCanvas doc={d} imgWidth={200} />
              </span>
              <span className="mt-1.5 block truncate text-xs font-semibold">{LAYOUTS[key].name}</span>
              <span className="block text-[11px] text-muted">{LAYOUTS[key].slots} фото</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Стиль оформления">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STYLES) as StyleKey[]).map((k) => (
            <button key={k} className="chip" data-active={doc.style === k ? "true" : undefined} onClick={() => commit((d) => restyle(d, { style: k }))}>
              {STYLES[k].name}
            </button>
          ))}
        </div>
      </Group>
    </>
  )
}

/* ---------------- Photos ---------------- */

export const PHOTO_MIME = "application/x-memoria-photo"

export function PhotosPanel() {
  const { doc, selected, placePhoto, autoFill, openFilePicker } = useEditor()
  const { uploads, removeUpload, addDemoPhotos } = useApp()
  const [demoLoading, setDemoLoading] = useState(false)
  const slots = photoEls(doc)
  const empty = emptySlotCount(doc)
  const filled = slots.length - empty
  const used = new Set(slots.map((s) => s.src))
  const target = selected?.kind === "photo" ? selected : null

  return (
    <>
      <button
        onClick={() => openFilePicker()}
        className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-line-strong bg-bg px-4 py-7 text-center transition-colors hover:border-accent hover:bg-accent-soft/40"
      >
        <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-ink transition-transform group-hover:scale-105">
          <Upload size={19} />
        </span>
        <span className="text-[15px] font-semibold">Загрузить фото</span>
        <span className="text-xs text-muted">или перетащите файлы сюда · JPG, PNG, HEIC</span>
      </button>
      <button
        className="btn btn-sm btn-ghost mt-2 w-full text-muted"
        disabled={demoLoading}
        onClick={async () => {
          setDemoLoading(true)
          const added = await addDemoPhotos(8)
          setDemoLoading(false)
          if (added.length) autoFill(added.map((a) => a.src))
        }}
      >
        {demoLoading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
        Попробовать на демо-фото
      </button>

      <div className="mt-5 rounded-2xl bg-surface-2 p-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            Заполнено {filled} из {slots.length}
          </span>
          {empty ? <span className="text-xs text-accent">ещё {empty}</span> : <span className="text-xs text-sage">готово ✓</span>}
        </div>
        <div className="mt-2.5 flex gap-1">
          {slots.map((s) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${s.src ? "bg-accent" : "bg-surface-3"}`} />
          ))}
        </div>
        <button className="btn btn-sm btn-primary mt-4 w-full" disabled={!uploads.length} onClick={() => autoFill()}>
          <Wand2 size={14} /> Разместить автоматически
        </button>
        {!uploads.length ? <p className="mt-2 text-center text-[11px] text-muted">Сначала загрузите фотографии</p> : null}
      </div>

      {uploads.length ? (
        <Group title={`Загружено · ${uploads.length}`} className="mt-7">
          <p className="-mt-1 mb-3 text-xs leading-relaxed text-muted">
            {target
              ? "Нажмите на фото — оно встанет в выбранную рамку."
              : "Перетащите фото на рамку коллажа или нажмите, чтобы добавить в свободное место."}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {uploads.map((u) => (
              <div key={u.id} className="group relative">
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(PHOTO_MIME, u.src)
                    e.dataTransfer.effectAllowed = "copy"
                  }}
                  onClick={() => (target ? placePhoto(target.id, u.src) : autoFill([u.src]))}
                  className="block aspect-square w-full overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line transition hover:ring-accent"
                  title={u.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.src} alt={u.name} className="h-full w-full object-cover" draggable={false} />
                </button>
                {used.has(u.src) ? (
                  <span className="pointer-events-none absolute bottom-1 left-1 grid size-4 place-items-center rounded-full bg-accent text-accent-ink">
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : null}
                <button
                  onClick={() => removeUpload(u.id)}
                  className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 max-lg:opacity-100"
                  aria-label="Убрать из загруженных"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </Group>
      ) : (
        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          Совет: загрузите сразу 6–8 снимков — мы разложим их по рамкам шаблона, сохранив композицию.
        </p>
      )}
    </>
  )
}

/* ---------------- Text ---------------- */

const ROLE_LABEL: Record<TextRole, string> = { title: "Заголовок", subtitle: "Подзаголовок", hand: "Заметка", meta: "Дата / подпись" }

function TextField({ el }: { el: TextEl }) {
  const { updateEl, select, selected } = useEditor()
  const active = selected?.id === el.id
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">{ROLE_LABEL[el.role]}</span>
      <textarea
        value={el.text}
        rows={el.text.length > 28 ? 2 : 1}
        onFocus={() => select(el.id)}
        onChange={(e) => updateEl(el.id, { text: e.target.value })}
        className={`w-full resize-none rounded-xl border bg-surface px-3 py-2 text-sm leading-snug outline-none transition-colors ${
          active ? "border-accent" : "border-line focus:border-line-strong"
        }`}
      />
    </label>
  )
}

const AI_TOPICS = [
  { key: "travel", label: "Путешествия" },
  { key: "love", label: "Любовь" },
  { key: "birthday", label: "День рождения" },
  { key: "memories", label: "Воспоминания" },
  { key: "friends", label: "Друзья" },
]

export function CaptionAssistant({ compact, onPick }: { compact?: boolean; onPick: (text: string) => void }) {
  const { category } = useEditor()
  const [topic, setTopic] = useState(AI_TOPICS.some((t) => t.key === category) ? category : "travel")
  const [state, setState] = useState<"idle" | "thinking" | "done">("idle")
  const [round, setRound] = useState(0)
  const all = captionsFor(topic)
  const shown = Array.from({ length: Math.min(4, all.length) }, (_, i) => all[(i + round * 2) % all.length])

  const run = () => {
    setState("thinking")
    setRound((r) => r + 1)
    setTimeout(() => setState("done"), 650)
  }

  return (
    <div className={compact ? "" : "rounded-2xl border border-line bg-bg p-4"}>
      {!compact ? (
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-accent">
            <Sparkles size={14} />
          </span>
          <div>
            <p className="text-sm font-semibold">AI-помощник подписей</p>
            <p className="text-[11px] text-muted">Короткие подписи под настроение</p>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {AI_TOPICS.map((t) => (
          <button
            key={t.key}
            className="chip h-7 px-2.5 text-xs"
            data-active={topic === t.key ? "true" : undefined}
            onClick={() => {
              setTopic(t.key)
              setState("idle")
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {state === "idle" ? (
        <button className="btn btn-sm btn-secondary mt-3 w-full" onClick={run}>
          <Sparkles size={14} className="text-accent" /> Предложить подписи
        </button>
      ) : state === "thinking" ? (
        <div className="mt-3 space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-9 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-3 space-y-1.5">
          {shown.map((c) => (
            <button
              key={c}
              onClick={() => onPick(c)}
              className="animate-fade-up flex w-full items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2 text-left text-sm ring-1 ring-line transition hover:ring-accent"
            >
              <span>{c}</span>
              <Plus size={14} className="shrink-0 text-muted" />
            </button>
          ))}
          <button className="w-full py-1.5 text-xs font-semibold text-muted hover:text-ink" onClick={run}>
            Ещё варианты
          </button>
        </div>
      )}
    </div>
  )
}

export function TextPanel() {
  const { doc, addEl, updateEl, selected } = useEditor()
  const texts = doc.elements.filter((e): e is TextEl => e.kind === "text")
  const add = (role: TextRole, text: string) => addEl(newTextEl(doc, role, text))
  const pick = (text: string) => {
    const target = selected?.kind === "text" ? selected : texts.find((t) => t.role === "title")
    if (target) updateEl(target.id, { text })
    else add("title", text)
  }

  return (
    <>
      <Group title="Добавить текст">
        <div className="space-y-2">
          <button onClick={() => add("title", "Новый заголовок")} className="flex w-full items-center rounded-xl bg-surface-2 px-4 py-3 text-left font-serif text-2xl transition hover:bg-surface-3">
            Заголовок
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => add("subtitle", "Подзаголовок")} className="rounded-xl bg-surface-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-surface-3">
              Подзаголовок
            </button>
            <button onClick={() => add("hand", "заметка от руки")} className="rounded-xl bg-surface-2 px-3 py-2 text-left font-hand text-xl leading-tight transition hover:bg-surface-3">
              от руки
            </button>
            <button onClick={() => add("meta", "Июль 2025")} className="col-span-2 rounded-xl bg-surface-2 px-3 py-2.5 text-left font-mono text-xs uppercase tracking-[0.18em] transition hover:bg-surface-3">
              Дата · место
            </button>
          </div>
        </div>
      </Group>

      {texts.length ? (
        <Group title="Тексты на коллаже">
          <div className="space-y-3">
            {texts.map((t) => (
              <TextField key={t.id} el={t} />
            ))}
          </div>
        </Group>
      ) : null}

      <CaptionAssistant onPick={pick} />
    </>
  )
}

/* ---------------- Background ---------------- */

export function BackgroundPanel() {
  const { doc, commit } = useEditor()
  const setBg = (bg: string) => commit((d) => ({ ...d, bg, bgFromPalette: false }))

  return (
    <>
      <Group title="Цвет фона">
        <div className="grid grid-cols-6 gap-2">
          {BACKGROUND_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => setBg(c)}
              className={`aspect-square rounded-full ring-1 ring-black/10 transition hover:scale-110 ${doc.bg === c ? "outline-2 outline-offset-2 outline-accent" : ""}`}
              style={{ background: c }}
              aria-label={`Фон ${c}`}
            />
          ))}
          <label
            className="relative grid aspect-square cursor-pointer place-items-center rounded-full border border-dashed border-line-strong text-muted hover:text-ink"
            title="Свой цвет"
          >
            <Plus size={14} />
            <input type="color" value={doc.bg} onChange={(e) => setBg(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
          </label>
        </div>
      </Group>

      <Group title="Палитра коллажа">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PALETTES) as PaletteKey[]).map((k) => {
            const p = PALETTES[k]
            const active = doc.palette === k
            return (
              <button
                key={k}
                onClick={() => commit((d) => restyle({ ...d, bgFromPalette: true }, { palette: k }))}
                className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition ${active ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong"}`}
              >
                <span className="flex h-8 w-11 shrink-0 overflow-hidden rounded-md ring-1 ring-black/10">
                  <span className="flex-[2]" style={{ background: p.bg }} />
                  <span className="flex-1" style={{ background: p.accent }} />
                  <span className="flex-1" style={{ background: p.ink }} />
                </span>
                <span className="text-[13px] font-semibold">{p.name}</span>
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Текстура бумаги">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PATTERNS) as PatternKey[]).map((k) => (
            <button key={k} className="chip" data-active={doc.pattern === k ? "true" : undefined} onClick={() => commit((d) => ({ ...d, pattern: k }))}>
              {PATTERNS[k]}
            </button>
          ))}
        </div>
      </Group>
    </>
  )
}

/* ---------------- Decor ---------------- */

const DECOR_GROUPS: { key: (typeof DECOS)[DecoKey]["group"]; title: string }[] = [
  { key: "travel", title: "Путешествия" },
  { key: "love", title: "Любовь" },
  { key: "party", title: "Праздник" },
  { key: "nature", title: "Природа" },
  { key: "paper", title: "Скрапбукинг" },
]

const DECO_WIDTH: Partial<Record<DecoKey, number>> = {
  tape: 16,
  ticket: 40,
  map: 34,
  stamp: 12,
  postmark: 18,
  confetti: 70,
  line: 40,
  lines: 30,
  note: 30,
  arrow: 13,
  scribble: 20,
  balloon: 7,
  pin: 4,
  clip: 5,
  torn: 70,
  bow: 14,
}

export function newDecoEl(doc: CollageDoc, deco: DecoKey): DecoEl {
  const w = DECO_WIDTH[deco] ?? 9
  const token = deco === "tape" ? "accent2" : deco === "note" || deco === "torn" ? "paper" : deco === "postmark" || deco === "line" ? "ink" : "accent"
  const h = w * DECOS[deco].ratio * FORMATS[doc.format].ratio
  return {
    id: uid(),
    kind: "deco",
    deco,
    x: 50 - w / 2,
    y: 46 - h / 2,
    w,
    rot: deco === "tape" ? -6 : 0,
    color: resolveColor(doc.palette, token),
    colorToken: token,
    label: deco === "ticket" ? CATEGORY_BY_SLUG.travel.texts.label : undefined,
  }
}

export function DecorPanel() {
  const { doc, addEl } = useEditor()
  const accent = PALETTES[doc.palette].accent
  return (
    <>
      {DECOR_GROUPS.map((g) => (
        <Group key={g.key} title={g.title}>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(DECOS) as DecoKey[])
              .filter((k) => DECOS[k].group === g.key && k !== "line")
              .map((k) => {
                const ratio = DECOS[k].ratio
                return (
                  <button
                    key={k}
                    onClick={() => addEl(newDecoEl(doc, k))}
                    className="grid aspect-square place-items-center rounded-xl bg-surface-2 transition hover:bg-surface-3"
                    title={DECOS[k].name}
                  >
                    <span className="block" style={{ width: `${Math.min(76, 70 / ratio)}%`, aspectRatio: `${1 / ratio}` }}>
                      <DecoArt deco={k} color={k === "tape" ? PALETTES[doc.palette].accent2 : accent} id={`pv-${k}`} />
                    </span>
                  </button>
                )
              })}
          </div>
        </Group>
      ))}
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Type size={13} /> Элемент появится в центре — перетащите его куда нужно.
      </p>
    </>
  )
}
