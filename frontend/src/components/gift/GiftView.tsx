"use client"

import { ChevronDown, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Volume2, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { createPortal } from "react-dom"
import { usePublicGift } from "@/src/hooks/usePublicGift"
import { ApiError } from "@/src/lib/api"
import { confetti } from "@/src/lib/confetti"
import type { GiftCollage, GiftMusic, PublicGift } from "@/src/lib/gifts"
import { cx } from "@/src/lib/cx"
import { GameStage } from "./games"
import { OpeningScene } from "./openings"
import g from "./gift.module.css"
import s from "./GiftView.module.css"

/* The surprise page is a small night-time film: dark screen, film grain, warm light, gold titles. */

/** Dark room: a warm spotlight from above, slow gold dust, film grain and a vignette. */
function Backdrop({ dust = 10 }: { dust?: number }) {
  return (
    <div className={s.backdrop} aria-hidden>
      <div className={s.spot} />
      {Array.from({ length: dust }, (_, i) => (
        <span
          key={i}
          className={s.dust}
          style={{
            left: `${(i * 37 + 7) % 96}%`,
            animationDuration: `${16 + ((i * 5) % 11)}s`,
            animationDelay: `${-i * 2.3}s`,
            scale: `${0.6 + ((i * 3) % 5) / 6}`,
          }}
        />
      ))}
      <div className={s.vignette} />
      <div className={s.grain} />
    </div>
  )
}

/** A smooth vector heart with a soft glow, the same on every phone (emoji hearts are not). */
function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 92" className={cx(s.heart, className)} aria-hidden>
      <defs>
        <linearGradient id="heart-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a9a" />
          <stop offset="0.55" stopColor="#e2475f" />
          <stop offset="1" stopColor="#a8263f" />
        </linearGradient>
      </defs>
      <path
        d="M50 88 C 22 68, 4 50, 4 28 C 4 13, 15 4, 28 4 C 38 4, 46 10, 50 19 C 54 10, 62 4, 72 4 C 85 4, 96 13, 96 28 C 96 50, 78 68, 50 88 Z"
        fill="url(#heart-fill)"
      />
      <path d="M24 18 C 18 21, 15 27, 16 33" fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

/** The finale line without the emoji hearts people end it with: the page draws its own heart. */
const withoutEmoji = (text: string) => text.replace(/[\s\p{Extended_Pictographic}️‍]+$/u, "") || text

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
    <button onClick={onToggle} className={s.music} aria-label={playing ? "Поставить музыку на паузу" : "Включить музыку"}>
      <span className={s.musicIcon}>
        {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className={s.playIcon} />}
      </span>
      <span className={s.musicTitle}>{title}</span>
      <span className={s.equalizer} aria-hidden>
        {[0, 0.2, 0.4, 0.1].map((d, i) => (
          <span key={i} className={cx(s.bar, playing ? g.eqBar : s.barIdle)} style={playing ? { height: "100%", animationDelay: `${d}s` } : undefined} />
        ))}
      </span>
    </button>
  )
}

/* ---------- invitation: a premiere poster ---------- */

function Invite({ gift, onOpen }: { gift: PublicGift; onOpen: () => void }) {
  return (
    <section className={s.invite}>
      <p className={cx(g.giftRise, s.caps)}>премьера для тебя</p>
      <h1 className={cx(g.giftRise, s.recipient)} style={{ animationDelay: "0.12s" }}>
        {gift.recipient}
      </h1>
      <p className={cx(g.giftRise, s.inviteLead)} style={{ animationDelay: "0.24s" }}>
        Кто-то снял о тебе маленький фильм из тёплых воспоминаний
      </p>
      <button onClick={onOpen} className={cx(g.giftRise, s.pressable, s.openButton)} style={{ animationDelay: "0.4s" }}>
        <span className={s.openIcon}>
          <Play size={14} fill="currentColor" />
        </span>
        Смотреть
      </button>
      {gift.music ? (
        <p className={cx(g.giftRise, s.soundHint)} style={{ animationDelay: "0.55s" }}>
          <Volume2 size={14} /> со звуком — так лучше
        </p>
      ) : null}
      <p className={s.presents}>Memoria · представляет</p>
    </section>
  )
}

