"use client"

import { ArrowLeft, ArrowRight, Check, Gift as GiftIcon, GripVertical, Loader2, Music, Pause, Play, Sparkles, Upload, VolumeX, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { createPortal } from "react-dom"
import { useUser } from "@/src/hooks/useAuth"
import { useCreateGift } from "@/src/hooks/useGifts"
import { snapshotCollage } from "@/src/lib/export/snapshot"
import {
  MUSIC_MOODS,
  OCCASION_BY_ID,
  OCCASION_TRACK,
  OCCASIONS,
  OPENINGS,
  TRACK_BY_ID,
  TRACKS,
  suggestWishes,
  type Gift,
  type MusicMood,
  type Occasion,
  type Opening,
} from "@/src/lib/gifts"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp, type Project } from "../providers/AppProvider"
import { Modal } from "../ui/Modal"
import { GiftShare } from "./GiftShare"
import { OpeningPreview } from "./openings"

const STEPS = ["Коллажи", "Поздравление", "Сюрприз и музыка", "Готово"]
const MAX_COLLAGES = 20
const MAX_AUDIO = 15 * 1024 * 1024
const AUDIO_TYPES: Record<string, string> = { mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", wav: "audio/wav", webm: "audio/webm" }

type MusicChoice = { track: string } | { file: File } | null

function Progress({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Шаги">
      {STEPS.map((label, i) => {
        const done = i < step
        const current = i === step
        return (
          <li key={label} className={`flex items-center gap-2 ${current ? "min-w-0 flex-1 sm:flex-none" : ""}`} aria-current={current ? "step" : undefined}>
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                done ? "bg-sage text-white" : current ? "bg-ink text-bg" : "bg-surface-2 text-faint"
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`truncate text-[13px] font-semibold ${current ? "text-ink" : "hidden text-faint md:inline"}`}>{label}</span>
            {i < STEPS.length - 1 ? <span className={`h-px w-4 shrink-0 md:w-8 ${done ? "bg-sage" : "bg-line-strong"}`} /> : null}
          </li>
        )
      })}
    </ol>
  )
}

/* ---------- step 1: collages ---------- */

