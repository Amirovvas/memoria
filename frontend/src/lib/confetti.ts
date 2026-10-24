const COLORS = ["#f7b8c2", "#e46f5c", "#f2c062", "#9fc9a8", "#8fb4e8", "#fff3d6", "#c98bd6"]

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rot: number
  spin: number
  round: boolean
  tilt: number
}

/**
 * A one-off burst of paper confetti from a point on the screen. Draws on a temporary canvas
 * above everything and removes it when the last piece has fallen out of view.
 */
export function confetti(x: number, y: number, { count = 160, power = 1 } = {}) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const canvas = document.createElement("canvas")
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "90" })
  document.body.appendChild(canvas)
  const ctx = canvas.getContext("2d")!
  ctx.scale(dpr, dpr)

  const speed = Math.min(w, 700) / 42
  const pieces: Piece[] = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1
    const v = speed * power * (0.45 + Math.random() * 0.75)
    return {
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      size: 6 + Math.random() * 7,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.4,
      round: Math.random() < 0.25,
      tilt: Math.random() * Math.PI,
    }
  })

  const started = performance.now()
  const frame = (now: number) => {
    ctx.clearRect(0, 0, w, h)
    let alive = 0
    for (const p of pieces) {
      p.vx *= 0.985
      p.vy = p.vy * 0.985 + 0.32
      p.x += p.vx + Math.sin(p.tilt) * 0.6
      p.y += p.vy
      p.rot += p.spin
      p.tilt += 0.08
      if (p.y > h + 20) continue
      alive++
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.cos(p.tilt))
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      }
      ctx.restore()
    }
    if (alive && now - started < 6000) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}

/** Confetti from the middle of an element, e.g. the box that was just opened. */
export function confettiFrom(el: Element | null, opts?: { count?: number; power?: number }) {
  const r = el?.getBoundingClientRect()
  confetti(r ? r.left + r.width / 2 : window.innerWidth / 2, r ? r.top + r.height / 2 : window.innerHeight / 2, opts)
}
