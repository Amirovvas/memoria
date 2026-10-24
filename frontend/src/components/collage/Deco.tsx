import { DECOS } from "@/src/lib/collage/styles"
import type { DecoKey } from "@/src/lib/collage/types"

const MONO = "var(--font-plex-mono), monospace"
const HAND = "var(--font-caveat), cursive"

export function DecoArt({
  deco,
  color,
  label,
  id,
  ratio,
}: {
  deco: DecoKey
  color: string
  label?: string
  id: string
  ratio?: number
}) {
  const h = (ratio ?? DECOS[deco].ratio) * 100
  const box = `0 0 100 ${h}`
  const common = { width: "100%", height: "100%", viewBox: box, preserveAspectRatio: "none" as const, "aria-hidden": true }

  switch (deco) {
    case "tape":
      return (
        <svg {...common}>
          <path
            d="M2 2 L6 0 L10 3 L14 0 L18 2 L82 2 L86 0 L90 3 L94 0 L98 2 L98 28 L94 30 L90 27 L86 30 L82 28 L18 28 L14 30 L10 27 L6 30 L2 28 Z"
            fill={color}
            opacity="0.72"
          />
          <path d="M12 9 H88 M12 15 H88 M12 21 H88" stroke="#fff" strokeOpacity="0.22" strokeWidth="2" />
        </svg>
      )
    case "ticket":
      return (
        <svg {...common} style={{ filter: "drop-shadow(0 1.2px 1.4px rgb(0 0 0 / 0.18))" }}>
          <path
            d="M3 1 H97 a2 2 0 0 1 2 2 V15 a6 6 0 0 0 0 12 V39 a2 2 0 0 1 -2 2 H3 a2 2 0 0 1 -2 -2 V27 a6 6 0 0 0 0 -12 V3 a2 2 0 0 1 2 -2 Z"
            fill="#fbf6ec"
          />
          <rect x="1" y="1" width="98" height="8" fill={color} />
          <text x="5" y="7" fontSize="5" fill="#fff" style={{ fontFamily: MONO }} letterSpacing="0.8">
            BOARDING PASS
          </text>
          <text x="95" y="7" fontSize="4.4" fill="#fff" style={{ fontFamily: MONO }} textAnchor="end">
            ✈ 1ST
          </text>
          <text x="5" y="20" fontSize="8.2" fill="#2a241d" style={{ fontFamily: MONO }} fontWeight="600">
            {label || "ROMA → NAPOLI"}
          </text>
          <text x="5" y="28" fontSize="3.8" fill="#7a6e60" style={{ fontFamily: MONO }} letterSpacing="0.4">
            SEAT 12A · GATE 4 · 07:45
          </text>
          <line x1="72" y1="12" x2="72" y2="39" stroke="#c9bba5" strokeDasharray="1.6 1.6" strokeWidth="0.6" />
          {Array.from({ length: 18 }, (_, i) => (
            <rect key={i} x={75 + i * 1.2} y="14" width={i % 3 === 0 ? 0.9 : 0.45} height="18" fill="#2a241d" />
          ))}
          <text x="5" y="36" fontSize="3.4" fill="#a1968a" style={{ fontFamily: MONO }}>
            No 0427 · ECONOMY
          </text>
        </svg>
      )
    case "stamp": {
      const holes = []
      for (let i = 0; i <= 10; i++) {
        holes.push(<circle key={`t${i}`} cx={i * 10} cy="0" r="3" fill="#000" />)
        holes.push(<circle key={`b${i}`} cx={i * 10} cy={h} r="3" fill="#000" />)
      }
      for (let i = 0; i <= 12; i++) {
        holes.push(<circle key={`l${i}`} cx="0" cy={i * 10.17} r="3" fill="#000" />)
        holes.push(<circle key={`r${i}`} cx="100" cy={i * 10.17} r="3" fill="#000" />)
      }
      return (
        <svg {...common} style={{ filter: "drop-shadow(0 1px 1.2px rgb(0 0 0 / 0.2))" }}>
          <defs>
            <mask id={`stamp-${id}`}>
              <rect width="100" height={h} fill="#fff" />
              {holes}
            </mask>
          </defs>
          <g mask={`url(#stamp-${id})`}>
            <rect width="100" height={h} fill="#fbf6ec" />
            <rect x="10" y="10" width="80" height={h - 20} fill={color} />
            <circle cx="62" cy="44" r="13" fill="#f6d79a" />
            <path d={`M10 ${h - 40} Q30 ${h - 54} 50 ${h - 40} T90 ${h - 40} V${h - 10} H10 Z`} fill="#fff" opacity="0.28" />
            <path d={`M10 ${h - 30} Q30 ${h - 42} 50 ${h - 30} T90 ${h - 30} V${h - 10} H10 Z`} fill="#fff" opacity="0.35" />
            <text x="16" y="27" fontSize="12" fill="#fff" style={{ fontFamily: MONO }} fontWeight="600">
              0,80
            </text>
            <text x="50" y={h - 15} fontSize="7" fill="#fff" style={{ fontFamily: MONO }} textAnchor="middle" letterSpacing="1.2">
              POSTA
            </text>
          </g>
        </svg>
      )
    }
    case "postmark":
      return (
        <svg {...common} style={{ opacity: 0.55 }}>
          <circle cx="25" cy="25" r="22" fill="none" stroke={color} strokeWidth="1.6" />
          <circle cx="25" cy="25" r="16" fill="none" stroke={color} strokeWidth="0.9" />
          <text x="25" y="23" fontSize="5.6" fill={color} style={{ fontFamily: MONO }} textAnchor="middle">
            POSTE
          </text>
          <text x="25" y="31" fontSize="4.6" fill={color} style={{ fontFamily: MONO }} textAnchor="middle">
            07.25
          </text>
          {[14, 20, 26, 32, 38].map((y) => (
            <path key={y} d={`M50 ${y} q6 -4 12 0 t12 0 t12 0 t12 0`} fill="none" stroke={color} strokeWidth="1.4" />
          ))}
        </svg>
      )
    case "map":
      return (
        <svg {...common} style={{ filter: "drop-shadow(0 1.4px 1.6px rgb(0 0 0 / 0.16))" }}>
          <path d="M0 4 L33 0 L66 4 L100 0 V68 L66 72 L33 68 L0 72 Z" fill="#f3ead8" />
          <path d="M33 0 V68 M66 4 V72" stroke="#e1d3ba" strokeWidth="0.6" />
          <path
            d="M0 30 C12 26 18 36 30 32 C44 27 46 44 58 40 C70 36 74 48 86 44 C92 42 96 46 100 44 V72 L66 72 L33 68 L0 72 Z"
            fill="#cfe0dc"
            opacity="0.9"
          />
          <path
            d="M14 18 C28 22 36 30 46 36 S70 50 84 54"
            fill="none"
            stroke={color}
            strokeWidth="1.3"
            strokeDasharray="2.4 2"
          />
          <circle cx="14" cy="18" r="2.4" fill={color} />
          <path d="M84 49 c-3.6 0 -5 2.8 -5 4.6 c0 3.6 5 8.4 5 8.4 s5 -4.8 5 -8.4 c0 -1.8 -1.4 -4.6 -5 -4.6z" fill={color} />
          <circle cx="84" cy="53.6" r="1.6" fill="#f3ead8" />
          <text x="18" y="15" fontSize="4.6" fill="#5a4e40" style={{ fontFamily: HAND }}>
            Roma
          </text>
          <text x="66" y="62" fontSize="4.6" fill="#5a4e40" style={{ fontFamily: HAND }}>
            Amalfi
          </text>
          <g transform="translate(88 12)" stroke="#8a7c68" strokeWidth="0.6" fill="none">
            <circle r="5" />
            <path d="M0 -6 L1.4 0 L0 6 L-1.4 0 Z" fill="#8a7c68" />
          </g>
        </svg>
      )
    case "plane":
      return (
        <svg {...common}>
          <path d="M4 52 C30 50 40 30 64 22" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="3 3" />
          <path d="M66 14 L96 6 L74 32 L70 24 Z" fill={color} />
          <path d="M70 24 L66 34 L74 32" fill={color} opacity="0.7" />
        </svg>
      )
    case "heart":
      return (
        <svg {...common}>
          <path d="M50 88 C20 66 4 50 4 30 C4 14 16 4 30 4 C40 4 46 10 50 18 C54 10 60 4 70 4 C84 4 96 14 96 30 C96 50 80 66 50 88 Z" fill={color} />
        </svg>
      )
    case "star":
      return (
        <svg {...common}>
          <path d="M50 4 L62 36 L96 38 L69 59 L79 94 L50 74 L21 94 L31 59 L4 38 L38 36 Z" fill={color} />
        </svg>
      )
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z" fill={color} />
        </svg>
      )
    case "confetti": {
      const pts = [
        [6, 8, 0], [18, 22, 1], [30, 6, 2], [44, 16, 0], [58, 4, 1], [72, 18, 2], [86, 8, 0], [94, 26, 1],
        [10, 40, 2], [24, 52, 0], [90, 46, 2], [78, 56, 0], [4, 56, 1], [96, 54, 0], [64, 30, 2], [38, 34, 1],
      ]
      return (
        <svg {...common}>
          {pts.map(([x, y, k], i) =>
            k === 0 ? (
              <circle key={i} cx={x} cy={y} r="1.3" fill={color} />
            ) : k === 1 ? (
              <rect key={i} x={x} y={y} width="3.2" height="1.3" fill={color} transform={`rotate(${i * 37} ${x} ${y})`} />
            ) : (
              <path key={i} d={`M${x} ${y} q1.5 -2 3 0 t3 0`} stroke={color} strokeWidth="0.9" fill="none" />
            ),
          )}
        </svg>
      )
    }
    case "balloon":
      return (
        <svg {...common}>
          <ellipse cx="50" cy="40" rx="34" ry="38" fill={color} />
          <ellipse cx="38" cy="26" rx="8" ry="12" fill="#fff" opacity="0.3" />
          <path d="M46 78 L54 78 L50 84 Z" fill={color} />
          <path d="M50 84 C40 110 62 130 48 160 C42 172 52 182 50 190" fill="none" stroke={color} strokeWidth="1.4" />
        </svg>
      )
    case "flower":
      return (
        <svg {...common}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="50" cy="26" rx="15" ry="24" fill={color} opacity="0.88" transform={`rotate(${r} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="11" fill="#f2c46d" />
        </svg>
      )
    case "leaf":
      return (
        <svg {...common}>
          <path d="M50 160 C50 110 52 60 56 6" stroke={color} strokeWidth="2" fill="none" />
          {[30, 56, 82, 108, 134].map((y, i) => (
            <path
              key={y}
              d={i % 2 ? `M52 ${y} C70 ${y - 18} 88 ${y - 14} 94 ${y - 26} C80 ${y - 30} 62 ${y - 22} 52 ${y}` : `M52 ${y} C34 ${y - 18} 16 ${y - 14} 8 ${y - 26} C22 ${y - 30} 42 ${y - 22} 52 ${y}`}
              fill={color}
              opacity="0.85"
            />
          ))}
        </svg>
      )
    case "sun":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="22" fill={color} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="48" y="4" width="4" height="14" rx="2" fill={color} transform={`rotate(${i * 30} 50 50)`} />
          ))}
        </svg>
      )
    case "arrow":
      return (
        <svg {...common}>
          <path d="M6 44 C24 8 64 4 88 26" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M76 14 L90 28 L72 32" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "scribble":
      return (
        <svg {...common}>
          <path
            d="M70 6 C40 0 6 12 6 32 C6 54 50 62 78 52 C98 44 98 18 70 10 C54 6 30 10 22 18"
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      )
    case "note":
      return (
        <svg {...common} style={{ filter: "drop-shadow(0 1.6px 2px rgb(0 0 0 / 0.16))" }}>
          <path d="M2 3 L98 1 L97 46 L60 49 L3 48 Z" fill={color} />
          <path d="M60 49 L97 46 L90 40 Z" fill="#000" opacity="0.06" />
          {label ? (
            <text x="50" y="28" fontSize="9" fill="#2a241d" style={{ fontFamily: HAND }} textAnchor="middle">
              {label}
            </text>
          ) : null}
        </svg>
      )
    case "pin":
      return (
        <svg {...common} style={{ overflow: "visible", filter: "drop-shadow(0 3px 2px rgb(0 0 0 / 0.25))" }}>
          <circle cx="50" cy="50" r="42" fill={color} />
          <circle cx="36" cy="36" r="13" fill="#fff" opacity="0.4" />
        </svg>
      )
    case "clip":
      return (
        <svg {...common}>
          <path
            d="M30 200 V40 a20 20 0 0 1 40 0 V190 a12 12 0 0 1 -24 0 V60"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      )
    case "line":
      return (
        <svg {...common}>
          <rect width="100" height={h} fill={color} />
        </svg>
      )
    case "card":
      return (
        <svg {...common} style={{ filter: "drop-shadow(0 0.6px 1.2px rgb(0 0 0 / 0.16))", overflow: "visible" }}>
          <rect x="0" y="0" width="100" height={h} fill={color} />
        </svg>
      )
    case "torn": {
      // a strip of paper torn along both long edges; the jags follow the element id, so they stay put between renders
      const seed = [...id].reduce((s, c) => (s * 31 + c.charCodeAt(0)) | 0, 0)
      const jag = (k: number) => {
        const x = Math.imul(seed ^ (k * 2654435761), 1103515245)
        return (((x ^ (x >>> 15)) >>> 0) % 1000) / 1000
      }
      const n = 48
      // tall bands keep a fine tear instead of deep teeth
      const amp = Math.min(h * 0.34, 2.4)
      const top = Array.from({ length: n + 1 }, (_, i) => `${(i / n) * 100} ${(jag(i) * amp).toFixed(2)}`)
      const bottom = Array.from({ length: n + 1 }, (_, i) => `${100 - (i / n) * 100} ${(h - jag(i + 97) * amp).toFixed(2)}`)
      return (
        <svg {...common} style={{ overflow: "visible", filter: "drop-shadow(0 0.25cqw 0.35cqw rgb(0 0 0 / 0.18))" }}>
          <path d={`M${top.join(" L")} L${bottom.join(" L")} Z`} fill={color} />
        </svg>
      )
    }
    case "bow":
      // a satin bow with long tails, painted in layers like watercolour
      return (
        <svg {...common} style={{ overflow: "visible", filter: "drop-shadow(0 0.3cqw 0.4cqw rgb(0 0 0 / 0.16))" }}>
          <g fill={color} stroke={color} strokeWidth="1.4" strokeLinejoin="round">
            <path d="M47 46 C42 86 30 126 14 176 L27 169 L33 179 C46 132 54 92 53 48 Z" opacity="0.82" />
            <path d="M53 46 C60 88 74 128 88 174 L75 168 L68 178 C56 132 48 92 47 48 Z" opacity="0.72" />
            <path d="M50 40 C34 6 4 4 3 28 C2 50 30 54 50 46 Z" opacity="0.86" />
            <path d="M50 40 C66 6 96 4 97 28 C98 50 70 54 50 46 Z" opacity="0.78" />
          </g>
          <g fill="#fff" opacity="0.32">
            <path d="M46 40 C34 18 14 14 12 28 C20 22 34 26 46 40 Z" />
            <path d="M54 40 C66 18 86 14 88 28 C80 22 66 26 54 40 Z" />
            <path d="M48 56 C46 90 38 120 26 158 C36 124 44 92 48 56 Z" />
          </g>
          <ellipse cx="50" cy="44" rx="7.5" ry="8.5" fill={color} />
          <ellipse cx="48" cy="41" rx="2.6" ry="3.4" fill="#fff" opacity="0.35" />
        </svg>
      )
    case "filmtext":
      return (
        <svg {...common}>
          <text x="0" y="2.3" fontSize="2.3" fill={color} style={{ fontFamily: MONO }} letterSpacing="0.12">
            {label}
          </text>
        </svg>
      )
    case "lines":
      return (
        <svg {...common}>
          {[6, 14, 22, 30].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke={color} strokeWidth="0.35" opacity="0.6" />
          ))}
        </svg>
      )
  }
}
