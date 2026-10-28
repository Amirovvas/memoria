"use client"

import { ArrowLeft, ArrowRight, Check, ChevronDown, Gift as GiftIcon, GripVertical, Loader2, Music, Pause, Play, Sparkles, Upload, VolumeX, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { createPortal } from "react-dom"
import { useUser } from "@/src/hooks/useUser"
import { useCreateGift } from "@/src/hooks/useCreateGift"
import { snapshotCollage } from "@/src/lib/export/snapshot"
import {
  GAMES,
  OCCASION_BY_ID,
  OCCASION_TRACK,
  OCCASIONS,
  OPENINGS,
  TRACK_BY_ID,
  TRACKS,
  suggestWishes,
  type Game,
  type Gift,
  type Occasion,
  type Opening,
} from "@/src/lib/gifts"
import { CollageCanvas } from "../collage/CollageCanvas"
import { useApp, type Project } from "../providers/AppProvider"
import { Modal } from "../ui/Modal"
import { GiftShare } from "./GiftShare"
import { cx } from "@/src/lib/cx"
import { OpeningPreview } from "./openings"
import s from "./GiftWizard.module.css"

const STEPS = ["Коллажи", "Поздравление", "Сюрприз и музыка", "Готово"]
const MAX_COLLAGES = 20
const MAX_AUDIO = 15 * 1024 * 1024
const AUDIO_TYPES: Record<string, string> = { mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", wav: "audio/wav", webm: "audio/webm" }

type MusicChoice = { track: string } | { file: File } | null

function Progress({ step }: { step: number }) {
  return (
    <ol className={s.progress} aria-label="Шаги">
      {STEPS.map((label, i) => {
        const done = i < step
        const current = i === step
        return (
          <li key={label} className={cx(s.step, current && s.stepCurrent)} aria-current={current ? "step" : undefined}>
            <span className={cx(s.number, done && s.numberDone, current && s.numberCurrent)}>
              {done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className={cx(s.stepLabel, current && s.stepLabelCurrent)}>{label}</span>
            {i < STEPS.length - 1 ? <span className={cx(s.connector, done && s.connectorDone)} /> : null}
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
    return <p className={s.empty}>В «Моих проектах» пока нет коллажей. Создайте коллаж — и из него можно будет сделать подарок.</p>
  }

  return (
    <div>
      <h3 className={`display ${s.title}`}>Какие коллажи подарить?</h3>
      <p className={s.sub}>Они появятся на странице-сюрпризе в этом порядке. Перетащите, чтобы поменять местами.</p>

      <div className={s.tray}>
        {selected.length ? (
          <ul className={s.trayList}>
            {selected.map((id, i) => {
              const p = byId.get(id)
              if (!p) return null
              return (
                <li
                  key={id}
                  data-sort-id={id}
                  onPointerDown={(e) => start(e, id)}
                  className={cx(s.chosen, dragging === id && s.dragging)}
                  title={p.name}
                >
                  <div className={s.noPointer}>
                    <CollageCanvas doc={p.doc} imgWidth={140} />
                  </div>
                  <span className={s.order}>{i + 1}</span>
                  <GripVertical size={12} className={s.grip} />
                </li>
              )
            })}
          </ul>
        ) : (
          <p className={s.trayEmpty}>Выберите коллажи ниже</p>
        )}
      </div>

      <div className={s.choices}>
        {projects.map((p) => {
          const n = selected.indexOf(p.id)
          const on = n >= 0
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              className={s.choice}
            >
              <span className={s.choiceThumb}>
                <span className={s.full}>
                  <CollageCanvas doc={p.doc} imgWidth={240} className={s.canvas} />
                </span>
              </span>
              <span className={cx(s.truncate, s.choiceName)}>{p.name}</span>
              <span className={cx(s.mark, on && s.markOn)}>
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
    <div className={s.words}>
      <div>
        <h3 className={`display ${s.title}`}>Поздравление</h3>
        <p className={s.sub}>Текст будет появляться по буквам, как на печатной машинке.</p>
      </div>

      <label className={s.field}>
        <span className={s.label}>Кому</span>
        <input className={`input ${s.inputLarge}`} value={words.recipient} maxLength={60} placeholder="Например, Аня" onChange={(e) => setWords({ recipient: e.target.value })} />
      </label>

      <div>
        <span className={s.label}>Повод</span>
        <div className={s.chips}>
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
              <o.icon size={15} strokeWidth={1.9} /> {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={s.messageHead}>
          <span className={s.labelText}>Текст поздравления</span>
          <button className={`btn btn-sm btn-ghost ${s.suggest}`} onClick={() => suggest(ideas ? seed + 1 : seed)}>
            <Sparkles size={15} /> {ideas ? "Ещё варианты" : "Предложить текст"}
          </button>
        </div>
        {ideas ? (
          <div className={s.ideas}>
            {ideas.map((t) => (
              <button
                key={t}
                className={`animate-fade-up ${s.idea}`}
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
          className={`input ${s.message}`}
          value={words.message}
          maxLength={2000}
          placeholder="Напишите пару тёплых слов…"
          onChange={(e) => setWords({ message: e.target.value })}
        />
        <p className={s.counter}>{words.message.length} / 2000</p>
      </div>

      <div className={s.pair}>
        <label className={s.field}>
          <span className={s.label}>Подпись</span>
          <input className={`input ${s.signature}`} value={words.signature} maxLength={60} placeholder="Твоя Маша" onChange={(e) => setWords({ signature: e.target.value })} />
        </label>
        <label className={s.field}>
          <span className={s.label}>Надпись в конце</span>
          <input className={`input ${s.inputLarge}`} value={words.finale} maxLength={80} onChange={(e) => setWords({ finale: e.target.value })} />
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
  game,
  setGame,
  music,
  setMusic,
}: {
  occasion: Occasion
  opening: Opening
  setOpening: (o: Opening) => void
  game: Game
  setGame: (g: Game) => void
  music: MusicChoice
  setMusic: (m: MusicChoice) => void
}) {
  const { toast } = useApp()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const own = music && "file" in music ? music.file : null
  const suggested = OCCASION_TRACK[occasion]
  // a short list that always starts with the track already chosen, so the choice is in sight;
  // the rest opens on request instead of scrolling inside the scrolling dialog
  const [allTracks, setAllTracks] = useState(false)
  const [lead] = useState(() => (music && "track" in music ? music.track : null))
  const shownTracks = allTracks
    ? TRACKS
    : [...(lead && TRACK_BY_ID[lead] ? [TRACK_BY_ID[lead]] : []), ...TRACKS.filter((t) => t.id !== lead).slice(0, 5)]
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

  const row = (active: boolean) => cx(s.row, active && s.rowActive)

  return (
    <div className={s.surprise}>
      <div>
        <h3 className={`display ${s.title}`}>Как открыть сюрприз?</h3>
        <p className={s.sub}>Эту анимацию друг увидит сразу после кнопки «Открыть».</p>
        <div className={s.openings}>
          {OPENINGS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOpening(o.id)}
              aria-pressed={opening === o.id}
              className={s.opening}
            >
              <span className={s.openingArt}>
                <span className={s.openingScale}>
                  <OpeningPreview kind={o.id} />
                </span>
              </span>
              <span className={s.openingText}>
                <span className={s.openingLabel}>{o.label}</span>
                <span className={s.openingHint}>{o.text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className={`display ${s.title}`}>Игра перед сюрпризом</h3>
        <p className={s.sub}>Друг сначала сыграет — и только потом увидит коллаж и поздравление.</p>
        <div className={s.games}>
          {GAMES.map((g) => (
            <button key={g.id} onClick={() => setGame(g.id)} aria-pressed={game === g.id} className={s.game}>
              <span className={s.gameEmoji} aria-hidden>
                <g.icon size={20} strokeWidth={1.8} />
              </span>
              <span className={s.openingText}>
                <span className={s.openingLabel}>{g.label}</span>
                <span className={s.gameHint}>{g.text}</span>
              </span>
            </button>
          ))}
        </div>
        <p className={s.gameNote}>{GAMES.find((g) => g.id === game)?.text}</p>
      </div>

      <div>
        <h3 className={`display ${s.title}`}>Музыка</h3>
        <p className={s.sub}>Включится, когда друг нажмёт «Открыть», и будет играть по кругу.</p>
        <div className={s.tracks}>
          <div className={s.trackList}>
            {shownTracks.map((t) => {
              const active = !!music && "track" in music && music.track === t.id
              return (
                <div key={t.id} className={row(active)}>
                  <button className={`icon-btn ${s.play}`} onClick={() => listen(t.id, t.url)} aria-label={playing === t.id ? "Пауза" : "Послушать"}>
                    {playing === t.id ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button className={s.trackInfo} onClick={() => setMusic({ track: t.id })}>
                    <span className={cx(s.truncate, s.trackTitle)}>
                      {t.title} <span className={s.artist}>— {t.artist}</span>
                    </span>
                    <span className={s.trackHint}>
                      {t.hint}
                      {t.id === suggested ? <span className={s.accent}> · подходит к поводу</span> : null}
                    </span>
                  </button>
                  <Radio on={active} onClick={() => setMusic({ track: t.id })} />
                </div>
              )
            })}
            {!allTracks ? (
              <button className={s.moreTracks} onClick={() => setAllTracks(true)}>
                <ChevronDown size={16} /> Показать все песни · {TRACKS.length}
              </button>
            ) : null}
          </div>

          <div className={row(!!own)}>
            {ownSrc ? (
              <button className={`icon-btn ${s.play}`} onClick={() => listen("own", ownSrc)} aria-label={playing === "own" ? "Пауза" : "Послушать"}>
                {playing === "own" ? <Pause size={16} /> : <Play size={16} />}
              </button>
            ) : (
              <span className={s.iconPlaceholder}>
                <Music size={16} />
              </span>
            )}
            <label className={cx(s.trackInfo, s.ownTrack)}>
              <span className={cx(s.truncate, s.trackTitle)}>{own ? own.name : "Своя музыка"}</span>
              <span className={s.trackHint}>{own ? `${(own.size / 1024 / 1024).toFixed(1)} МБ · загрузится вместе с подарком` : "MP3, M4A, OGG или WAV до 15 МБ"}</span>
              <input type="file" accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav" className={s.srOnly} onChange={(e) => pick(e.target.files?.[0])} />
            </label>
            {own ? (
              <Radio on onClick={() => setMusic({ file: own })} />
            ) : (
              <span className={`btn btn-sm btn-secondary ${s.uploadTag}`}>
                <Upload size={14} /> Загрузить
              </span>
            )}
          </div>

          <button className={row(music === null)} onClick={() => setMusic(null)}>
            <span className={s.iconPlaceholder}>
              <VolumeX size={16} />
            </span>
            <span className={s.noMusic}>Без музыки</span>
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
      className={cx(s.radio, on && s.radioOn)}
      aria-hidden
    >
      {on ? <span className={s.radioDot} /> : null}
    </span>
  )
}

/* ---------- step 4: done ---------- */

function DoneStep({ gift }: { gift: Gift }) {
  return (
    <div className={s.done}>
      <div className={s.doneHead}>
        <span className={s.doneIcon}>
          <Check size={24} />
        </span>
        <h3 className={`display ${s.doneTitle}`}>Подарок готов!</h3>
        <p className={s.sub}>
          Распечатайте QR-код и положите его на торт, в открытку или в коробку.
        </p>
      </div>
      <GiftShare id={gift.id} recipient={gift.recipient} />
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
    <div className={s.snapshots} aria-hidden>
      {projects.map((p) => (
        <div key={p.id} className={s.snapshot}>
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
  const [game, setGame] = useState<Game>("scratch")
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
        game,
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
    <Modal open={open} onClose={close} label="Подарок с QR-кодом" className={s.dialog} hideClose={busy}>
      <header className={s.head}>
        <p className={`eyebrow ${s.headEyebrow}`}>
          <GiftIcon size={13} /> Подарок с QR-кодом
        </p>
        <div className={s.progressSlot}>
          <Progress step={step} />
        </div>
      </header>

      <div ref={bodyRef} className={`scrollbar-thin ${s.body}`}>
        {step === 0 ? <CollagesStep projects={activeProjects} selected={selected} setSelected={setSelected} /> : null}
        {step === 1 ? <WordsStep words={words} setWords={setWords} /> : null}
        {step === 2 ? <SurpriseStep occasion={words.occasion} opening={opening} setOpening={setOpening} game={game} setGame={setGame} music={music} setMusic={setMusic} /> : null}
        {step === 3 && gift ? <DoneStep gift={gift} /> : null}
      </div>

      <footer className={s.foot}>
        {step === 3 ? (
          <>
            <button className="btn btn-ghost" onClick={reset}>
              <GiftIcon size={16} /> Ещё один подарок
            </button>
            <button className={`btn btn-primary ${s.pushRight}`} onClick={close}>
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
            <span className={s.selectedCount}>{step === 0 && chosen.length ? `Выбрано: ${chosen.length}` : ""}</span>
            <button className={cx("btn", step === 2 ? "btn-accent" : "btn-primary", s.pushRight, s.next)} onClick={next} disabled={busy} aria-disabled={!!blocker}>
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