/* ---------- countdown: the leader of an old film reel ---------- */

function Countdown({ name, onDone }: { name: string; onDone: () => void }) {
  const [n, setN] = useState(3)
  const finished = useRef(onDone)
  useEffect(() => {
    finished.current = onDone
  })
  useEffect(() => {
    const fast = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const step = fast ? 250 : 950
    const timers = [setTimeout(() => setN(2), step), setTimeout(() => setN(1), step * 2), setTimeout(() => finished.current(), step * 3)]
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <section className={s.countdown}>
      <span className={s.scratchLine} style={{ left: "13%" }} />
      <span className={s.scratchLine} style={{ left: "71%", animationDelay: "0.4s" }} />
      <div className={s.leader}>
        <span className={s.sweep} key={n} />
        <span className={s.crossV} />
        <span className={s.crossH} />
        <span key={`n${n}`} className={s.leaderNum}>
          {n}
        </span>
      </div>
      <p className={s.reel}>Roll 01 · {name}</p>
    </section>
  )
}

/* ---------- wishes: opening titles ---------- */

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
      {!done ? <span className={s.caret} /> : null}
      <span className={s.invisible}>{text.slice(n)}</span>
    </p>
  )
}

function Wishes({ gift, onTyped, typed }: { gift: PublicGift; onTyped: () => void; typed: boolean }) {
  return (
    <section className={s.wishes}>
      <div className={s.wishesInner}>
        <p className={cx(g.giftRise, s.caps, s.gold)}>✦ для тебя ✦</p>
        <div className={s.message}>
          <Typewriter text={gift.message} onDone={onTyped} />
        </div>
        {gift.signature ? <p className={cx(s.signature, typed && s.shown)}>{gift.signature}</p> : null}
      </div>
      {gift.collages.length ? (
        <div className={cx(s.scrollHint, typed && s.shown)}>
          <span className={s.scrollLabel}>Листай вниз</span>
          <ChevronDown size={20} className={s.bounce} />
        </div>
      ) : null}
    </section>
  )
}

/* ---------- gallery: a strip of film ---------- */

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
          Кадр {String(index + 1).padStart(2, "0")} из {String(collages.length).padStart(2, "0")}
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

