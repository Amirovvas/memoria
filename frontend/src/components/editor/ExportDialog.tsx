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
import { cx } from "@/src/lib/cx"
import s from "./ExportDialog.module.css"

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
      <Modal open={open} onClose={close} label="Скачать коллаж" className={s.dialog}>
        <div className={s.layout}>
          <div className={s.previewPane}>
            {/* The preview keeps the chosen output proportions, so the user sees margins before downloading. */}
            <div
              className={s.previewFrame}
              style={{ aspectRatio: `${w} / ${h}`, maxWidth: `min(100%, calc(56dvh * ${w / h}))`, background: doc.bg }}
            >
              <div style={{ width: ratio >= w / h ? "100%" : `${(ratio / (w / h)) * 100}%` }}>
                <CollageCanvas ref={nodeRef} doc={doc} imgWidth={1600} />
              </div>
            </div>
          </div>

          <div className={s.side}>
            {state === "done" ? (
              <div className={`animate-fade-up ${s.done}`}>
                <span className={s.doneIcon}>
                  <Check size={30} />
                </span>
                <h2 className={cx("display", s.title, s.doneTitle)}>Готово!</h2>
                <p className={s.doneText}>
                  Файл {format.toUpperCase()} · {w} × {h} px сохранён в папку «Загрузки».
                </p>
                <div className={s.doneActions}>
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
                <h2 className={cx("display", s.title, s.titleSpaced)}>Скачать коллаж</h2>

                <p className={s.label}>Формат файла</p>
                <div className={s.formats}>
                  {FORMAT_INFO.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setChoice(f.value)}
                      className={cx(s.format, f.value === "gift" && s.formatGift)}
                      aria-pressed={choice === f.value}
                    >
                      <f.icon size={18} className={cx(s.formatIcon, (choice === f.value || f.value === "gift") && s.formatIconAccent)} />
                      <span className={s.minW0}>
                        <span className={cx(s.formatLabel, f.value !== "gift" && s.formatLabelSpaced)}>{f.label}</span>
                        <span className={s.formatText}>{f.text}</span>
                      </span>
                      {f.value === "gift" ? (
                        <span className={s.newBadge}>Новое</span>
                      ) : null}
                    </button>
                  ))}
                </div>

                {choice === "gift" ? (
                  <>
                    <div className={s.giftBox}>
                      <p className={`display ${s.giftTitle}`}>Сюрприз для друга</p>
                      <p className={s.giftText}>Друг сканирует QR телефоном и открывает анимированную страницу с вашими коллажами.</p>
                      <ul className={s.points}>
                        {GIFT_POINTS.map((g) => (
                          <li key={g.text} className={s.point}>
                            <g.icon size={17} className={s.pointIcon} />
                            {g.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className={cx("btn btn-lg btn-accent", s.cta, s.giftCta)} onClick={startGift}>
                      <Gift size={18} /> Создать подарок
                    </button>
                  </>
                ) : (
                  <>
                    <p className={s.label}>Размер</p>
                    <div className={`scrollbar-thin ${s.sizes}`}>
                      {GROUPS.map((g) => (
                        <div key={g.key}>
                          <p className={`eyebrow ${s.groupEyebrow}`}>{g.title}</p>
                          <div className={s.presets}>
                            {SIZE_PRESETS.filter((p) => p.group === g.key).map((p) => {
                              const fits = presetFit(p, ratio) >= 0.98
                              const active = p.id === presetId
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => setPresetId(p.id)}
                                  className={cx(s.preset, active && s.presetActive)}
                                >
                                  <span className={s.radio}>
                                    {active ? <span className={s.radioDot} /> : null}
                                  </span>
                                  <span className={s.presetText}>
                                    <span className={s.presetLabel}>{p.label}</span>
                                    <span className={s.presetHint}>{p.hint}</span>
                                  </span>
                                  {fits && p.group !== "original" ? (
                                    <span className={s.fits}>Подходит</span>
                                  ) : null}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className={s.note}>
                      {letterbox
                        ? "Пропорции отличаются — коллаж будет аккуратно вписан с полями цвета фона."
                        : `${w} × ${h} px${format === "pdf" ? " · одна страница" : ""}`}
                    </p>

                    <button className={`btn btn-lg btn-accent ${s.cta}`} onClick={run} disabled={state === "working"}>
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
