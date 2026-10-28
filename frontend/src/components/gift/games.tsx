"use client"

import { Eye, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { confetti } from "@/src/lib/confetti"
import { cx } from "@/src/lib/cx"
import type { Game, GiftCollage } from "@/src/lib/gifts"
import s from "./games.module.css"

/* ---------- feel: sound and touch ---------- */

/**
 * Tiny synthesized sounds, so the games need no audio files. The context starts on the first tap
 * (browsers allow sound only after one) and stays quiet under the gift's own music.
 */
const sfx = (() => {
  let ctx: AudioContext | null = null
  let noise: AudioBuffer | null = null
  const audio = () => {
    if (typeof window === "undefined") return null
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === "suspended") void ctx.resume()
    return ctx
  }
  const tone = (freq: number, at: number, dur: number, vol: number, type: OscillatorType = "sine") => {
    const c = audio()
    if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, c.currentTime + at)
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + at + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur)
    o.connect(g).connect(c.destination)
    o.start(c.currentTime + at)
    o.stop(c.currentTime + at + dur + 0.05)
  }
  return {
    /** a short burst of filtered noise, like a coin on foil */
    scratch(strength: number) {
      const c = audio()
      if (!c) return
      if (!noise) {
        noise = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate)
        const d = noise.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
      }
      const src = c.createBufferSource()
      src.buffer = noise
      const band = c.createBiquadFilter()
      band.type = "bandpass"
      band.frequency.value = 2400 + Math.random() * 1600
      band.Q.value = 0.9
      const g = c.createGain()
      g.gain.value = Math.min(0.05, 0.012 + strength * 0.03)
      src.connect(band).connect(g).connect(c.destination)
      src.start()
    },
    pop: () => tone(660 + Math.random() * 80, 0, 0.12, 0.08, "triangle"),
    place: () => {
      tone(880, 0, 0.1, 0.07, "triangle")
      tone(1320, 0.06, 0.16, 0.05, "sine")
    },
    soft: () => tone(320, 0, 0.09, 0.05, "sine"),
    lose: () => {
      tone(392, 0, 0.18, 0.06, "triangle")
      tone(311, 0.16, 0.3, 0.06, "triangle")
    },
    /** a bright arpeggio for a win */
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.5, 0.07, "triangle")),
  }
})()

const buzz = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern)
}

const calm = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** The card keeps the collage's proportions and fits a phone screen with room for the title. */
function useCardWidth(collage: GiftCollage) {
  const [w, setW] = useState(320)
  useLayoutEffect(() => {
    const fit = () => setW(Math.round(Math.min(380, window.innerWidth * 0.86, window.innerHeight * 0.56 * (collage.w / collage.h))))
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [collage.w, collage.h])
  return w
}

type GameProps = { collage: GiftCollage; width: number; onWin: () => void }

/* ---------- scratch card ---------- */

const CLEAR_AT = 0.55

function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gold = ctx.createLinearGradient(0, 0, w, h)
  gold.addColorStop(0, "#a8762a")
  gold.addColorStop(0.22, "#f3d27a")
  gold.addColorStop(0.42, "#c9962f")
  gold.addColorStop(0.62, "#fbe7a1")
  gold.addColorStop(0.82, "#b8842c")
  gold.addColorStop(1, "#e9c66a")
  ctx.fillStyle = gold
  ctx.fillRect(0, 0, w, h)
  // brushed metal: fine diagonal streaks and glitter
  ctx.globalAlpha = 0.07
  ctx.strokeStyle = "#fff"
  for (let x = -h; x < w; x += 6) {
    ctx.lineWidth = Math.random() * 1.5
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + h, h)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  for (let i = 0; i < (w * h) / 900; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,250,225,0.55)" : "rgba(120,80,20,0.25)"
    const r = Math.random() * 1.4
    ctx.beginPath()
    ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // a ticket edge and the call to action
  const m = w * 0.05
  ctx.setLineDash([w * 0.018, w * 0.014])
  ctx.lineWidth = Math.max(1.5, w * 0.005)
  ctx.strokeStyle = "rgba(110,72,18,0.45)"
  ctx.strokeRect(m, m, w - m * 2, h - m * 2)
  ctx.setLineDash([])
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "rgba(95,60,12,0.72)"
  ctx.font = `800 ${Math.round(w * 0.07)}px system-ui, sans-serif`
  ctx.fillText("СОТРИ МЕНЯ", w / 2, h / 2 - w * 0.03)
  ctx.font = `600 ${Math.round(w * 0.04)}px system-ui, sans-serif`
  ctx.fillStyle = "rgba(95,60,12,0.55)"
  ctx.fillText("✦ под золотом твой сюрприз ✦", w / 2, h / 2 + w * 0.06)
}