/** Collages on a horizontal strip of film; the frame in the middle is lit, a tap opens it full screen. */
function FilmStrip({ collages }: { collages: GiftCollage[] }) {
  const reel = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<number | null>(null)

  const onScroll = () => {
    const el = reel.current
    if (!el) return
    const mid = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let dist = Infinity
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      if (d < dist) {
        dist = d
        best = i
      }
    })
    setActive(best)
  }
  const goTo = (i: number) => {
    const c = reel.current?.children[i] as HTMLElement | undefined
    c?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }

  // the strip starts with the first frame in the middle, not with empty film
  useLayoutEffect(() => {
    const el = reel.current
    const first = el?.children[0] as HTMLElement | undefined
    if (el && first) el.scrollLeft = first.offsetLeft + first.offsetWidth / 2 - el.clientWidth / 2
  }, [])

  if (!collages.length) return null
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    <section className={s.gallery}>
      <p className={cx(s.caps, s.galleryEyebrow)}>Кадры</p>
      <div className={s.strip}>
        <span className={cx(s.holes, s.holesTop)} />
        <div ref={reel} className={cx("scrollbar-none", s.reel2)} onScroll={onScroll}>
          {collages.map((c, i) => (
            <button
              key={c.url}
              onClick={() => (i === active ? setOpen(i) : goTo(i))}
              className={cx(s.frame, i === active && s.frameActive)}
              style={{ "--ratio": `${c.w} / ${c.h}` } as CSSProperties}
              aria-label={`Кадр ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.url} alt="" width={c.w} height={c.h} loading="lazy" className={s.frameImage} draggable={false} />
            </button>
          ))}
        </div>
        <span className={s.stock}>KODAK 400 ▸ {pad(active + 1)}A</span>
        <span className={cx(s.holes, s.holesBottom)} />
      </div>
      <div className={s.frameInfo}>
        <p className={s.caps}>
          Кадр {pad(active + 1)} из {pad(collages.length)}
        </p>
        {collages.length > 1 ? (
          <div className={s.stripDots}>
            {collages.map((c, i) => (
              <button key={c.url} onClick={() => goTo(i)} className={cx(s.stripDot, i === active && s.stripDotOn)} aria-label={`Кадр ${i + 1}`} />
            ))}
          </div>
        ) : null}
        <p className={s.swipe}>{collages.length > 1 ? "← листай кадры · нажми, чтобы открыть →" : "нажми на кадр, чтобы открыть"}</p>
      </div>
      {open !== null ? <Lightbox collages={collages} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </section>
  )
}

/* ---------- finale: the last frame ---------- */

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

  const cover = gift.collages[gift.collages.length - 1]
  return (
    <section className={s.finale}>
      {cover ? <div className={s.finaleBg} style={{ backgroundImage: `url("${cover.url}")` }} aria-hidden /> : null}
      <div className={s.finaleShade} aria-hidden />
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={s.spark} style={{ left: `${(i * 29 + 9) % 92}%`, top: `${(i * 41 + 12) % 78}%`, animationDelay: `${i * 0.35}s` }} aria-hidden />
      ))}
      <div className={s.finaleInner}>
        <p className={cx(s.caps, s.gold)}>Финал</p>
        <h2 ref={ref} className={s.finaleTitle}>
          {withoutEmoji(gift.finale)}
        </h2>
        <Heart className={s.finaleHeart} />
        <p className={s.theEnd}>конец? нет — только начало</p>
        <div className={s.finaleButtons}>
          <button onClick={onReplay} className={cx(s.pressable, s.replay)}>
            <RotateCcw size={16} /> Посмотреть ещё раз
          </button>
          <Link href="/register" className={s.makeOwn}>
            Сделать свой фильм
          </Link>
        </div>
        <p className={s.madeIn}>
          Создано в <span className={s.brand}>Memoria</span>
        </p>
      </div>
    </section>
  )
}

/* ---------- page ---------- */

type Stage = "invite" | "countdown" | "opening" | "game" | "open"

function Surprise({ gift }: { gift: PublicGift }) {
  const [stage, setStage] = useState<Stage>("invite")
  const [typed, setTyped] = useState(false)
  const [round, setRound] = useState(0)
  const music = useMusic(gift.music)
  // gifts made before the games have no game; a gift always has at least one collage, but stay safe
  const game = gift.game && gift.game !== "none" && gift.collages[0] ? gift.game : null

  const open = () => {
    music.start()
    setStage("countdown")
  }
  const replay = () => {
    window.scrollTo({ top: 0 })
    setTyped(false)
    setRound((r) => r + 1)
    setStage("countdown")
  }

  return (
    <div className={s.surprise}>
      <Backdrop dust={stage === "open" ? 14 : 8} />
      <div className={s.relative}>
        {stage === "invite" ? <Invite gift={gift} onOpen={open} /> : null}
        {stage === "countdown" ? <Countdown key={round} name={gift.recipient} onDone={() => setStage("opening")} /> : null}
        {stage === "opening" ? (
          <section key={round} className={cx(s.openingStage, g.night)}>
            <OpeningScene kind={gift.animation} name={gift.recipient} onDone={() => setStage(game ? "game" : "open")} />
          </section>
        ) : null}
        {stage === "game" && game ? <GameStage key={round} game={game} collage={gift.collages[0]} onDone={() => setStage("open")} /> : null}
        {stage === "open" ? (
          <div key={round} className="animate-fade-in">
            <Wishes gift={gift} typed={typed} onTyped={() => setTyped(true)} />
            <FilmStrip collages={gift.collages} />
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
    <div className={s.notice}>
      <Backdrop />
      <div className={s.relative}>
        <p className={s.caps}>Сеанс отменён</p>
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
      <div className={cx(s.relative, s.splashReel)} aria-label="Загружаем сюрприз">
        <span />
      </div>
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
