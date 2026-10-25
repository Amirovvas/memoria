"use client"

import { ChevronDown, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { createPortal } from "react-dom"
import { usePublicGift } from "@/src/hooks/usePublicGift"
import { ApiError } from "@/src/lib/api"
import { confetti } from "@/src/lib/confetti"
import type { GiftCollage, GiftMusic, PublicGift } from "@/src/lib/gifts"
import { cx } from "@/src/lib/cx"
import { OpeningScene } from "./openings"
import g from "./gift.module.css"
import s from "./GiftView.module.css"

const INK = "#3b2a22"

/** Soft warm paper with slow drifting hearts; the page keeps these colours in both themes. */
function Backdrop({ dense }: { dense?: boolean }) {
  const items = ["♥", "✦", "♥", "✧", "♥", "✦", "♥", "✧", "♥", "✦"].slice(0, dense ? 10 : 6)
  return (
    <div className={s.backdrop} aria-hidden>
      <div className={s.paper} />
      <div className={s.glowWarm} />
      <div className={s.glowPink} />
      {items.map((c, i) => (
        <span
          key={i}
          className={`${g.giftDrift} ${s.driftItem}`}
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
      className={s.music}
      aria-label={playing ? "Поставить музыку на паузу" : "Включить музыку"}
      style={{ color: INK }}
    >
      <span className={s.musicIcon}>
        {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className={s.playIcon} />}
      </span>
      <span className={s.equalizer} aria-hidden>
        {[0, 0.2, 0.4, 0.1].map((d, i) => (
          <span key={i} className={cx(s.bar, playing ? g.eqBar : s.barIdle)} style={playing ? { height: "100%", animationDelay: `${d}s` } : undefined} />
        ))}
      </span>
      <span className={s.musicTitle}>{title}</span>
    </button>
  )
}

/* ---------- invitation ---------- */

function Invite({ gift, onOpen }: { gift: PublicGift; onOpen: () => void }) {
  return (
    <section className={s.invite} style={{ color: INK }}>
      <div className={g.giftRise}>
        <div className={`animate-float ${s.giftIcon}`} style={{ "--r": "-4deg" } as CSSProperties}>
          🎁
        </div>
        <p className={cx(s.eyebrow, s.inviteEyebrow)}>Для тебя есть сюрприз</p>
        <h1 className={cx(s.script, s.recipient)}>{gift.recipient}</h1>
        <p className={s.inviteLead}>Кто-то собрал для тебя немного тёплых воспоминаний</p>
      </div>
      <button
        onClick={onOpen}
        className={cx(g.giftRise, s.pressable, s.openButton)}
        style={{ animationDelay: "0.25s" }}
      >
        Открыть 🎁
      </button>
      {gift.music ? (
        <p className={cx(g.giftRise, s.soundHint)} style={{ animationDelay: "0.4s" }}>
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
    <p className={s.typewriter} onClick={() => setN(text.length)}>
      <span>{text.slice(0, n)}</span>
      {!done ? <span className={g.giftCaret} /> : null}
      <span className={s.invisible}>{text.slice(n)}</span>
    </p>
  )
}

function Wishes({ gift, onTyped, typed }: { gift: PublicGift; onTyped: () => void; typed: boolean }) {
  return (
    <section className={s.wishes} style={{ color: INK }}>
      <div className={s.wishesInner}>
        <p className={cx(g.giftRise, s.eyebrow)}>✦ для тебя ✦</p>
        <div className={s.message}>
          <Typewriter text={gift.message} onDone={onTyped} />
        </div>
        {gift.signature ? (
          <p className={cx(s.script, s.signature, typed && s.shown)}>
            {gift.signature}
          </p>
        ) : null}
      </div>
      {gift.collages.length ? (
        <div className={cx(s.scrollHint, typed && s.shown)}>
          <span className={s.scrollLabel}>Листай вниз</span>
          <ChevronDown size={22} className={s.bounce} />
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
      className={`${g.polaroid} ${s.print}`}
      style={{ "--r": `${TILTS[index % TILTS.length]}deg` } as CSSProperties}
      aria-label={`Открыть коллаж ${index + 1}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={collage.url} alt="" width={collage.w} height={collage.h} loading="lazy" className={s.printImage} draggable={false} />
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
    <div className={`animate-fade-in ${s.lightbox}`} role="dialog" aria-modal="true" aria-label="Коллажи">
      <div className={s.lightboxTop}>
        <span className={s.counter}>
          {index + 1} / {collages.length}
        </span>
        <button onClick={onClose} className={s.closeButton} aria-label="Закрыть">
          <X size={20} />
        </button>
      </div>
      <div className={s.stage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div
          className={s.track}
          style={{ transform: `translateX(calc(${-index * 100}% + ${dx}px))`, transition: dragging ? "none" : "transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1)" }}
        >
          {collages.map((c, i) => (
            <div key={c.url} className={s.slide}>
              {Math.abs(i - index) <= 1 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.url} alt={`Коллаж ${i + 1}`} className={s.slideImage} draggable={false} />
              ) : null}
            </div>
          ))}
        </div>
        {index > 0 ? (
          <button onClick={() => go(index - 1)} className={`${s.arrow} ${s.arrowLeft}`} aria-label="Предыдущий">
            <ChevronLeft size={24} />
          </button>
        ) : null}
        {index < last ? (
          <button onClick={() => go(index + 1)} className={`${s.arrow} ${s.arrowRight}`} aria-label="Следующий">
            <ChevronRight size={24} />
          </button>
        ) : null}
      </div>
      <div className={s.dots}>
        {collages.map((c, i) => (
          <button key={c.url} onClick={() => go(i)} className={cx(s.dot, i === index && s.dotActive)} aria-label={`Коллаж ${i + 1}`} />
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
    <section className={s.gallery}>
      <div className={s.galleryList}>
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
    <section className={s.finale} style={{ color: INK }}>
      <h2 ref={ref} className={cx(s.script, s.finaleTitle)}>
        {gift.finale}
      </h2>
      <button
        onClick={onReplay}
        className={cx(s.pressable, s.replay)}
      >
        <RotateCcw size={18} /> Посмотреть ещё раз
      </button>

      <div className={s.credits}>
        <p className={s.madeIn}>
          Создано в <span className={s.brand}>Memoria</span>
        </p>
        <Link href="/register" className={s.makeOwn}>
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
    <div className={s.surprise} style={{ color: INK }}>
      <Backdrop dense={stage === "open"} />
      <div className={s.relative}>
        {stage === "invite" ? <Invite gift={gift} onOpen={open} /> : null}
        {stage === "opening" ? (
          <section key={round} className={s.openingStage}>
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
    <div className={s.notice} style={{ color: INK }}>
      <Backdrop />
      <div className={s.relative}>
        <p className={s.emoji}>🎈</p>
        <h1 className={s.noticeTitle}>{title}</h1>
        <p className={s.noticeText}>{text}</p>
        <Link href="/register" className={s.noticeLink}>
          Сделать свой коллаж
        </Link>
      </div>
    </div>
  )
}

export function GiftSplash() {
  return (
    <div className={s.splash}>
      <Backdrop />
      <span className={`animate-float ${s.relative} ${s.emoji}`}>🎁</span>
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