function Scratch({ collage, width, onWin }: GameProps) {
  const height = Math.round(width * (collage.h / collage.w))
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const moves = useRef(0)
  const measured = useRef(0)
  const won = useRef(false)
  const [touched, setTouched] = useState(false)
  const [progress, setProgress] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useLayoutEffect(() => {
    const c = canvas.current
    if (!c) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = width * dpr
    c.height = height * dpr
    const ctx = c.getContext("2d")!
    ctx.scale(dpr, dpr)
    paintFoil(ctx, width, height)
  }, [width, height])

  const flake = (x: number, y: number) => {
    const host = box.current
    if (!host || calm()) return
    const el = document.createElement("span")
    el.className = s.flake
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.setProperty("--dx", `${(Math.random() - 0.5) * 70}px`)
    el.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`)
    el.style.width = el.style.height = `${3 + Math.random() * 5}px`
    el.addEventListener("animationend", () => el.remove(), { once: true })
    host.appendChild(el)
  }

  const measure = () => {
    const c = canvas.current
    if (!c) return
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data
    let clear = 0
    let all = 0
    // every 24th pixel is plenty to tell how much foil is gone
    for (let i = 3; i < data.length; i += 4 * 24) {
      all++
      if (data[i] < 40) clear++
    }
    const p = clear / all
    setProgress(p)
    if (p >= CLEAR_AT && !won.current) {
      won.current = true
      setRevealed(true)
      sfx.win()
      buzz([30, 50, 30, 50, 60])
      onWin()
    }
  }

  const scratchTo = (x: number, y: number) => {
    const ctx = canvas.current?.getContext("2d")
    if (!ctx) return
    const from = last.current ?? { x, y }
    ctx.globalCompositeOperation = "destination-out"
    // destination-out removes as much foil as the stroke is opaque: it must be fully opaque
    ctx.strokeStyle = "#000"
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = width * 0.14
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.globalCompositeOperation = "source-over"
    const dist = Math.hypot(x - from.x, y - from.y)
    last.current = { x, y }
    if (dist > 2) {
      flake(x, y)
      if (Math.random() < 0.5) flake(x + (Math.random() - 0.5) * 20, y)
      if (++moves.current % 3 === 0) sfx.scratch(Math.min(1, dist / 30))
      if (moves.current % 9 === 0) buzz(4)
    }
    const now = performance.now()
    if (now - measured.current > 160) {
      measured.current = now
      measure()
    }
  }

  const point = (e: ReactPointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  return (
    <div className={s.card} style={{ width, height }} ref={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={collage.url} alt="" className={cx(s.photo, revealed && s.photoShine)} draggable={false} />
      <canvas
        ref={canvas}
        className={cx(s.foil, revealed && s.foilGone)}
        style={{ width, height }}
        onPointerDown={(e) => {
          if (revealed) return
          e.currentTarget.setPointerCapture(e.pointerId)
          setTouched(true)
          last.current = null
          const p = point(e)
          scratchTo(p.x, p.y)
        }}
        onPointerMove={(e) => {
          if (revealed || !e.currentTarget.hasPointerCapture(e.pointerId)) return
          const p = point(e)
          scratchTo(p.x, p.y)
        }}
        onPointerUp={() => {
          last.current = null
          measure()
        }}
      />
      {!touched ? <span className={s.hand} aria-hidden /> : null}
      {!revealed ? (
        <span className={s.meter} aria-hidden>
          <span className={s.meterFill} style={{ width: `${Math.min(100, (progress / CLEAR_AT) * 100)}%` }} />
        </span>
      ) : null}
    </div>
  )
}

/* ---------- puzzle ---------- */

const N = 3

function shuffled() {
  const ids = Array.from({ length: N * N }, (_, i) => i)
  // a fair shuffle, retried until at most one piece happens to sit in its own place
  for (;;) {
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    if (ids.filter((p, i) => p === i).length <= 1) return [...ids]
  }
}

function Puzzle({ collage, width, onWin }: GameProps) {
  const height = Math.round(width * (collage.h / collage.w))
  const board = useRef<HTMLDivElement>(null)
  /** order[slot] is the piece that sits in that slot */
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: N * N }, (_, i) => i))
  const [phase, setPhase] = useState<"peek" | "play" | "done">("peek")
  const [picked, setPicked] = useState<number | null>(null)
  const [drag, setDrag] = useState<{ piece: number; dx: number; dy: number } | null>(null)
  const [moves, setMoves] = useState(0)
  const [ghost, setGhost] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const start = useRef<{ x: number; y: number; piece: number } | null>(null)

  // the whole picture first, so there is something to remember; then it bursts apart
  useEffect(() => {
    const t = setTimeout(() => {
      setOrder(shuffled())
      setPhase("play")
      sfx.pop()
    }, 1600)
    return () => clearTimeout(t)
  }, [])

  const swap = (a: number, b: number) => {
    if (a === b || phase !== "play") return
    const next = [...order]
    ;[next[a], next[b]] = [next[b], next[a]]
    const landed = [a, b].filter((slot) => next[slot] === slot && order[slot] !== slot)
    setOrder(next)
    setMoves((m) => m + 1)
    if (next.every((p, i) => p === i)) {
      setPhase("done")
      sfx.win()
      buzz([30, 50, 30, 50, 60])
      onWin()
    } else if (landed.length) {
      setFlash(next[landed[0]])
      setTimeout(() => setFlash(null), 650)
      sfx.place()
      buzz(15)
    } else {
      sfx.soft()
    }
  }

  const slotAt = (x: number, y: number) => {
    const r = board.current!.getBoundingClientRect()
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null
    const col = Math.min(N - 1, Math.floor(((x - r.left) / r.width) * N))
    const row = Math.min(N - 1, Math.floor(((y - r.top) / r.height) * N))
    return row * N + col
  }

  const down = (e: ReactPointerEvent, piece: number) => {
    if (phase !== "play") return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY, piece }
  }
  const move = (e: ReactPointerEvent) => {
    const st = start.current
    if (!st) return
    const dx = e.clientX - st.x
    const dy = e.clientY - st.y
    if (!drag && Math.hypot(dx, dy) < 6) return
    setDrag({ piece: st.piece, dx, dy })
  }
  const up = (e: ReactPointerEvent) => {
    const st = start.current
    start.current = null
    if (!st) return
    const from = order.indexOf(st.piece)
    if (drag) {
      setDrag(null)
      const to = slotAt(e.clientX, e.clientY)
      if (to !== null) swap(from, to)
      setPicked(null)
      return
    }
    // a tap picks a piece; a tap on another one swaps the two
    if (picked === null) {
      setPicked(st.piece)
      sfx.soft()
    } else {
      if (picked !== st.piece) swap(order.indexOf(picked), from)
      setPicked(null)
    }
  }

  const placed = order.filter((p, i) => p === i).length

  return (
    <div className={s.puzzleWrap}>
      <div ref={board} className={cx(s.card, s.board, phase === "done" && s.boardDone)} style={{ width, height }}>
        {Array.from({ length: N * N }, (_, piece) => {
          const slot = order.indexOf(piece)
          const pc = piece % N
          const pr = Math.floor(piece / N)
          const dragging = drag?.piece === piece
          const style: CSSProperties = {
            left: `${((slot % N) * 100) / N}%`,
            top: `${(Math.floor(slot / N) * 100) / N}%`,
            width: `${100 / N}%`,
            height: `${100 / N}%`,
            transform: dragging ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.08)` : undefined,
            zIndex: dragging ? 5 : picked === piece ? 4 : 1,
            transitionDuration: dragging ? "0s" : undefined,
            // pieces fly out from the middle in a short wave when the picture bursts apart
            transitionDelay: phase === "play" && moves === 0 ? `${(piece % 5) * 40}ms` : undefined,
          }
          return (
            <div
              key={piece}
              className={cx(s.tile, picked === piece && s.tilePicked, dragging && s.tileDragging, flash === piece && s.tileFlash, order[slot] === slot && phase === "play" && s.tileHome)}
              style={style}
              onPointerDown={(e) => down(e, piece)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={() => {
                start.current = null
                setDrag(null)
              }}
            >
              <span
                className={s.tileFace}
                style={{
                  backgroundImage: `url("${collage.url}")`,
                  backgroundSize: `${N * 100}% ${N * 100}%`,
                  backgroundPosition: `${(pc * 100) / (N - 1)}% ${(pr * 100) / (N - 1)}%`,
                }}
              />
            </div>
          )
        })}
        {ghost ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={collage.url} alt="" className={s.ghost} draggable={false} />
        ) : null}
        {phase === "done" ? (
          <>
            {/* the whole picture settles over the pieces, so no seam is left between them */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={collage.url} alt="" className={s.whole} draggable={false} />
            <span className={s.sweep} aria-hidden />
          </>
        ) : null}
      </div>
      <div className={s.puzzleBar}>
        <span className={s.stat}>
          На месте: <b>{placed}</b> из {N * N}
        </span>
        <span className={s.stat}>
          Ходов: <b>{moves}</b>
        </span>
        <button
          className={s.hint}
          disabled={phase !== "play" || ghost}
          onClick={() => {
            setGhost(true)
            setTimeout(() => setGhost(false), 1300)
          }}
        >
          <Eye size={15} /> Подсмотреть
        </button>
      </div>
    </div>
  )
}

