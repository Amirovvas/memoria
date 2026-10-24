import { FORMATS } from "../collage/styles"
import type { CollageDoc } from "../collage/types"
import { renderCollage } from "./export"

/** Longest side of a collage on the gift page: sharp on a phone, light enough for mobile data. */
const LONG_SIDE = 1600

function waitForImages(node: HTMLElement, timeout = 10_000) {
  const pending = [...node.querySelectorAll("img")].filter((img) => !img.complete)
  const loaded = Promise.all(
    pending.map(
      (img) =>
        new Promise((done) => {
          img.addEventListener("load", done, { once: true })
          img.addEventListener("error", done, { once: true })
        }),
    ),
  )
  return Promise.race([loaded, new Promise((r) => setTimeout(r, timeout))])
}

/** Renders a mounted collage into a JPEG of the collage's own proportions. */
export async function snapshotCollage(node: HTMLElement, doc: CollageDoc) {
  await waitForImages(node)
  const ratio = FORMATS[doc.format].ratio
  const [w, h] = ratio >= 1 ? [LONG_SIDE, Math.round(LONG_SIDE / ratio)] : [Math.round(LONG_SIDE * ratio), LONG_SIDE]
  const canvas = await renderCollage(node, w, h, doc.bg)
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88))
  if (!blob) throw new Error("Не удалось подготовить коллаж")
  return { blob, w, h }
}
