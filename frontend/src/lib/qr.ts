import { downloadBlob } from "./export/export"

// the encoder loads with the first code drawn, not with every page that can show one
const encoder = () => import("qrcode").then((m) => m.default)

const INK = "#1f1b16"
const INK_WARM = "#5e2a1e"
const ACCENT = "#b4553a"
const PAPER = "#fffdf9"
/** quiet border around the code, in modules */
const MARGIN = 3

/**
 * The code drawn by hand from its module grid: round dots in a dark warm gradient, soft rounded
 * finder "eyes" and a heart in the middle. "H" error correction leaves room for the heart; the dark
 * marks on light paper keep it readable by any phone camera.
 */
export async function qrSvg(text: string) {
  const qr = (await encoder()).create(text, { errorCorrectionLevel: "H" })
  const n = qr.modules.size
  const dark = (r: number, c: number) => qr.modules.get(r, c) === 1
  const size = n + MARGIN * 2

  // the three finder patterns are drawn as shapes of their own
  const eyes = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]
  const inEye = (r: number, c: number) => eyes.some(([er, ec]) => r >= er && r < er + 7 && c >= ec && c < ec + 7)
  // an odd square in the middle, about a fifth of the code, is kept clear for the heart
  let logo = Math.round(n * 0.22)
  if (logo % 2 === 0) logo++
  const lo = (n - logo) / 2
  const inLogo = (r: number, c: number) => r >= lo - 0.5 && r < lo + logo - 0.5 && c >= lo - 0.5 && c < lo + logo - 0.5

  const f = (v: number) => +v.toFixed(2)
  let dots = ""
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r, c) || inEye(r, c) || inLogo(r, c)) continue
      dots += `<circle cx="${f(c + MARGIN + 0.5)}" cy="${f(r + MARGIN + 0.5)}" r="0.43"/>`
    }
  }

  const eye = ([r, c]: number[]) => {
    const x = c + MARGIN
    const y = r + MARGIN
    return (
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="2.1" fill="none" stroke="${ACCENT}" stroke-width="1"/>` +
      `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="1.1" fill="${INK}"/>`
    )
  }

  // the heart sits on a paper-coloured rounded plate in the centre
  const cx = size / 2
  const plate = logo - 0.4
  const h = plate * 0.62
  const heart = `<g transform="translate(${f(cx - h / 2)} ${f(cx - h * 0.46)}) scale(${f(h / 100)})">
    <path d="M50 88 C 22 68, 4 50, 4 28 C 4 13, 15 4, 28 4 C 38 4, 46 10, 50 19 C 54 10, 62 4, 72 4 C 85 4, 96 13, 96 28 C 96 50, 78 68, 50 88 Z" fill="url(#qr-heart)"/>
    <path d="M24 18 C 18 21, 15 27, 16 33" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="5" stroke-linecap="round"/>
  </g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="qr-ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INK}"/>
      <stop offset="1" stop-color="${INK_WARM}"/>
    </linearGradient>
    <linearGradient id="qr-heart" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff8a9a"/>
      <stop offset="0.55" stop-color="#e2475f"/>
      <stop offset="1" stop-color="#a8263f"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${f(size * 0.06)}" fill="${PAPER}"/>
  <g fill="url(#qr-ink)">${dots}</g>
  ${eyes.map(eye).join("")}
  <rect x="${f(cx - plate / 2)}" y="${f(cx - plate / 2)}" width="${f(plate)}" height="${f(plate)}" rx="${f(plate * 0.3)}" fill="${PAPER}"/>
  ${heart}
</svg>`
}

/** The styled code as an image source; it is vector, so it stays sharp at any size. */
export const qrDataUrl = async (text: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await qrSvg(text))}`

/** A large square PNG of the same code, ready to print at any size. */
export async function downloadQrPng(text: string, filename: string) {
  const img = new Image()
  img.src = await qrDataUrl(text)
  await img.decode()
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1600
  canvas.getContext("2d")!.drawImage(img, 0, 0, 1600, 1600)
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
  if (!blob) throw new Error("qr")
  downloadBlob(blob, filename)
}
