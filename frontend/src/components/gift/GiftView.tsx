"use client"

import { ChevronDown, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { createPortal } from "react-dom"
import { usePublicGift } from "@/src/hooks/useGifts"
import { ApiError } from "@/src/lib/api"
import { confetti } from "@/src/lib/confetti"
import type { GiftCollage, GiftMusic, PublicGift } from "@/src/lib/gifts"
import { OpeningScene } from "./openings"

const INK = "#3b2a22"

/** Soft warm paper with slow drifting hearts; the page keeps these colours in both themes. */
function Backdrop({ dense }: { dense?: boolean }) {
  const items = ["♥", "✦", "♥", "✧", "♥", "✦", "♥", "✧", "♥", "✦"].slice(0, dense ? 10 : 6)
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(170deg,#fdf4ec_0%,#f9e6dc_48%,#f4dcd6_100%)]" />
      <div className="absolute -left-1/3 -top-1/4 size-[90vmax] rounded-full bg-[#ffd9c7]/60 blur-[90px]" />
      <div className="absolute -bottom-1/3 -right-1/3 size-[80vmax] rounded-full bg-[#f6c4cf]/45 blur-[100px]" />
      {items.map((c, i) => (
        <span
          key={i}
          className="gift-drift text-[#e79a8c]"
          style={{ left: `${(i * 37 + 7) % 96}%`, fontSize: 12 + ((i * 7) % 14), animationDuration: `${14 + ((i * 5) % 11)}s`, animationDelay: `${-i * 2.3}s` }}
        >
          {c}
        </span>
      ))}
    </div>
  )
}

/* ---------- music ---------- */

function useMusic(music: GiftMusic | null) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => audio.current?.pause(), [])

  /** Must run inside a tap: browsers only allow sound that a person started. */
  const start = useCallback(() => {
    if (!music) return
    if (!audio.current) {
      const a = new Audio(music.url)
      a.loop = true
      a.volume = 0.8
      a.onplay = () => setPlaying(true)
      a.onpause = () => setPlaying(false)
      audio.current = a
    }
    audio.current.play().catch(() => setPlaying(false))
  }, [music])

  const toggle = () => {
    const a = audio.current
    if (!a || a.paused) start()
    else a.pause()
  }
  return { playing, start, toggle }
}

function MusicButton({ title, playing, onToggle }: { title: string; playing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 max-w-[min(240px,70vw)] items-center gap-2.5 rounded-full bg-white/75 pl-1.5 pr-4 shadow-[0_12px_30px_-14px_rgb(90_40_25/0.55)] ring-1 ring-white/70 backdrop-blur-md transition active:scale-95"
      aria-label={playing ? "Поставить музыку на паузу" : "Включить музыку"}
      style={{ color: INK }}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#b4553a] text-white">
        {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="translate-x-px" />}
      </span>
      <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
        {[0, 0.2, 0.4, 0.1].map((d, i) => (
          <span key={i} className={`w-[3px] rounded-full bg-[#b4553a] ${playing ? "eq-bar" : "h-1"}`} style={playing ? { height: "100%", animationDelay: `${d}s` } : undefined} />
        ))}
      </span>
      <span className="min-w-0 truncate text-[13px] font-semibold">{title}</span>
    </button>
  )
}

/* ---------- invitation ---------- */

