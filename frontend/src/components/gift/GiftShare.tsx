"use client"

import { Check, Copy, Download, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { safeFilename } from "@/src/lib/export/export"
import { giftUrl } from "@/src/lib/gifts"
import { downloadQrPng, qrDataUrl } from "@/src/lib/qr"
import { useApp } from "../providers/AppProvider"

/** The QR code of a gift with everything needed to hand it over: PNG, link and a look at the page. */
export function GiftShare({ id, recipient }: { id: string; recipient: string }) {
  const { toast } = useApp()
  const url = giftUrl(id)
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const local = /^https?:\/\/(localhost|127\.)/.test(url)

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
    <div className="flex flex-col items-center text-center">
      <div className="rounded-[28px] bg-white p-4 shadow-card ring-1 ring-line">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`QR-код подарка для ${recipient}`} className="size-[208px] [image-rendering:pixelated] sm:size-[232px]" />
        ) : (
          <div className="skeleton size-[208px] rounded-xl sm:size-[232px]" />
        )}
      </div>
      <p className="mt-3 font-hand text-2xl text-muted">Сканируй — тут сюрприз 🎁</p>

      <div className="mt-5 flex w-full items-center gap-1 rounded-full border border-line bg-surface-2 py-1 pl-4 pr-1">
        <span className="min-w-0 flex-1 truncate text-left text-[13px] text-muted select-all">{url}</span>
        <button className="btn btn-sm btn-secondary shrink-0" onClick={copy}>
          {copied ? <Check size={14} className="text-sage" /> : <Copy size={14} />}
          <span className="max-[420px]:hidden">{copied ? "Скопировано" : "Скопировать ссылку"}</span>
          <span className="min-[421px]:hidden">{copied ? "Готово" : "Копировать"}</span>
        </button>
      </div>

      <div className="mt-3 grid w-full grid-cols-2 gap-2">
        <button className="btn btn-accent" onClick={() => downloadQrPng(url, `qr-${safeFilename(recipient)}.png`)}>
          <Download size={16} /> Скачать QR (PNG)
        </button>
        <a className="btn btn-secondary" href={`/g/${id}`} target="_blank" rel="noreferrer">
          <ExternalLink size={16} /> Открыть
        </a>
      </div>

      {local ? (
        <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-left text-xs leading-relaxed text-ink">
          Сайт открыт по адресу localhost — с другого телефона такая ссылка не откроется. Для настоящего подарка откройте
          сайт по адресу в сети или после публикации и скачайте QR заново.
        </p>
      ) : null}
    </div>
  )
}
