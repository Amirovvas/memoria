import QRCode from "qrcode"
import { downloadBlob } from "./export/export"

// "Q" survives a smudge of cream or a curved cake topper better than the default "M"
const OPTIONS = { errorCorrectionLevel: "Q", margin: 2, color: { dark: "#1f1b16", light: "#ffffff" } } as const

export const qrDataUrl = (text: string, width = 640) => QRCode.toDataURL(text, { ...OPTIONS, width })

/** A large square PNG with a quiet white border, ready to print at any size. */
export async function downloadQrPng(text: string, filename: string) {
  const canvas = await QRCode.toCanvas(text, { ...OPTIONS, width: 1600 })
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
  if (!blob) throw new Error("qr")
  downloadBlob(blob, filename)
}
