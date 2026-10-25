"use client"

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { confettiFrom } from "@/src/lib/confetti"
import type { Opening as OpeningKind } from "@/src/lib/gifts"
import s from "./gift.module.css"

const size = (w: string) => ({ "--w": w }) as CSSProperties

/** Runs `steps` one after another: [delay ms, action]. Cancelled on unmount. */
function useTimeline(steps: [number, () => void][], enabled = true) {
  const latest = useRef(steps)
  useEffect(() => {
    latest.current = steps
  })
  useEffect(() => {
    if (!enabled) return
    let total = 0
    const timers = latest.current.map(([delay], i) => {
      total += delay
      return setTimeout(() => latest.current[i][1](), total)
    })
    return () => timers.forEach(clearTimeout)
  }, [enabled])
}

/* ---------- envelope ---------- */

function EnvelopeArt({ phase, name, demo }: { phase: string; name?: string; demo?: boolean }) {
  return (
    <div className={s.env} data-phase={phase} data-demo={demo || undefined}>
      <div className={s.envBack} />
      <div className={s.envCard}>
        {name ? (
          <div className={s.cardText}>
            <p className={s.forYou}>для тебя</p>
            <p className={s.envName}>{name}</p>
            <p className={`${s.heart} ${s.heartLarge}`}>♥</p>
          </div>
        ) : (
          <span className={s.heart}>♥</span>
        )}
      </div>
      <div className={s.envFront} />
      <div className={s.envFlap} />
      <div className={s.envSeal}>♥</div>
    </div>
  )
}

function Envelope({ name, onDone }: { name: string; onDone: () => void }) {
  const [phase, setPhase] = useState("closed")
  useTimeline([
    [700, () => setPhase("open")],
    [800, () => setPhase("out")],
    [1500, () => setPhase("leave")],
    [900, onDone],
  ])
  return (
    <div className={s.envelopeScene}>
      <EnvelopeArt phase={phase} name={name} />
    </div>
  )
}

/* ---------- gift box ---------- */

function BoxArt({ phase }: { phase: "idle" | "open" }) {
  return (
    <div className={s.box} data-phase={phase}>
      <div className={s.boxGlow} />
      <div className={s.boxBase} />
      <div className={s.boxLid}>
        <div className={s.boxBow} />
      </div>
    </div>
  )
}

function GiftBox({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"idle" | "open">("idle")
  const ref = useRef<HTMLButtonElement>(null)
  const open = () => {
    if (phase === "open") return
    setPhase("open")
    setTimeout(() => confettiFrom(ref.current, { count: 220, power: 1.15 }), 220)
  }
  useTimeline([[2600, open]], phase === "idle")
  useTimeline([[2300, onDone]], phase === "open")
  return (
    <div className={s.column}>
      <button ref={ref} onClick={open} aria-label="Открыть коробку" className={s.boxButton} style={size("min(250px, 62vw)")}>
        <BoxArt phase={phase} />
      </button>
      <p className={`${s.prompt} ${s.boxPrompt} ${phase === "open" ? s.hidden : ""}`}>Нажми на коробку</p>
    </div>
  )
}

/* ---------- cake ---------- */

const CANDLES = 5

/** `out[i]` is null while the candle burns, otherwise the side it was blown towards (-1 or 1). */
type Candles = (number | null)[]

function CakeArt({ out }: { out: Candles }) {
  return (
    <div className={s.cake}>
      <div className={s.cakeCandles}>
        {out.map((o, i) => (
          <span key={i} className={s.candle} data-candle={i} data-out={o !== null} style={{ "--dx": o ?? 0 } as CSSProperties}>
            <span className={s.flame} />
            <span className={s.smoke} />
            <span className={s.candleStick} />
          </span>
        ))}
      </div>
      <div className={`${s.cakeTier} ${s.cakeTop}`} />
      <div className={`${s.cakeTier} ${s.cakeBottom}`} />
      <div className={s.cakePlate} />
    </div>
  )
}

/**
 * Candles go out under a finger sliding across them, as if blown out in that direction;
 * a tap works too. No microphone: nothing to allow, works on any phone.
 */
function useSwipeOut(setOut: (fn: (o: Candles) => Candles) => void) {
  const last = useRef<{ x: number; y: number } | null>(null)

  const hit = (x: number, y: number, dir: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-candle]")
    if (!el) return
    const i = Number(el.dataset.candle)
    setOut((o) => (o[i] === null ? o.map((v, j) => (j === i ? dir : v)) : o))
  }

  // a fast swipe skips past candles between two pointer events, so check the whole segment
  const sweep = (x: number, y: number) => {
    const from = last.current ?? { x, y }
    const dir = x >= from.x ? 1 : -1
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / 6))
    for (let k = 1; k <= steps; k++) hit(from.x + ((x - from.x) * k) / steps, from.y + ((y - from.y) * k) / steps, dir)
    last.current = { x, y }
  }

  return {
    onPointerDown: (e: ReactPointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      last.current = { x: e.clientX, y: e.clientY }
      hit(e.clientX, e.clientY, Math.random() < 0.5 ? -1 : 1)
    },
    onPointerMove: (e: ReactPointerEvent) => {
      if (last.current) sweep(e.clientX, e.clientY)
    },
    onPointerUp: () => {
      last.current = null
    },
    onPointerCancel: () => {
      last.current = null
    },
  }
}

