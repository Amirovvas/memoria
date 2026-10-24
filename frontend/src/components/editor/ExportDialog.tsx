"use client"

import { Check, Download, FileImage, FileText, Gift, Image as ImageIcon, Loader2, Music, QrCode, Sparkles } from "lucide-react"
import { useRef, useState } from "react"
import { FORMATS } from "@/src/lib/collage/styles"
import type { CollageDoc } from "@/src/lib/collage/types"
import { SIZE_PRESETS, exportCollage, presetFit, presetSize, type ExportFormat, type SizePreset } from "@/src/lib/export/export"
import { CollageCanvas } from "../collage/CollageCanvas"
import { GiftWizard } from "../gift/GiftWizard"
import { useApp } from "../providers/AppProvider"
import { Modal } from "../ui/Modal"

type Choice = ExportFormat | "gift"

const FORMAT_INFO: { value: Choice; label: string; text: string; icon: typeof ImageIcon }[] = [
  { value: "png", label: "PNG", text: "Лучшее качество", icon: ImageIcon },
  { value: "jpg", label: "JPG", text: "Лёгкий файл", icon: FileImage },
  { value: "pdf", label: "PDF", text: "Для печати", icon: FileText },
  { value: "gift", label: "Подарок с QR-кодом", text: "Страница-сюрприз", icon: Gift },
]

const GIFT_POINTS = [
  { icon: Sparkles, text: "Анимация открытия: конверт, коробка или торт со свечами" },
  { icon: Music, text: "Поздравление по буквам, коллажи и музыка" },
  { icon: QrCode, text: "QR-код, чтобы распечатать и положить на торт или в открытку" },
]

const GROUPS: { key: SizePreset["group"]; title: string }[] = [
  { key: "original", title: "Оригинал" },
  { key: "social", title: "Соцсети" },
  { key: "print", title: "Печать" },
]