function Invite({ gift, onOpen }: { gift: PublicGift; onOpen: () => void }) {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-16 pt-10 text-center" style={{ color: INK }}>
      <div className="gift-rise">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-white/60 text-5xl shadow-[0_20px_50px_-20px_rgb(180_85_58/0.6)] ring-1 ring-white backdrop-blur animate-float" style={{ "--r": "-4deg" } as CSSProperties}>
          🎁
        </div>
        <p className="mt-10 text-[13px] font-bold uppercase tracking-[0.3em] text-[#b07b66]">Для тебя есть сюрприз</p>
        <h1 className="mt-4 font-script text-[clamp(52px,15vw,88px)] leading-[0.95] text-[#b4553a]">{gift.recipient}</h1>
        <p className="mx-auto mt-5 max-w-[280px] font-serif text-xl italic leading-snug text-[#7a5446]">Кто-то собрал для тебя немного тёплых воспоминаний</p>
      </div>
      <button
        onClick={onOpen}
        className="gift-rise mt-12 h-16 w-full max-w-[300px] rounded-full bg-[#b4553a] text-lg font-bold text-white shadow-[0_20px_40px_-14px_rgb(180_85_58/0.85)] transition active:scale-[0.97]"
        style={{ animationDelay: "0.25s" }}
      >
        Открыть 🎁
      </button>
      {gift.music ? (
        <p className="gift-rise mt-4 text-xs text-[#9b7a6c]" style={{ animationDelay: "0.4s" }}>
          🔊 Включи звук — тут есть музыка
        </p>
      ) : null}
    </section>
  )
}

/* ---------- wishes ---------- */

/** Reveals the text letter by letter; a tap shows it all at once. Space is reserved so nothing jumps. */
function Typewriter({ text, onDone }: { text: string; onDone: () => void }) {
  const [n, setN] = useState(0)
  const done = n >= text.length
  const finished = useRef(onDone)
  useEffect(() => {
    finished.current = onDone
  })

  useEffect(() => {
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let i = instant ? text.length - 1 : 0
    let t: ReturnType<typeof setTimeout>
    const step = () => {
      i++
      setN(i)
      if (i >= text.length) return
      const c = text[i - 1]
      t = setTimeout(step, /[.!?…]/.test(c) ? 420 : /[,;:—]/.test(c) ? 200 : c === "\n" ? 300 : 38 + Math.random() * 30)
    }
    t = setTimeout(step, instant ? 0 : 500)
    return () => clearTimeout(t)
  }, [text])

  useEffect(() => {
    if (done) finished.current()
  }, [done])

  return (
    <p className="relative cursor-default whitespace-pre-line font-serif text-[clamp(25px,6.6vw,34px)] font-medium leading-[1.28]" onClick={() => setN(text.length)}>
      <span>{text.slice(0, n)}</span>
      {!done ? <span className="gift-caret" /> : null}
      <span className="invisible">{text.slice(n)}</span>
    </p>
  )
}

