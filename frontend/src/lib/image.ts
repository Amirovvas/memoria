const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Не удалось подготовить фото"))), "image/jpeg", quality),
  )

/** Reads an image file and downsizes it to a JPEG, so uploads stay quick on a phone connection. */
export function fileToJpeg(file: File, maxSide = 2000, quality = 0.86): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      toJpeg(canvas, quality).then(resolve, reject)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Не удалось прочитать изображение"))
    }
    img.src = url
  })
}

export function isImageFile(file: File) {
  return file.type.startsWith("image/")
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // the pictures come from Storage; without CORS the canvas could not be read back
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Не удалось загрузить ${src}`))
    img.src = src
  })
}

interface Variant {
  src: number
  /** crop window: centre x/y and size as a share of the shorter side */
  cx: number
  cy: number
  zoom: number
  ratio: number
  flip?: boolean
  filter: string
  name: string
}

const VARIANTS: Variant[] = [
  { src: 0, cx: 0.5, cy: 0.5, zoom: 1, ratio: 0.8, filter: "none", name: "robot-hello.jpg" },
  { src: 1, cx: 0.53, cy: 0.48, zoom: 0.55, ratio: 1.25, filter: "none", name: "moon-night.jpg" },
  { src: 0, cx: 0.5, cy: 0.32, zoom: 0.55, ratio: 1, filter: "sepia(0.35) saturate(1.2)", name: "robot-portrait.jpg" },
  { src: 1, cx: 0.5, cy: 0.5, zoom: 1, ratio: 1.5, filter: "sepia(0.45) saturate(1.3) brightness(1.15)", name: "moon-clouds.jpg" },
  { src: 0, cx: 0.32, cy: 0.42, zoom: 0.6, ratio: 0.75, flip: true, filter: "hue-rotate(-25deg) saturate(1.1)", name: "robot-wave.jpg" },
  { src: 1, cx: 0.78, cy: 0.55, zoom: 0.62, ratio: 0.8, filter: "brightness(1.35) contrast(1.05)", name: "moon-sky.jpg" },
  { src: 0, cx: 0.5, cy: 0.62, zoom: 0.7, ratio: 1.25, filter: "grayscale(1) contrast(1.1)", name: "robot-bw.jpg" },
  { src: 1, cx: 0.55, cy: 0.5, zoom: 0.3, ratio: 1, filter: "sepia(0.6) brightness(1.2)", name: "moon-close.jpg" },
]

/**
 * Cuts eight different-looking photos out of the two demo pictures,
 * so the demo flow can fill a 6–8 photo collage without real uploads.
 */
export async function makeDemoPhotos(sources: string[], count = 8): Promise<{ blob: Blob; name: string }[]> {
  const imgs = await Promise.all(sources.map(loadImage))
  return Promise.all(VARIANTS.slice(0, count).map(async (v) => {
    const img = imgs[v.src % imgs.length]
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const side = Math.min(iw, ih) * v.zoom
    let cw = v.ratio >= 1 ? side * v.ratio : side
    let ch = v.ratio >= 1 ? side : side / v.ratio
    const fit = Math.min(1, iw / cw, ih / ch)
    cw *= fit
    ch *= fit
    const sx = Math.min(Math.max(v.cx * iw - cw / 2, 0), iw - cw)
    const sy = Math.min(Math.max(v.cy * ih - ch / 2, 0), ih - ch)
    const scale = Math.min(1, 1000 / Math.max(cw, ch))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(cw * scale)
    canvas.height = Math.round(ch * scale)
    const ctx = canvas.getContext("2d")!
    ctx.filter = v.filter
    if (v.flip) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(img, sx, sy, cw, ch, 0, 0, canvas.width, canvas.height)
    return { blob: await toJpeg(canvas, 0.86), name: v.name }
  }))
}