/* ---------- tic-tac-toe ---------- */

type Mark = "x" | "o" | null
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function winner(b: Mark[]) {
  for (const line of LINES) {
    const [a, c, d] = line
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line }
  }
  return null
}

/** Plays well enough to be a real opponent, but leaves room to win: it misses some wins and blocks. */
function aiMove(b: Mark[]) {
  const free = b.map((m, i) => (m ? -1 : i)).filter((i) => i >= 0)
  const finishing = (mark: Mark) =>
    free.find((i) => {
      const t = [...b]
      t[i] = mark
      return winner(t)?.mark === mark
    })
  const win = finishing("o")
  if (win !== undefined && Math.random() < 0.7) return win
  const block = finishing("x")
  if (block !== undefined && Math.random() < 0.55) return block
  if (b[4] === null && Math.random() < 0.6) return 4
  const corners = free.filter((i) => [0, 2, 6, 8].includes(i))
  const pool = corners.length && Math.random() < 0.6 ? corners : free
  return pool[Math.floor(Math.random() * pool.length)]
}

/** A moment of "thinking", a little different each turn, so the opponent feels alive. */
const thinkTime = () => 520 + Math.random() * 380

const CELL = 100
const center = (i: number) => ({ x: (i % 3) * CELL + CELL / 2, y: Math.floor(i / 3) * CELL + CELL / 2 })