function Cake({ onDone }: { onDone: () => void }) {
  const [out, setOut] = useState<Candles>(() => Array(CANDLES).fill(null))
  const ref = useRef<HTMLDivElement>(null)
  const swipe = useSwipeOut(setOut)
  const done = out.every((o) => o !== null)
  const left = out.filter((o) => o === null).length

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => confettiFrom(ref.current, { count: 220 }), 350)
    return () => clearTimeout(t)
  }, [done])
  useTimeline([[2600, onDone]], done)

  return (
    <div className={`${s.column} ${s.cakeScene}`}>
      <p className={`${s.prompt} ${s.wish} ${done ? s.hidden : ""}`}>
        Загадай желание
        <br />и задуй свечи
      </p>
      <div ref={ref} className={s.cakeTouch} style={size("min(280px, 70vw)")} {...swipe}>
        <CakeArt out={out} />
      </div>
      <div className={s.cakeFooter}>
        {done ? (
          <p className={`${s.giftRise} ${s.hooray}`}>Ура! 🎉</p>
        ) : (
          <>
            <p className={s.hintTrack} aria-hidden>
              <span className={`${s.swipeHint} ${s.hintHand}`}>👆</span>
            </p>
            <p className={s.swipeText}>Проведи пальцем по свечам</p>
            <p className={s.swipeLeft}>{left === CANDLES ? "или нажми на каждую" : `осталось: ${left}`}</p>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- public ---------- */

export function OpeningScene({ kind, name, onDone }: { kind: OpeningKind; name: string; onDone: () => void }) {
  if (kind === "envelope")
    return (
      <div style={size("min(330px, 84vw)")}>
        <Envelope name={name} onDone={onDone} />
      </div>
    )
  if (kind === "box") return <GiftBox onDone={onDone} />
  return <Cake onDone={onDone} />
}

/** Small looping illustration for the choice in the wizard. */
export function OpeningPreview({ kind }: { kind: OpeningKind }) {
  return (
    <span className={s.preview}>
      {kind === "envelope" ? (
        <span className={s.previewEnvelope} style={size("120px")}>
          <EnvelopeArt phase="closed" demo />
        </span>
      ) : kind === "box" ? (
        <span style={size("86px")}>
          <BoxArt phase="idle" />
        </span>
      ) : (
        <span style={size("104px")}>
          <CakeArt out={Array(CANDLES).fill(null)} />
        </span>
      )}
    </span>
  )
}