function Wishes({ gift, onTyped, typed }: { gift: PublicGift; onTyped: () => void; typed: boolean }) {
  return (
    <section className="relative flex min-h-dvh flex-col justify-center px-7 py-20" style={{ color: INK }}>
      <div className="mx-auto w-full max-w-[520px]">
        <p className="gift-rise text-[13px] font-bold uppercase tracking-[0.3em] text-[#b07b66]">✦ для тебя ✦</p>
        <div className="mt-5">
          <Typewriter text={gift.message} onDone={onTyped} />
        </div>
        {gift.signature ? (
          <p className={`mt-8 text-right font-script text-[clamp(30px,8vw,40px)] text-[#b4553a] transition-all duration-1000 ${typed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
            {gift.signature}
          </p>
        ) : null}
      </div>
      {gift.collages.length ? (
        <div className={`absolute inset-x-0 bottom-[88px] flex flex-col items-center text-[#9b7a6c] transition-opacity duration-1000 ${typed ? "opacity-100" : "opacity-0"}`}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Листай вниз</span>
          <ChevronDown size={22} className="mt-1 animate-bounce" />
        </div>
      ) : null}
    </section>
  )
}

/* ---------- gallery ---------- */

const TILTS = [-3.5, 2.5, -2, 3, -1.5, 2]

function Polaroid({ collage, index, onOpen }: { collage: GiftCollage; index: number; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <button
      ref={ref}
      onClick={onOpen}
      data-in={seen}
      className="polaroid block w-full rounded-[3px] bg-[#fffdf8] p-[4%] pb-[13%] text-left shadow-[0_30px_60px_-28px_rgb(90_40_25/0.55),0_6px_16px_-8px_rgb(90_40_25/0.3)]"
      style={{ "--r": `${TILTS[index % TILTS.length]}deg` } as CSSProperties}
      aria-label={`Открыть коллаж ${index + 1}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={collage.url} alt="" width={collage.w} height={collage.h} loading="lazy" className="block h-auto w-full bg-[#f1e7dc]" draggable={false} />
    </button>
  )
}

function Lightbox({ collages, index, onIndex, onClose }: { collages: GiftCollage[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ x: number; y: number; id: number } | null>(null)
  const last = collages.length - 1
  const go = useCallback((i: number) => onIndex(Math.max(0, Math.min(last, i))), [onIndex, last])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") go(index + 1)
      if (e.key === "ArrowLeft") go(index - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [index, go, onClose])

  const down = (e: ReactPointerEvent) => {
    // capturing the pointer would swallow the click on the arrows
    if ((e.target as HTMLElement).closest("button")) return
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: ReactPointerEvent) => {
    if (!drag.current) return
    let d = e.clientX - drag.current.x
    // resist past the first and last collage
    if ((index === 0 && d > 0) || (index === last && d < 0)) d /= 3
    setDx(d)
  }
  const up = (e: ReactPointerEvent) => {
    if (!drag.current) return
    const d = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current = null
    setDragging(false)
    setDx(0)
    if (Math.abs(d) > Math.min(80, window.innerWidth * 0.18)) go(index + (d < 0 ? 1 : -1))
    else if (dy > 120 && Math.abs(d) < 40) onClose()
  }

  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-[#1b1411]/95 text-white backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Коллажи">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
        <span className="text-sm font-semibold tabular-nums text-white/70">
          {index + 1} / {collages.length}
        </span>
        <button onClick={onClose} className="grid size-11 place-items-center rounded-full bg-white/10" aria-label="Закрыть">
          <X size={20} />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 touch-pan-y overflow-hidden" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div
          className="flex h-full"
          style={{ transform: `translateX(calc(${-index * 100}% + ${dx}px))`, transition: dragging ? "none" : "transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1)" }}
        >
          {collages.map((c, i) => (
            <div key={c.url} className="flex h-full w-full shrink-0 items-center justify-center p-4 sm:p-10">
              {Math.abs(i - index) <= 1 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.url} alt={`Коллаж ${i + 1}`} className="max-h-full max-w-full select-none rounded-[3px] object-contain shadow-2xl" draggable={false} />
              ) : null}
            </div>
          ))}
        </div>
        {index > 0 ? (
          <button onClick={() => go(index - 1)} className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid" aria-label="Предыдущий">
            <ChevronLeft size={24} />
          </button>
        ) : null}
        {index < last ? (
          <button onClick={() => go(index + 1)} className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid" aria-label="Следующий">
            <ChevronRight size={24} />
          </button>
        ) : null}
      </div>
      <div className="flex shrink-0 justify-center gap-1.5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        {collages.map((c, i) => (
          <button key={c.url} onClick={() => go(i)} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/35"}`} aria-label={`Коллаж ${i + 1}`} />
        ))}
      </div>
    </div>,
    document.body,
  )
}