function TicTacToe({ collage, width, onWin }: GameProps) {
  const height = Math.round(width * (collage.h / collage.w))
  const side = Math.min(width * 0.86, height * 0.8)
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null))
  const [thinking, setThinking] = useState(false)
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null)
  const [line, setLine] = useState<number[] | null>(null)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState({ you: 0, it: 0 })

  const settle = (b: Mark[]) => {
    const w = winner(b)
    if (w) {
      setLine(w.line)
      if (w.mark === "x") {
        setResult("win")
        setScore((sc) => ({ ...sc, you: sc.you + 1 }))
        sfx.win()
        buzz([30, 50, 30, 50, 60])
        setTimeout(onWin, 700)
      } else {
        setResult("lose")
        setScore((sc) => ({ ...sc, it: sc.it + 1 }))
        sfx.lose()
        buzz([80, 60, 80])
      }
      return true
    }
    if (b.every(Boolean)) {
      setResult("draw")
      sfx.lose()
      return true
    }
    return false
  }

  const play = (i: number) => {
    if (board[i] || thinking || result) return
    const b = [...board]
    b[i] = "x"
    setBoard(b)
    sfx.pop()
    buzz(10)
    if (settle(b)) return
    setThinking(true)
    setTimeout(() => {
      const nb = [...b]
      nb[aiMove(b)] = "o"
      setBoard(nb)
      setThinking(false)
      sfx.soft()
      settle(nb)
    }, thinkTime())
  }

  const again = () => {
    setBoard(Array(9).fill(null))
    setResult(null)
    setLine(null)
    setRound((r) => r + 1)
  }

  const status =
    result === "win"
      ? "Победа! Сюрприз твой"
      : result === "lose"
        ? "Сюрприз оказался хитрее"
        : result === "draw"
          ? "Ничья! Ещё разок?"
          : thinking
            ? "Сюрприз думает…"
            : "Твой ход — ставь сердечко"

  const a = line ? center(line[0]) : null
  const z = line ? center(line[2]) : null

  return (
    <div className={s.tttWrap}>
      <p className={cx(s.status, result === "win" && s.statusWin)} aria-live="polite">
        {status}
        {thinking ? <span className={s.dots} aria-hidden /> : null}
      </p>
      <div className={cx(s.card, s.tttCard, result === "win" && s.tttWon)} style={{ width, height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collage.url} alt="" className={s.tttPhoto} draggable={false} />
        <div className={s.tttGlass} />
        <div className={cx(s.tttBoard, result === "lose" && s.shake)} style={{ width: side, height: side }}>
          <svg viewBox="0 0 300 300" className={s.grid} aria-hidden>
            {[100, 200].map((p) => (
              <g key={p}>
                <path d={`M${p} 12 Q ${p + 4} 150 ${p} 288`} />
                <path d={`M12 ${p} Q 150 ${p - 4} 288 ${p}`} />
              </g>
            ))}
          </svg>
          {board.map((m, i) => (
            <button
              key={`${round}-${i}`}
              className={s.cell}
              style={{ left: `${(i % 3) * 33.333}%`, top: `${Math.floor(i / 3) * 33.333}%` }}
              onClick={() => play(i)}
              disabled={!!m || thinking || !!result}
              aria-label={m ? (m === "x" ? "Твой ход" : "Ход сюрприза") : `Клетка ${i + 1}`}
            >
              {m === "x" ? (
                <svg viewBox="0 0 100 100" className={s.markX}>
                  <path d="M50 82 C 18 60, 14 36, 30 26 C 40 20, 48 26, 50 34 C 52 26, 60 20, 70 26 C 86 36, 82 60, 50 82 Z" />
                </svg>
              ) : m === "o" ? (
                <svg viewBox="0 0 100 100" className={s.markO}>
                  <circle cx="50" cy="50" r="26" />
                </svg>
              ) : null}
            </button>
          ))}
          {a && z ? (
            <svg viewBox="0 0 300 300" className={cx(s.strike, result === "win" ? s.strikeWin : s.strikeLose)} aria-hidden>
              <line x1={a.x - (z.x - a.x) * 0.18} y1={a.y - (z.y - a.y) * 0.18} x2={z.x + (z.x - a.x) * 0.18} y2={z.y + (z.y - a.y) * 0.18} />
            </svg>
          ) : null}
        </div>
      </div>
      <div className={s.tttBar}>
        <span className={s.stat}>
          Ты <b>{score.you}</b> : <b>{score.it}</b> Сюрприз
        </span>
        {result && result !== "win" ? (
          <button className={s.again} onClick={again}>
            <RotateCcw size={15} /> Сыграть ещё
          </button>
        ) : null}
      </div>
      {result && result !== "win" ? (
        <button className={s.giveUp} onClick={onWin}>
          Сдаюсь — открыть сюрприз
        </button>
      ) : null}
    </div>
  )
}

