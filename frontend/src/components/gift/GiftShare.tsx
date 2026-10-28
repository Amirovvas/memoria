"use client"

import { Check, Copy, Download, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { safeFilename } from "@/src/lib/export/export"
import { giftUrl } from "@/src/lib/gifts"
import { downloadQrPng, qrDataUrl } from "@/src/lib/qr"
import { useApp } from "../providers/AppProvider"
import s from "./GiftShare.module.css"

/** The QR code of a gift with everything needed to hand it over: PNG, link and a look at the page. */
export function GiftShare({ id, recipient }: { id: string; recipient: string }) {
  const { toast } = useApp()
  const url = giftUrl(id)
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let live = true
    qrDataUrl(url).then((d) => live && setQr(d))
    return () => {
      live = false
    }
  }, [url])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast("Не удалось скопировать — выделите ссылку вручную", "error")
    }
  }

  return (
    <div className={s.share}>
      <div className={s.qrFrame}>
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`QR-код подарка для ${recipient}`} className={s.qr} />
        ) : (
          <div className={`skeleton ${s.qrSkeleton}`} />
        )}
      </div>
      <p className={s.caption}>Сканируй — тут сюрприз</p>

      <div className={s.link}>
        <span className={s.url}>{url}</span>
        <button className={`btn btn-sm btn-secondary ${s.copy}`} onClick={copy}>
          {copied ? <Check size={14} className={s.copied} /> : <Copy size={14} />}
          <span className={s.labelLong}>{copied ? "Скопировано" : "Скопировать ссылку"}</span>
          <span className={s.labelShort}>{copied ? "Готово" : "Копировать"}</span>
        </button>
      </div>

      <div className={s.actions}>
        <button className="btn btn-accent" onClick={() => downloadQrPng(url, `qr-${safeFilename(recipient)}.png`)}>
          <Download size={16} /> Скачать QR (PNG)
        </button>
        <a className="btn btn-secondary" href={`/g/${id}`} target="_blank" rel="noreferrer">
          <ExternalLink size={16} /> Открыть
        </a>
      </div>
    </div>
  )
}