function Gallery({ collages }: { collages: GiftCollage[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!collages.length) return null
  return (
    <section className="relative px-7 pb-10 pt-4">
      <div className="mx-auto flex max-w-[460px] flex-col gap-14">
        {collages.map((c, i) => (
          <Polaroid key={c.url} collage={c} index={i} onOpen={() => setOpen(i)} />
        ))}
      </div>
      {open !== null ? <Lightbox collages={collages} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </section>
  )
}

/* ---------- finale ---------- */

function Finale({ gift, onReplay }: { gift: PublicGift; onReplay: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        const r = e.target.getBoundingClientRect()
        confetti(r.left + r.width / 2, r.top, { count: 120, power: 0.9 })
        io.disconnect()
      },
      { threshold: 0.8 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="relative flex min-h-[80dvh] flex-col items-center justify-center px-7 pb-32 pt-16 text-center" style={{ color: INK }}>
      <h2 ref={ref} className="font-script text-[clamp(44px,13vw,72px)] leading-[1.05] text-[#b4553a]">
        {gift.finale}
      </h2>
      <button
        onClick={onReplay}
        className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-white/80 px-7 text-base font-semibold shadow-[0_16px_40px_-18px_rgb(120_60_40/0.6)] ring-1 ring-white backdrop-blur transition active:scale-[0.97]"
      >
        <RotateCcw size={18} /> Посмотреть ещё раз
      </button>

      <div className="mt-20 flex flex-col items-center gap-3">
        <p className="text-xs text-[#9b7a6c]">
          Создано в <span className="font-serif text-[15px] font-semibold italic text-[#7a5446]">Memoria</span>
        </p>
        <Link href="/register" className="inline-flex h-10 items-center rounded-full border border-[#d9b8a8] px-5 text-[13px] font-semibold text-[#7a5446] transition hover:bg-white/60">
          Сделать свой коллаж
        </Link>
      </div>
    </section>
  )
}

/* ---------- page ---------- */

type Stage = "invite" | "opening" | "open"

function Surprise({ gift }: { gift: PublicGift }) {
  const [stage, setStage] = useState<Stage>("invite")
  const [typed, setTyped] = useState(false)
  const [round, setRound] = useState(0)
  const music = useMusic(gift.music)

  const open = () => {
    music.start()
    setStage("opening")
  }
  const replay = () => {
    window.scrollTo({ top: 0 })
    setTyped(false)
    setRound((r) => r + 1)
    setStage("opening")
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden" style={{ color: INK }}>
      <Backdrop dense={stage === "open"} />
      <div className="relative">
        {stage === "invite" ? <Invite gift={gift} onOpen={open} /> : null}
        {stage === "opening" ? (
          <section key={round} className="flex min-h-dvh items-center justify-center overflow-hidden py-10">
            <OpeningScene kind={gift.animation} name={gift.recipient} onDone={() => setStage("open")} />
          </section>
        ) : null}
        {stage === "open" ? (
          <div key={round} className="animate-fade-in">
            <Wishes gift={gift} typed={typed} onTyped={() => setTyped(true)} />
            <Gallery collages={gift.collages} />
            <Finale gift={gift} onReplay={replay} />
          </div>
        ) : null}
      </div>
      {gift.music && stage !== "invite" ? <MusicButton title={gift.music.title} playing={music.playing} onToggle={music.toggle} /> : null}
    </div>
  )
}

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-8 text-center" style={{ color: INK }}>
      <Backdrop />
      <div className="relative">
        <p className="text-5xl">🎈</p>
        <h1 className="mt-6 font-serif text-4xl font-medium">{title}</h1>
        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-[#7a5446]">{text}</p>
        <Link href="/register" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#b4553a] px-6 font-semibold text-white">
          Сделать свой коллаж
        </Link>
      </div>
    </div>
  )
}

export function GiftSplash() {
  return (
    <div className="relative grid min-h-dvh place-items-center">
      <Backdrop />
      <span className="relative text-5xl animate-float">🎁</span>
    </div>
  )
}

export function GiftView({ id }: { id: string }) {
  const { data, error, isPending, refetch } = usePublicGift(id)
  if (isPending) return <GiftSplash />
  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <Message title="Сюрприз не найден" text="Возможно, ссылка неполная или подарок уже удалили. Попроси отправителя прислать её ещё раз." />
    }
    return (
      <div onClick={() => refetch()}>
        <Message title="Нет связи" text="Не получилось загрузить сюрприз. Проверь интернет и нажми на экран, чтобы попробовать снова." />
      </div>
    )
  }
  return <Surprise gift={data} />
}