export function ExportDialog({
  open,
  onClose,
  doc,
  name,
  projectId,
}: {
  open: boolean
  onClose: () => void
  doc: CollageDoc
  name: string
  /** preselected in the gift wizard */
  projectId?: string
}) {
  const { settings, toast } = useApp()
  const ratio = FORMATS[doc.format].ratio
  const [choice, setChoice] = useState<Choice>(settings.defaultFormat)
  const [giftOpen, setGiftOpen] = useState(false)
  const format: ExportFormat = choice === "gift" ? "png" : choice
  const [presetId, setPresetId] = useState("original")
  const [state, setState] = useState<"idle" | "working" | "done">("idle")
  const nodeRef = useRef<HTMLDivElement>(null)
  const preset = SIZE_PRESETS.find((p) => p.id === presetId)!
  const [w, h] = presetSize(preset, ratio)
  const letterbox = presetFit(preset, ratio) < 0.98

  const close = () => {
    setState("idle")
    onClose()
  }

  const run = async () => {
    if (!nodeRef.current) return
    setState("working")
    try {
      await exportCollage(nodeRef.current, { format, preset, ratio, background: doc.bg, name })
      setState("done")
    } catch {
      setState("idle")
      toast("Не удалось подготовить файл. Проверьте подключение — стоковые фото загружаются из сети", "error")
    }
  }

  const startGift = () => {
    close()
    setGiftOpen(true)
  }

  return (
    <>
      <Modal open={open} onClose={close} label="Скачать коллаж" className="max-w-5xl">
        <div className="grid md:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex items-center justify-center bg-surface-2 p-6 sm:p-10 md:rounded-l-3xl">
            {/* The preview keeps the chosen output proportions, so the user sees margins before downloading. */}
            <div
              className="flex w-full items-center justify-center shadow-float transition-all duration-300"
              style={{ aspectRatio: `${w} / ${h}`, maxWidth: `min(100%, calc(56dvh * ${w / h}))`, background: doc.bg }}
            >
              <div style={{ width: ratio >= w / h ? "100%" : `${(ratio / (w / h)) * 100}%` }}>
                <CollageCanvas ref={nodeRef} doc={doc} imgWidth={1600} />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            {state === "done" ? (
              <div className="animate-fade-up my-auto text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-sage-soft text-sage">
                  <Check size={30} />
                </span>
                <h2 className="display mt-5 text-4xl">Готово!</h2>
                <p className="mt-2 text-sm text-muted">
                  Файл {format.toUpperCase()} · {w} × {h} px сохранён в папку «Загрузки».
                </p>
                <div className="mt-8 flex flex-col gap-2">
                  <button className="btn btn-lg btn-primary" onClick={close}>
                    Вернуться к коллажу
                  </button>
                  <button className="btn btn-ghost" onClick={() => setState("idle")}>
                    Скачать в другом формате
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="eyebrow">Экспорт</p>
                <h2 className="display mt-1 text-4xl">Скачать коллаж</h2>

                <p className="mb-2 mt-6 text-sm font-semibold">Формат файла</p>
                <div className="grid grid-cols-3 gap-2">
                  {FORMAT_INFO.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setChoice(f.value)}
                      className={`rounded-2xl border p-3 text-left transition ${f.value === "gift" ? "col-span-3 flex items-center gap-3 bg-[linear-gradient(120deg,var(--accent-soft),transparent)]" : ""} ${choice === f.value ? "border-ink bg-surface-2" : "border-line hover:border-line-strong"}`}
                      aria-pressed={choice === f.value}
                    >
                      <f.icon size={18} className={`shrink-0 ${choice === f.value || f.value === "gift" ? "text-accent" : "text-muted"}`} />
                      <span className="min-w-0">
                        <span className={`block text-sm font-bold ${f.value === "gift" ? "" : "mt-2"}`}>{f.label}</span>
                        <span className="block text-[11px] text-muted">{f.text}</span>
                      </span>
                      {f.value === "gift" ? (
                        <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-ink">Новое</span>
                      ) : null}
                    </button>
                  ))}
                </div>

                {choice === "gift" ? (
                  <>
                    <div className="mt-6 rounded-2xl bg-surface-2 p-5">
                      <p className="display text-2xl">Сюрприз для друга</p>
                      <p className="mt-1 text-sm text-muted">Друг сканирует QR телефоном и открывает анимированную страницу с вашими коллажами.</p>
                      <ul className="mt-4 space-y-2.5">
                        {GIFT_POINTS.map((g) => (
                          <li key={g.text} className="flex gap-3 text-sm">
                            <g.icon size={17} className="mt-0.5 shrink-0 text-accent" />
                            {g.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="btn btn-lg btn-accent mt-auto w-full max-md:mt-6" onClick={startGift}>
                      <Gift size={18} /> Создать подарок
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-2 mt-6 text-sm font-semibold">Размер</p>
                    <div className="max-h-[300px] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
                      {GROUPS.map((g) => (
                        <div key={g.key}>
                          <p className="eyebrow mb-1.5">{g.title}</p>
                          <div className="space-y-1">
                            {SIZE_PRESETS.filter((p) => p.group === g.key).map((p) => {
                              const fits = presetFit(p, ratio) >= 0.98
                              const active = p.id === presetId
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => setPresetId(p.id)}
                                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${active ? "bg-surface-2" : "hover:bg-surface-2/60"}`}
                                >
                                  <span
                                    className={`grid size-4 shrink-0 place-items-center rounded-full border-2 ${active ? "border-accent" : "border-line-strong"}`}
                                  >
                                    {active ? <span className="size-1.5 rounded-full bg-accent" /> : null}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold">{p.label}</span>
                                    <span className="block text-xs text-muted">{p.hint}</span>
                                  </span>
                                  {fits && p.group !== "original" ? (
                                    <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[10px] font-bold text-sage">Подходит</span>
                                  ) : null}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 min-h-8 text-xs leading-relaxed text-muted">
                      {letterbox
                        ? "Пропорции отличаются — коллаж будет аккуратно вписан с полями цвета фона."
                        : `${w} × ${h} px${format === "pdf" ? " · одна страница" : ""}`}
                    </p>

                    <button className="btn btn-lg btn-accent mt-auto w-full" onClick={run} disabled={state === "working"}>
                      {state === "working" ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      {state === "working" ? "Готовим файл…" : `Скачать ${format.toUpperCase()}`}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
      {giftOpen ? <GiftWizard open onClose={() => setGiftOpen(false)} projectId={projectId} /> : null}
    </>
  )
}