/* ---------- stage ---------- */

const TITLES: Record<Exclude<Game, "none">, { title: string; text: string }> = {
  scratch: { title: "Сотри золото", text: "Води пальцем по карточке — под ней спрятан сюрприз" },
  puzzle: { title: "Собери картинку", text: "Перетаскивай кусочки или нажимай на два, чтобы поменять их местами" },
  tictactoe: { title: "Обыграй сюрприз", text: "Собери три сердечка в ряд — и подарок откроется" },
}

/** A mini game between the opening and the surprise; a win sets off the light show, then the gift opens. */
export function GameStage({ game, collage, onDone }: { game: Exclude<Game, "none">; collage: GiftCollage; onDone: () => void }) {
  const width = useCardWidth(collage)
  const [won, setWon] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    const t = setTimeout(() => setCanSkip(true), 20000)
    return () => clearTimeout(t)
  }, [])

  const fired = useRef(false)
  const win = useCallback(() => {
    if (fired.current) return
    fired.current = true
    setWon(true)
    const r = cardRef.current?.getBoundingClientRect()
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2
    const y = r ? r.top + r.height / 2 : window.innerHeight / 2
    confetti(x, y, { count: 140, power: 1.1 })
    setTimeout(() => confetti(window.innerWidth * 0.1, window.innerHeight * 0.9, { count: 70, power: 1.2 }), 250)
    setTimeout(() => confetti(window.innerWidth * 0.9, window.innerHeight * 0.9, { count: 70, power: 1.2 }), 450)
    setTimeout(() => done.current(), 2600)
  }, [])

  const t = TITLES[game]
  const Body = game === "scratch" ? Scratch : game === "puzzle" ? Puzzle : TicTacToe

  return (
    <section className={s.stage}>
      <p className={s.eyebrow}>✦ мини-игра ✦</p>
      <h2 className={s.title}>{won ? "Получилось!" : t.title}</h2>
      <p className={cx(s.lead, won && s.leadHidden)}>{t.text}</p>
      <div ref={cardRef} className={s.arena}>
        <span className={cx(s.rays, won && s.raysOn)} aria-hidden />
        <Body collage={collage} width={width} onWin={win} />
      </div>
      <button className={cx(s.skip, canSkip && !won && s.skipShown)} onClick={() => done.current()} tabIndex={canSkip && !won ? 0 : -1}>
        Пропустить игру →
      </button>
    </section>
  )
}
