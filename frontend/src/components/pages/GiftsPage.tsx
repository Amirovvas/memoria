"use client"

import { ExternalLink, Gift as GiftIcon, Plus, QrCode, Trash2 } from "lucide-react"
import { useState } from "react"
import { useDeleteGift, useGifts } from "@/src/hooks/useGifts"
import { OCCASION_BY_ID, OPENINGS, type Gift } from "@/src/lib/gifts"
import { GiftShare } from "../gift/GiftShare"
import { GiftWizard } from "../gift/GiftWizard"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState, TimeAgo } from "../ui/bits"
import { Modal } from "../ui/Modal"

function GiftCard({ gift, onShare, onDelete }: { gift: Gift; onShare: () => void; onDelete: () => void }) {
  const occasion = OCCASION_BY_ID[gift.occasion]
  const opening = OPENINGS.find((o) => o.id === gift.animation)
  return (
    <article className="animate-fade-up">
      <button
        onClick={onShare}
        className="group relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#fbefe6,#f3dccf)] p-[12%] ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
      >
        {gift.cover ? (
          <span className="block w-full rotate-[-3deg] bg-[#fffdf8] p-[5%] pb-[14%] shadow-card transition-transform duration-500 group-hover:rotate-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gift.cover} alt="" loading="lazy" className="block w-full" />
          </span>
        ) : (
          <GiftIcon size={40} className="text-accent" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#5b3a2e] backdrop-blur">
          {occasion?.emoji} {occasion?.label}
        </span>
        <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-white text-[#1f1b16] shadow-card">
          <QrCode size={17} />
        </span>
      </button>
      <div className="mt-3 flex items-start gap-2 px-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold">{gift.recipient}</h3>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {opening?.emoji} {gift.collages.length} колл. · <TimeAgo ts={gift.createdAt} />
          </p>
        </div>
        <a className="icon-btn size-8 text-muted" href={`/g/${gift.id}`} target="_blank" rel="noreferrer" aria-label="Открыть страницу" title="Открыть страницу">
          <ExternalLink size={16} />
        </a>
        <button className="icon-btn -mr-1 size-8 text-muted" onClick={onDelete} aria-label="Удалить подарок" title="Удалить подарок">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}

export function GiftsPage() {
  const { toast } = useApp()
  const { data: gifts, isPending } = useGifts()
  const remove = useDeleteGift()
  const [creating, setCreating] = useState(false)
  const [sharing, setSharing] = useState<Gift | null>(null)
  const [deleting, setDeleting] = useState<Gift | null>(null)

  const confirmDelete = () => {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => toast("Подарок удалён — ссылка больше не открывается"),
      onError: (e) => toast(e.message, "error"),
    })
    setDeleting(null)
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-8 pt-4">
        <div>
          <p className="eyebrow">Библиотека</p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">Мои подарки</h1>
          <p className="mt-2 text-[15px] text-muted">Страницы-сюрпризы с QR-кодом. Нажмите на подарок, чтобы снова скачать QR или скопировать ссылку.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setCreating(true)}>
          <Plus size={16} /> Создать подарок
        </button>
      </header>

      {isPending ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : !gifts?.length ? (
        <EmptyState
          art={<EmptyArt icon={<GiftIcon size={26} />} />}
          title="Пока без подарков"
          text="Соберите коллажи в страницу-сюрприз с поздравлением и музыкой, распечатайте QR-код — и положите его на торт или в открытку."
          action={
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              <GiftIcon size={16} /> Создать первый подарок
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5">
          {gifts.map((g) => (
            <GiftCard key={g.id} gift={g} onShare={() => setSharing(g)} onDelete={() => setDeleting(g)} />
          ))}
        </div>
      )}

      {creating ? <GiftWizard open onClose={() => setCreating(false)} /> : null}

      <Modal open={!!sharing} onClose={() => setSharing(null)} label="QR-код подарка" className="max-w-md">
        {sharing ? (
          <div className="p-6 sm:p-8">
            <p className="eyebrow text-accent">Подарок</p>
            <h2 className="display mb-6 mt-1 text-3xl">{sharing.recipient}</h2>
            <GiftShare id={sharing.id} recipient={sharing.recipient} />
          </div>
        ) : null}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} label="Удалить подарок" className="max-w-md">
        <div className="p-6 sm:p-8">
          <h2 className="display text-3xl">Удалить подарок?</h2>
          <p className="mt-2 text-sm text-muted">
            Страница-сюрприз «{deleting?.recipient}» перестанет открываться, а уже напечатанный QR-код будет вести в никуда. Коллажи в проектах останутся.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>
              Отмена
            </button>
            <button className="btn btn-primary bg-[#b4553a]" onClick={confirmDelete}>
              <Trash2 size={15} /> Удалить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
