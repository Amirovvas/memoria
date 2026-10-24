"use client"

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { confettiFrom } from "@/src/lib/confetti"
import type { Opening as OpeningKind } from "@/src/lib/gifts"

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
    <div className="env" data-phase={phase} data-demo={demo || undefined}>
      <div className="env-back" />
      <div className="env-card">
        {name ? (
          <div className="px-3 text-center text-[#5b3a2e]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b07b66]">для тебя</p>
            <p className="mt-1 font-script text-[clamp(28px,8vw,42px)] leading-none">{name}</p>
            <p className="mt-1 text-xl text-[#d0705a]">♥</p>
          </div>
        ) : (
          <span className="text-[#d0705a]">♥</span>
        )}
      </div>
      <div className="env-front" />
      <div className="env-flap" />
      <div className="env-seal">♥</div>
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
    <div className="pt-[18vh]">
      <EnvelopeArt phase={phase} name={name} />
    </div>
  )
}

/* ---------- gift box ---------- */

function BoxArt({ phase }: { phase: "idle" | "open" }) {
  return (
    <div className="box" data-phase={phase}>
      <div className="box-glow" />
      <div className="box-base" />
      <div className="box-lid">
        <div className="box-bow" />
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
    <div className="flex flex-col items-center">
      <button ref={ref} onClick={open} aria-label="Открыть коробку" className="cursor-pointer" style={size("min(250px, 62vw)")}>
        <BoxArt phase={phase} />
      </button>
      <p className={`mt-10 font-hand text-2xl text-[#7a5446] transition-opacity duration-500 ${phase === "open" ? "opacity-0" : ""}`}>Нажми на коробку</p>
    </div>
  )
}

/* ---------- cake ---------- */

const CANDLES = 5

/** `out[i]` is null while the candle burns, otherwise the side it was blown towards (-1 or 1). */
type Candles = (number | null)[]

function CakeArt({ out }: { out: Candles }) {
  return (
    <div className="cake">
      <div className="cake-candles">
        {out.map((o, i) => (
          <span key={i} className="candle" data-candle={i} data-out={o !== null} style={{ "--dx": o ?? 0 } as CSSProperties}>
            <span className="flame" />
            <span className="smoke" />
            <span className="candle-stick" />
          </span>
        ))}
      </div>
      <div className="cake-tier cake-top" />
      <div className="cake-tier cake-bottom" />
      <div className="cake-plate" />
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
    <div className="flex flex-col items-center px-6 text-center">
      <p className={`mb-8 font-hand text-[28px] leading-tight text-[#7a5446] transition-opacity duration-500 ${done ? "opacity-0" : ""}`}>
        Загадай желание
        <br />и задуй свечи
      </p>
      <div ref={ref} className="touch-none select-none px-6 pt-4" style={size("min(280px, 70vw)")} {...swipe}>
        <CakeArt out={out} />
      </div>
      <div className="mt-10 min-h-[88px]">
        {done ? (
          <p className="gift-rise font-script text-4xl text-[#b4553a]">Ура! 🎉</p>
        ) : (
          <>
            <p className="relative mx-auto h-8 w-28 overflow-hidden" aria-hidden>
              <span className="swipe-hint absolute left-1/2 top-0 text-2xl">👆</span>
            </p>
            <p className="mt-1 text-[15px] font-semibold text-[#7a5446]">Проведи пальцем по свечам</p>
            <p className="mt-1 text-[13px] text-[#9b7a6c]">{left === CANDLES ? "или нажми на каждую" : `осталось: ${left}`}</p>
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
    <span className="flex h-full items-end justify-center pb-4">
      {kind === "envelope" ? (
        <span className="mb-3" style={size("120px")}>
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
