"use client"

import { useEffect, useState } from "react"
import { qrDataUrl } from "@/src/lib/qr"
import s from "./Landing.module.css"

/** A real QR code of this site, so the one on the cake topper can actually be scanned. */
export function LandingQr() {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    qrDataUrl(window.location.origin).then((d) => live && setSrc(d))
    return () => {
      live = false
    }
  }, [])

  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="QR-код Memoria" className={s.qrImage} /> : <span className={`skeleton ${s.qrImage}`} />
}
