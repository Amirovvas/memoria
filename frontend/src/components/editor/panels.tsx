"use client"

import { Check, ImagePlus, Loader2, Plus, Sparkles, Type, Upload, Wand2, X } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { CATEGORY_BY_SLUG, TEMPLATES, captionsFor, templateDoc } from "@/src/lib/catalog"
import { applyLayout, buildDoc, emptySlotCount, newTextEl, photoEls, restyle, textsFromDoc, trayPhotos, uid } from "@/src/lib/collage/build"
import { LAYOUTS, LAYOUT_KEYS } from "@/src/lib/collage/layouts"
import { BACKGROUND_SWATCHES, DECOS, FORMATS, PALETTES, PATTERNS, STYLES, resolveColor } from "@/src/lib/collage/styles"
import type { CollageDoc, DecoEl, DecoKey, PaletteKey, PatternKey, StyleKey, TextEl, TextRole } from "@/src/lib/collage/types"
import { cropOf, isUserPhoto } from "@/src/lib/photos"
import { CollageCanvas } from "../collage/CollageCanvas"
import { DecoArt } from "../collage/Deco"
import { useApp } from "../providers/AppProvider"
import { cx } from "@/src/lib/cx"
import { useEditor } from "./context"
import s from "./panels.module.css"

function Group({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx(s.group, className)}>
      <div className={s.groupHead}>
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

  // Each composition is previewed as its original template, sample photos included, so the user's
  // own photos never look as if they already belonged to another collage. A pick still takes them along.
  const layouts = useMemo(() => {
    // compositions no template uses get the category's stock photos instead of empty frames
    const pool = [
      ...new Set(TEMPLATES.filter((t) => t.category === category).flatMap((t) => t.photos.filter((p): p is string => !!p && !cropOf(p)))),
    ]
    // repeated round, so a composition with more frames than samples still has none empty
    const stock = pool.length ? Array.from({ length: 24 }, (_, i) => pool[i % pool.length]) : []
    return LAYOUT_KEYS.filter((k) => k !== "blank").map((k) => {
      const own = TEMPLATES.find((t) => t.layout === k && t.category === category) ?? TEMPLATES.find((t) => t.layout === k)
      return {
        key: k,
        doc: own ? templateDoc(own) : buildDoc({ layout: k, palette: doc.palette, style: doc.style, photos: stock, texts: textsFromDoc(doc) }),
      }
    })
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category],
  )

  return (
    <>
      <Group title="Другие композиции">
        <p className={s.layoutsNote}>Ваши фото и подписи перейдут в выбранную.</p>
        <div className={s.thumbs}>
          {layouts.map(({ key, doc: d }) => (
            <button
              key={key}
              onClick={() => commit((cur) => applyLayout(cur, key))}
              className={s.layout}
              title={LAYOUTS[key].description}
            >
              <span className={cx(s.tile, doc.layout === key && s.tileActive)}>
                <CollageCanvas doc={d} imgWidth={200} />
              </span>
              <span className={s.layoutName}>{LAYOUTS[key].name}</span>
              <span className={s.layoutSlots}>{LAYOUTS[key].slots} фото</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Стиль оформления">
        <div className={s.chips}>
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
  const { doc, commit, projectId, selected, placePhoto, autoFill, openFilePicker } = useEditor()
  const { uploads, removeUpload, addDemoPhotos, activeProjects, trashedProjects } = useApp()
  const [demoLoading, setDemoLoading] = useState(false)
  const slots = photoEls(doc)
  const empty = emptySlotCount(doc)
  // sample photos of the template are not the user's: only their own uploads count as filled
  const mine = slots.filter((slot) => isUserPhoto(slot.src)).length
  const sample = slots.length - mine - empty
  const used = new Set(slots.map((slot) => slot.src))
  const target = selected?.kind === "photo" ? selected : null
  // only the photos brought into this collage; other collages keep theirs to themselves
  const tray = trayPhotos(doc)

  const removeFromTray = (src: string) => {
    commit((d) => ({ ...d, photos: trayPhotos(d).filter((x) => x !== src) }))
    // the file goes once no frame here and no other collage needs it
    const elsewhere = [...activeProjects, ...trashedProjects].some((p) => p.id !== projectId && JSON.stringify(p.doc).includes(src))
    const upload = uploads.find((u) => u.src === src)
    if (upload && !used.has(src) && !elsewhere) removeUpload(upload.id)
  }

  return (
    <>
      <button
        onClick={() => openFilePicker()}
        className={s.drop}
      >
        <span className={s.dropIcon}>
          <Upload size={19} />
        </span>
        <span className={s.dropTitle}>Загрузить фото</span>
        <span className={cx(s.small, s.muted)}>
          <span className={s.dragHint}>или перетащите файлы сюда · </span>JPG, PNG, HEIC
        </span>
      </button>
      <button
        className={`btn btn-sm btn-ghost ${s.demo}`}
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

      <div className={s.progress}>
        <div className={s.progressHead}>
          <span className={s.bold}>
            Ваших фото: {mine} из {slots.length}
          </span>
          {mine < slots.length ? (
            <span className={cx(s.small, s.accent)}>ещё {slots.length - mine}</span>
          ) : (
            <span className={cx(s.small, s.done)}>готово ✓</span>
          )}
        </div>
        <div className={s.bars}>
          {slots.map((slot) => (
            <span key={slot.id} className={cx(s.bar, isUserPhoto(slot.src) && s.barFilled)} />
          ))}
        </div>
        {sample ? (
          <p className={s.sampleNote}>
            {mine ? "В остальных рамках пока примеры из шаблона" : "Сейчас в рамках примеры из шаблона"} — замените их своими снимками.
          </p>
        ) : null}
        <button className={`btn btn-sm btn-primary ${s.autofill}`} disabled={!tray.length} onClick={() => autoFill()}>
          <Wand2 size={14} /> Разместить автоматически
        </button>
        {!tray.length ? <p className={s.needUploads}>Сначала загрузите фотографии</p> : null}
      </div>

      {tray.length ? (
        <Group title={`Загружено · ${tray.length}`} className={s.groupSpaced}>
          <p className={s.uploadsHint}>
            {target
              ? "Нажмите на фото — оно встанет в выбранную рамку. Чтобы выбрать часть снимка, перетащите его внутри рамки."
              : "Перетащите фото на рамку коллажа или нажмите, чтобы добавить в свободное место."}
          </p>
          <div className={s.uploads}>
            {tray.map((src) => (
              <div key={src} className={s.upload}>
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(PHOTO_MIME, src)
                    e.dataTransfer.effectAllowed = "copy"
                  }}
                  onClick={() => (target ? placePhoto(target.id, src) : autoFill([src]))}
                  className={s.uploadButton}
                  title={uploads.find((u) => u.src === src)?.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className={s.cover} draggable={false} />
                </button>
                {used.has(src) ? (
                  <span className={s.usedMark}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : null}
                <button
                  onClick={() => removeFromTray(src)}
                  className={s.remove}
                  aria-label="Убрать из загруженных"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </Group>
      ) : (
        <p className={s.tip}>
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
    <label className={s.field}>
      <span className={s.fieldLabel}>{ROLE_LABEL[el.role]}</span>
      <textarea
        value={el.text}
        rows={el.text.length > 28 ? 2 : 1}
        onFocus={() => select(el.id)}
        onChange={(e) => updateEl(el.id, { text: e.target.value })}
        className={cx(s.textarea, active && s.textareaActive)}
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
    <div className={compact ? "" : s.assistant}>
      {!compact ? (
        <div className={s.assistantHead}>
          <span className={s.assistantIcon}>
            <Sparkles size={14} />
          </span>
          <div>
            <p className={s.assistantTitle}>AI-помощник подписей</p>
            <p className={s.assistantSub}>Короткие подписи под настроение</p>
          </div>
        </div>
      ) : null}
      <div className={s.topics}>
        {AI_TOPICS.map((t) => (
          <button
            key={t.key}
            className={`chip ${s.topic}`}
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
        <button className={`btn btn-sm btn-secondary ${s.suggest}`} onClick={run}>
          <Sparkles size={14} className={s.accent} /> Предложить подписи
        </button>
      ) : state === "thinking" ? (
        <div className={s.suggestions}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`skeleton ${s.suggestionSkeleton}`} />
          ))}
        </div>
      ) : (
        <div className={s.suggestions}>
          {shown.map((c) => (
            <button
              key={c}
              onClick={() => onPick(c)}
              className={`animate-fade-up ${s.suggestion}`}
            >
              <span>{c}</span>
              <Plus size={14} className={s.suggestionIcon} />
            </button>
          ))}
          <button className={s.more} onClick={run}>
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
        <div className={s.addStack}>
          <button onClick={() => add("title", "Новый заголовок")} className={s.addTitle}>
            Заголовок
          </button>
          <div className={s.addGrid}>
            <button onClick={() => add("subtitle", "Подзаголовок")} className={cx(s.addOption, s.addSubtitle)}>
              Подзаголовок
            </button>
            <button onClick={() => add("hand", "заметка от руки")} className={cx(s.addOption, s.addHand)}>
              от руки
            </button>
            <button onClick={() => add("meta", "Июль 2025")} className={cx(s.addOption, s.addMeta)}>
              Дата · место
            </button>
          </div>
        </div>
      </Group>

      {texts.length ? (
        <Group title="Тексты на коллаже">
          <div className={s.fields}>
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
        <div className={s.swatches}>
          {BACKGROUND_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => setBg(c)}
              className={cx(s.swatch, doc.bg === c && s.swatchActive)}
              style={{ background: c }}
              aria-label={`Фон ${c}`}
            />
          ))}
          <label
            className={s.customColor}
            title="Свой цвет"
          >
            <Plus size={14} />
            <input type="color" value={doc.bg} onChange={(e) => setBg(e.target.value)} className={s.colorInput} />
          </label>
        </div>
      </Group>

      <Group title="Палитра коллажа">
        <div className={s.palettes}>
          {(Object.keys(PALETTES) as PaletteKey[]).map((k) => {
            const p = PALETTES[k]
            const active = doc.palette === k
            return (
              <button
                key={k}
                onClick={() => commit((d) => restyle({ ...d, bgFromPalette: true }, { palette: k }))}
                className={cx(s.palette, active && s.paletteActive)}
              >
                <span className={s.paletteSwatch}>
                  <span className={s.flex2} style={{ background: p.bg }} />
                  <span className={s.flex1} style={{ background: p.accent }} />
                  <span className={s.flex1} style={{ background: p.ink }} />
                </span>
                <span className={s.paletteName}>{p.name}</span>
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Текстура бумаги">
        <div className={s.chips}>
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
          <div className={s.decos}>
            {(Object.keys(DECOS) as DecoKey[])
              .filter((k) => DECOS[k].group === g.key && k !== "line")
              .map((k) => {
                const ratio = DECOS[k].ratio
                return (
                  <button
                    key={k}
                    onClick={() => addEl(newDecoEl(doc, k))}
                    className={s.deco}
                    title={DECOS[k].name}
                  >
                    <span className={s.decoArt} style={{ width: `${Math.min(76, 70 / ratio)}%`, aspectRatio: `${1 / ratio}` }}>
                      <DecoArt deco={k} color={k === "tape" ? PALETTES[doc.palette].accent2 : accent} id={`pv-${k}`} />
                    </span>
                  </button>
                )
              })}
          </div>
        </Group>
      ))}
      <p className={s.decorNote}>
        <Type size={13} /> Элемент появится в центре — перетащите его куда нужно.
      </p>
    </>
  )
}
