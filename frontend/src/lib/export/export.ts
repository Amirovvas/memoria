export type ExportFormat = "png" | "jpg" | "pdf"

export interface SizePreset {
  id: string
  group: "social" | "print" | "original"
  label: string
  hint: string
  /** output size in pixels; null means "follow the collage ratio" */
  w: number | null
  h: number | null
  /** physical page size in PDF points (1/72 in) for print presets */
  page?: [number, number]
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: "original", group: "original", label: "Как в редакторе", hint: "Пропорции коллажа · 2400 px", w: null, h: null },
  { id: "ig-post", group: "social", label: "Instagram пост", hint: "1080 × 1350", w: 1080, h: 1350 },
  { id: "ig-square", group: "social", label: "Квадрат", hint: "1080 × 1080", w: 1080, h: 1080 },
  { id: "story", group: "social", label: "Сторис / Reels", hint: "1080 × 1920", w: 1080, h: 1920 },
  { id: "pin", group: "social", label: "Pinterest", hint: "1000 × 1500", w: 1000, h: 1500 },
  { id: "a4", group: "print", label: "A4", hint: "210 × 297 мм · 300 dpi", w: 2480, h: 3508, page: [595.28, 841.89] },
  { id: "a5", group: "print", label: "A5", hint: "148 × 210 мм · 300 dpi", w: 1748, h: 2480, page: [419.53, 595.28] },
  { id: "photo-10x15", group: "print", label: "Фото 10 × 15", hint: "300 dpi", w: 1181, h: 1772, page: [283.46, 425.2] },
  { id: "landscape", group: "print", label: "Альбом A4", hint: "297 × 210 мм · 300 dpi", w: 3508, h: 2480, page: [841.89, 595.28] },
]

export function presetSize(preset: SizePreset, ratio: number): [number, number] {
  if (preset.w && preset.h) return [preset.w, preset.h]
  return ratio >= 1 ? [2400, Math.round(2400 / ratio)] : [Math.round(2400 * ratio), 2400]
}

/** How well a preset fits the collage: 1 means the same proportions. */
export function presetFit(preset: SizePreset, ratio: number) {
  const [w, h] = presetSize(preset, ratio)
  const r = w / h
  return Math.min(r, ratio) / Math.max(r, ratio)
}

/**
 * Renders the collage node into a canvas of the requested size.
 * When the proportions differ, the collage is centred on its own background colour, never stretched.
 */
export async function renderCollage(node: HTMLElement, width: number, height: number, background: string) {
  // collage faces are not preloaded (app/layout.tsx); let the ones this collage uses finish first
  // html-to-image is loaded on the first export, so it stays out of the editor and gift bundles
  const [{ toCanvas }] = await Promise.all([import("html-to-image"), document.fonts.ready])
  const rect = node.getBoundingClientRect()
  const scale = Math.min(width / rect.width, height / rect.height)
  const shot = await toCanvas(node, {
    pixelRatio: scale,
    cacheBust: false,
    backgroundColor: background,
    filter: (n) => !(n instanceof HTMLElement && n.dataset.exportIgnore === "true"),
  })
  const out = document.createElement("canvas")
  out.width = width
  out.height = height
  const ctx = out.getContext("2d")!
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
  const dw = rect.width * scale
  const dh = rect.height * scale
  ctx.drawImage(shot, (width - dw) / 2, (height - dh) / 2, dw, dh)
  return out
}

function dataUrlToBytes(dataUrl: string) {
  const bin = atob(dataUrl.split(",")[1])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Minimal one-page PDF that embeds a JPEG — enough for printing a collage without extra libraries. */
export function jpegToPdf(jpegDataUrl: string, px: [number, number], page: [number, number]) {
  const img = dataUrlToBytes(jpegDataUrl)
  const enc = new TextEncoder()
  const [pw, ph] = page
  const content = `q ${pw.toFixed(2)} 0 0 ${ph.toFixed(2)} 0 0 cm /Im0 Do Q`
  const parts: (Uint8Array | string)[] = []
  const offsets: number[] = []
  let length = 0
  const push = (chunk: Uint8Array | string) => {
    parts.push(chunk)
    length += typeof chunk === "string" ? enc.encode(chunk).length : chunk.length
  }
  const obj = (n: number, body: string) => {
    offsets[n] = length
    push(`${n} 0 obj\n${body}\nendobj\n`)
  }

  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>")
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)
  offsets[4] = length
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${px[0]} /Height ${px[1]} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`)
  push(img)
  push("\nendstream\nendobj\n")
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)

  const xref = length
  let table = "xref\n0 6\n0000000000 65535 f \n"
  for (let i = 1; i <= 5; i++) table += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  push(`${table}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`)

  return new Blob(
    parts.map((p) => (typeof p === "string" ? enc.encode(p) : p)) as BlobPart[],
    { type: "application/pdf" },
  )
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function safeFilename(name: string) {
  return (name.trim() || "collage").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-").slice(0, 60)
}

export async function exportCollage(
  node: HTMLElement,
  opts: { format: ExportFormat; preset: SizePreset; ratio: number; background: string; name: string },
) {
  const [w, h] = presetSize(opts.preset, opts.ratio)
  const canvas = await renderCollage(node, w, h, opts.background)
  const file = safeFilename(opts.name)
  if (opts.format === "png") {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
    if (!blob) throw new Error("png")
    downloadBlob(blob, `${file}.png`)
  } else if (opts.format === "jpg") {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92))
    if (!blob) throw new Error("jpg")
    downloadBlob(blob, `${file}.jpg`)
  } else {
    const jpeg = canvas.toDataURL("image/jpeg", 0.92)
    // Points follow the print size when known, otherwise 150 dpi of the pixel size.
    const page: [number, number] = opts.preset.page ?? [(w / 150) * 72, (h / 150) * 72]
    downloadBlob(jpegToPdf(jpeg, [w, h], page), `${file}.pdf`)
  }
}