/** Reorders by pointer, so it works with a finger as well as a mouse. */
function useReorder(ids: string[], onChange: (ids: string[]) => void) {
  const [dragging, setDragging] = useState<string | null>(null)
  const start = (e: ReactPointerEvent, id: string) => {
    e.preventDefault()
    setDragging(id)
    let order = ids
    const move = (ev: PointerEvent) => {
      const over = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>("[data-sort-id]")?.dataset.sortId
      if (!over || over === id) return
      const next = order.filter((x) => x !== id)
      next.splice(order.indexOf(over), 0, id)
      order = next
      onChange(next)
    }
    const up = () => {
      setDragging(null)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }
  return { dragging, start }
}

function CollagesStep({ projects, selected, setSelected }: { projects: Project[]; selected: string[]; setSelected: (ids: string[]) => void }) {
  const byId = new Map(projects.map((p) => [p.id, p]))
  const { dragging, start } = useReorder(selected, setSelected)
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : selected.length < MAX_COLLAGES ? [...selected, id] : selected)

  if (!projects.length) {
    return <p className="py-16 text-center text-muted">В «Моих проектах» пока нет коллажей. Создайте коллаж — и из него можно будет сделать подарок.</p>
  }

  return (
    <div>
      <h3 className="display text-3xl">Какие коллажи подарить?</h3>
      <p className="mt-1 text-sm text-muted">Они появятся на странице-сюрпризе в этом порядке. Перетащите, чтобы поменять местами.</p>

      <div className="mt-4 min-h-[92px] rounded-2xl border border-dashed border-line-strong bg-surface-2/50 p-2.5">
        {selected.length ? (
          <ul className="flex flex-wrap gap-2.5">
            {selected.map((id, i) => {
              const p = byId.get(id)
              if (!p) return null
              return (
                <li
                  key={id}
                  data-sort-id={id}
                  onPointerDown={(e) => start(e, id)}
                  className={`relative w-[70px] cursor-grab touch-none select-none rounded-lg bg-surface p-1.5 shadow-soft ring-1 ring-line transition-transform active:cursor-grabbing ${
                    dragging === id ? "z-10 scale-105 shadow-card ring-accent" : ""
                  }`}
                  title={p.name}
                >
                  <div className="pointer-events-none">
                    <CollageCanvas doc={p.doc} imgWidth={140} />
                  </div>
                  <span className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-bg">{i + 1}</span>
                  <GripVertical size={12} className="absolute bottom-0.5 right-0.5 text-faint" />
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="grid h-[72px] place-items-center text-sm text-faint">Выберите коллажи ниже</p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {projects.map((p) => {
          const n = selected.indexOf(p.id)
          const on = n >= 0
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              className={`group relative flex flex-col rounded-2xl p-2 text-left transition ${on ? "bg-accent-soft ring-2 ring-accent" : "bg-surface-2 ring-1 ring-line hover:ring-line-strong"}`}
            >
              <span className="flex aspect-square items-center justify-center p-[6%]">
                <span className="w-full">
                  <CollageCanvas doc={p.doc} imgWidth={240} className="shadow-soft" />
                </span>
              </span>
              <span className="mt-1.5 truncate px-0.5 text-xs font-semibold">{p.name}</span>
              <span
                className={`absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full text-[11px] font-bold transition ${
                  on ? "bg-accent text-accent-ink" : "border-2 border-white/90 bg-black/10 text-transparent"
                }`}
              >
                {on ? n + 1 : ""}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- step 2: wishes ---------- */

interface Words {
  recipient: string
  occasion: Occasion
  message: string
  signature: string
  finale: string
}

function WordsStep({ words, setWords }: { words: Words; setWords: (patch: Partial<Words>) => void }) {
  const [ideas, setIdeas] = useState<string[] | null>(null)
  const [seed, setSeed] = useState(0)
  const suggest = (next = seed) => {
    setSeed(next)
    setIdeas(suggestWishes(words.occasion, words.recipient, next))
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="display text-3xl">Поздравление</h3>
        <p className="mt-1 text-sm text-muted">Текст будет появляться по буквам, как на печатной машинке.</p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Кому</span>
        <input className="input h-12 text-[15px]" value={words.recipient} maxLength={60} placeholder="Например, Аня" onChange={(e) => setWords({ recipient: e.target.value })} />
      </label>

      <div>
        <span className="mb-1.5 block text-sm font-semibold">Повод</span>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o.id}
              className="chip"
              data-active={words.occasion === o.id}
              onClick={() => {
                // the closing line follows the occasion until the user writes their own
                const auto = OCCASIONS.some((x) => x.finale === words.finale) || !words.finale
                setWords({ occasion: o.id, ...(auto ? { finale: o.finale } : {}) })
                if (ideas) setIdeas(suggestWishes(o.id, words.recipient, seed))
              }}
            >
              <span>{o.emoji}</span> {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">Текст поздравления</span>
          <button className="btn btn-sm btn-ghost -mr-2 text-accent" onClick={() => suggest(ideas ? seed + 1 : seed)}>
            <Sparkles size={15} /> {ideas ? "Ещё варианты" : "Предложить текст"}
          </button>
        </div>
        {ideas ? (
          <div className="mb-3 grid gap-2">
            {ideas.map((t) => (
              <button
                key={t}
                className="animate-fade-up rounded-2xl border border-line bg-surface-2/60 px-4 py-3 text-left font-serif text-[17px] leading-snug transition hover:border-accent hover:bg-accent-soft"
                onClick={() => {
                  setWords({ message: t })
                  setIdeas(null)
                }}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}
        <textarea
          className="input h-auto min-h-[140px] resize-y rounded-2xl py-3 font-serif text-[18px] leading-snug"
          value={words.message}
          maxLength={2000}
          placeholder="Напишите пару тёплых слов…"
          onChange={(e) => setWords({ message: e.target.value })}
        />
        <p className="mt-1 text-right text-[11px] text-faint">{words.message.length} / 2000</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Подпись</span>
          <input className="input h-12 font-script text-[19px]" value={words.signature} maxLength={60} placeholder="Твоя Маша" onChange={(e) => setWords({ signature: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Надпись в конце</span>
          <input className="input h-12 text-[15px]" value={words.finale} maxLength={80} onChange={(e) => setWords({ finale: e.target.value })} />
        </label>
      </div>
    </div>
  )
}

/* ---------- step 3: opening and music ---------- */

function audioFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  const type = file.type.startsWith("audio/") ? file.type : AUDIO_TYPES[ext]
  if (!type) return null
  return file.type === type ? file : new File([file], file.name, { type })
}

function SurpriseStep({
  occasion,
  opening,
  setOpening,
  music,
  setMusic,
}: {
  occasion: Occasion
  opening: Opening
  setOpening: (o: Opening) => void
  music: MusicChoice
  setMusic: (m: MusicChoice) => void
}) {
  const { toast } = useApp()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const own = music && "file" in music ? music.file : null
  const picked = music && "track" in music ? TRACK_BY_ID[music.track] : null
  const [mood, setMood] = useState<MusicMood>(() => (picked ?? TRACK_BY_ID[OCCASION_TRACK[occasion]]).mood)
  const suggested = OCCASION_TRACK[occasion]
  const ownSrc = useMemo(() => (own ? URL.createObjectURL(own) : null), [own])

  useEffect(() => () => audio.current?.pause(), [])
  useEffect(() => () => {
    if (ownSrc) URL.revokeObjectURL(ownSrc)
  }, [ownSrc])

  const listen = (key: string, src: string) => {
    if (playing === key) {
      audio.current?.pause()
      setPlaying(null)
      return
    }
    audio.current?.pause()
    const a = new Audio(src)
    a.onended = () => setPlaying(null)
    a.play().catch(() => setPlaying(null))
    audio.current = a
    setPlaying(key)
  }

  const pick = (file: File | undefined) => {
    if (!file) return
    const ok = audioFile(file)
    if (!ok) return toast("Поддерживаются MP3, M4A, AAC, OGG и WAV", "error")
    if (ok.size > MAX_AUDIO) return toast("Файл больше 15 МБ — выберите покороче", "error")
    audio.current?.pause()
    setPlaying(null)
    setMusic({ file: ok })
  }

  const row = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-ink bg-surface-2" : "border-line hover:border-line-strong"}`

  return (
    <div className="space-y-7">
      <div>
        <h3 className="display text-3xl">Как открыть сюрприз?</h3>
        <p className="mt-1 text-sm text-muted">Эту анимацию друг увидит сразу после кнопки «Открыть».</p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {OPENINGS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOpening(o.id)}
              aria-pressed={opening === o.id}
              className={`flex flex-col overflow-hidden rounded-2xl border text-left transition ${opening === o.id ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-strong"}`}
            >
              <span className="block h-[96px] overflow-hidden bg-[linear-gradient(160deg,#fbefe6,#f3dccf)] sm:h-[132px]">
                <span className="block h-full origin-bottom max-sm:scale-[0.72]">
                  <OpeningPreview kind={o.id} />
                </span>
              </span>
              <span className="block p-2.5 sm:p-3">
                <span className="block text-[13px] font-bold leading-tight sm:text-sm">{o.label}</span>
                <span className="mt-0.5 hidden text-xs text-muted sm:block">{o.text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="display text-3xl">Музыка</h3>
        <p className="mt-1 text-sm text-muted">Включится, когда друг нажмёт «Открыть», и будет играть по кругу.</p>
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Настроение">
          {MUSIC_MOODS.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mood === m.id}
              onClick={() => setMood(m.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${mood === m.id ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-line-strong hover:text-ink"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {TRACKS.filter((t) => t.mood === mood).map((t) => {
            const active = !!music && "track" in music && music.track === t.id
            return (
              <div key={t.id} className={row(active)}>
                <button className="icon-btn size-10 bg-surface-2" onClick={() => listen(t.id, t.url)} aria-label={playing === t.id ? "Пауза" : "Послушать"}>
                  {playing === t.id ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="min-w-0 flex-1 text-left" onClick={() => setMusic({ track: t.id })}>
                  <span className="block truncate text-sm font-semibold">
                    {t.title} <span className="font-normal text-muted">— {t.artist}</span>
                  </span>
                  <span className="block text-xs text-muted">
                    {t.hint}
                    {t.id === suggested ? <span className="text-accent"> · подходит к поводу</span> : null}
                  </span>
                </button>
                <Radio on={active} onClick={() => setMusic({ track: t.id })} />
              </div>
            )
          })}

          {picked && picked.mood !== mood ? (
            <p className="px-1 pt-1 text-xs text-muted">
              Выбран трек «{picked.title}» из раздела «{MUSIC_MOODS.find((m) => m.id === picked.mood)?.label}»
            </p>
          ) : null}

          <div className={row(!!own)}>
            {ownSrc ? (
              <button className="icon-btn size-10 bg-surface-2" onClick={() => listen("own", ownSrc)} aria-label={playing === "own" ? "Пауза" : "Послушать"}>
                {playing === "own" ? <Pause size={16} /> : <Play size={16} />}
              </button>
            ) : (
              <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted">
                <Music size={16} />
              </span>
            )}
            <label className="min-w-0 flex-1 cursor-pointer">
              <span className="block truncate text-sm font-semibold">{own ? own.name : "Своя музыка"}</span>
              <span className="block text-xs text-muted">{own ? `${(own.size / 1024 / 1024).toFixed(1)} МБ · загрузится вместе с подарком` : "MP3, M4A, OGG или WAV до 15 МБ"}</span>
              <input type="file" accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            </label>
            {own ? (
              <Radio on onClick={() => setMusic({ file: own })} />
            ) : (
              <span className="btn btn-sm btn-secondary pointer-events-none">
                <Upload size={14} /> Загрузить
              </span>
            )}
          </div>

          <button className={row(music === null)} onClick={() => setMusic(null)}>
            <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted">
              <VolumeX size={16} />
            </span>
            <span className="flex-1 text-sm font-semibold">Без музыки</span>
            <Radio on={music === null} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Radio({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={`grid size-5 shrink-0 cursor-pointer place-items-center rounded-full border-2 ${on ? "border-accent" : "border-line-strong"}`}
      aria-hidden
    >
      {on ? <span className="size-2 rounded-full bg-accent" /> : null}
    </span>
  )
}

/* ---------- step 4: done ---------- */

/** The real surprise page in a phone frame, scaled down from a 390 px wide screen. */
function PhonePreview({ id }: { id: string }) {
  return (
    <div className="relative mx-auto w-[234px] shrink-0 rounded-[40px] bg-[#1b1714] p-[9px] shadow-float">
      <div className="relative h-[488px] overflow-hidden rounded-[32px] bg-white">
        <iframe title="Предпросмотр подарка" src={`/g/${id}`} className="absolute left-0 top-0 h-[813px] w-[390px] origin-top-left scale-[0.6] border-0" allow="autoplay" />
      </div>
      <span className="absolute left-1/2 top-[15px] h-[18px] w-[68px] -translate-x-1/2 rounded-full bg-[#1b1714]" />
    </div>
  )
}

function DoneStep({ gift }: { gift: Gift }) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
      <div className="order-2 md:order-1">
        <PhonePreview id={gift.id} />
        <p className="mt-3 text-center text-xs text-muted">Так подарок выглядит на телефоне</p>
      </div>
      <div className="order-1 md:order-2">
        <div className="mb-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-sage-soft text-sage">
            <Check size={24} />
          </span>
          <h3 className="display mt-3 text-4xl">Подарок готов!</h3>
          <p className="mt-1 text-sm text-muted">
            Распечатайте QR-код и положите его на торт, в открытку или в коробку. {gift.recipient} отсканирует его телефоном.
          </p>
        </div>
        <GiftShare id={gift.id} recipient={gift.recipient} />
      </div>
    </div>
  )
}

/* ---------- wizard ---------- */

/** Mounts the chosen collages off-screen at a fixed width so they can be photographed into JPEGs. */
function SnapshotStage({ projects, onReady }: { projects: Project[]; onReady: (nodes: Map<string, HTMLDivElement>) => void }) {
  const nodes = useRef(new Map<string, HTMLDivElement>())
  const fired = useRef(false)
  useEffect(() => {
    // StrictMode runs effects twice in development; one gift must be created once
    if (fired.current) return
    fired.current = true
    onReady(nodes.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return createPortal(
    <div className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0" aria-hidden>
      {projects.map((p) => (
        <div key={p.id} className="absolute left-0 top-0 w-[800px]">
          <CollageCanvas
            ref={(n) => {
              if (n) nodes.current.set(p.id, n)
            }}
            doc={p.doc}
            imgWidth={1600}
          />
        </div>
      ))}
    </div>,
    document.body,
  )
}

export function GiftWizard({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId?: string }) {
  const { activeProjects, getProject, toast } = useApp()
  const { data: user } = useUser()
  const create = useCreateGift()
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<string[]>(() => (projectId ? [projectId] : []))
  const [words, setWordsState] = useState<Words>({
    recipient: "",
    occasion: "birthday",
    message: "",
    signature: user?.name ?? "",
    finale: OCCASION_BY_ID.birthday.finale,
  })
  const [opening, setOpening] = useState<Opening>("cake")
  const [music, setMusicState] = useState<MusicChoice>({ track: OCCASION_TRACK.birthday })
  // the track follows the occasion until the person picks music themselves
  const musicPicked = useRef(false)
  const [gift, setGift] = useState<Gift | null>(null)
  const [stage, setStage] = useState<Project[] | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const setWords = (patch: Partial<Words>) => {
    setWordsState((w) => ({ ...w, ...patch }))
    if (patch.occasion && !musicPicked.current) setMusicState({ track: OCCASION_TRACK[patch.occasion] })
  }
  const setMusic = (m: MusicChoice) => {
    musicPicked.current = true
    setMusicState(m)
  }
  const chosen = selected.map((id) => getProject(id)).filter((p): p is Project => !!p)
  const busy = !!stage || create.isPending

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [step])

  const reset = () => {
    setStep(0)
    setGift(null)
    setSelected(projectId ? [projectId] : [])
  }
  const close = () => {
    if (busy) return
    onClose()
    if (gift) reset()
  }

  const blocker =
    step === 0 && !chosen.length
      ? "Выберите хотя бы один коллаж"
      : step === 1 && !words.recipient.trim()
        ? "Напишите, кому подарок"
        : step === 1 && !words.message.trim()
          ? "Напишите поздравление или выберите готовое"
          : step === 1 && !words.finale.trim()
            ? "Добавьте надпись в конце"
            : null

  const build = async (nodes: Map<string, HTMLDivElement>) => {
    try {
      const snapshots = []
      for (const p of chosen) {
        const node = nodes.get(p.id)
        if (!node) throw new Error("Коллаж не найден")
        snapshots.push(await snapshotCollage(node, p.doc))
      }
      setStage(null)
      const made = await create.mutateAsync({
        recipient: words.recipient.trim(),
        occasion: words.occasion,
        message: words.message.trim(),
        signature: words.signature.trim(),
        finale: words.finale.trim(),
        animation: opening,
        music,
        snapshots,
      })
      setGift(made)
      setStep(3)
    } catch (e) {
      setStage(null)
      toast(e instanceof Error ? e.message : "Не удалось создать подарок", "error")
    }
  }

  const next = () => {
    if (blocker) return toast(blocker, "error")
    if (step < 2) return setStep(step + 1)
    setStage(chosen)
  }

  return (
    <Modal open={open} onClose={close} label="Подарок с QR-кодом" className="flex h-[92dvh] max-w-4xl flex-col sm:h-[min(860px,92dvh)]" hideClose={busy}>
      <header className="shrink-0 border-b border-line px-5 pb-4 pt-5 sm:px-8 sm:pt-6">
        <p className="eyebrow flex items-center gap-1.5 text-accent">
          <GiftIcon size={13} /> Подарок с QR-кодом
        </p>
        <div className="mt-3 pr-10">
          <Progress step={step} />
        </div>
      </header>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-6 scrollbar-thin sm:px-8">
        {step === 0 ? <CollagesStep projects={activeProjects} selected={selected} setSelected={setSelected} /> : null}
        {step === 1 ? <WordsStep words={words} setWords={setWords} /> : null}
        {step === 2 ? <SurpriseStep occasion={words.occasion} opening={opening} setOpening={setOpening} music={music} setMusic={setMusic} /> : null}
        {step === 3 && gift ? <DoneStep gift={gift} /> : null}
      </div>

      <footer className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
        {step === 3 ? (
          <>
            <button className="btn btn-ghost" onClick={reset}>
              <GiftIcon size={16} /> Ещё один подарок
            </button>
            <button className="btn btn-primary ml-auto" onClick={close}>
              Готово
            </button>
          </>
        ) : (
          <>
            {step > 0 ? (
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={busy}>
                <ArrowLeft size={16} /> Назад
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={close}>
                <X size={16} /> Отмена
              </button>
            )}
            <span className="ml-auto hidden text-xs text-muted sm:block">{step === 0 && chosen.length ? `Выбрано: ${chosen.length}` : ""}</span>
            <button className={`btn ${step === 2 ? "btn-accent" : "btn-primary"} ml-auto sm:ml-2`} onClick={next} disabled={busy} aria-disabled={!!blocker}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {busy ? (stage ? "Готовим коллажи…" : "Сохраняем подарок…") : step === 2 ? "Создать подарок" : "Далее"}
              {!busy && step < 2 ? <ArrowRight size={16} /> : null}
              {!busy && step === 2 ? <GiftIcon size={16} /> : null}
            </button>
          </>
        )}
      </footer>

      {stage ? <SnapshotStage projects={stage} onReady={build} /> : null}
    </Modal>
  )
}
