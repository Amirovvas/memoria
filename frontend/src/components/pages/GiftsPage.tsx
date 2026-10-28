"use client"

import { ExternalLink, Gift as GiftIcon, Plus, QrCode, Trash2 } from "lucide-react"
import { useState } from "react"
import { useDeleteGift } from "@/src/hooks/useDeleteGift"
import { useGifts } from "@/src/hooks/useGifts"
import { OCCASION_BY_ID, OPENINGS, type Gift } from "@/src/lib/gifts"
import { GiftShare } from "../gift/GiftShare"
import { GiftWizard } from "../gift/GiftWizard"
import { useApp } from "../providers/AppProvider"
import { EmptyArt, EmptyState, TimeAgo, plural } from "../ui/bits"
import { Modal } from "../ui/Modal"
import page from "./page.module.css"
import s from "./GiftsPage.module.css"

function GiftCard({ gift, onShare, onDelete }: { gift: Gift; onShare: () => void; onDelete: () => void }) {
  const occasion = OCCASION_BY_ID[gift.occasion]
  const opening = OPENINGS.find((o) => o.id === gift.animation)
  return (
    <article className="animate-fade-up">
      <button onClick={onShare} className={s.thumb}>
        {gift.cover ? (
          <span className={s.cover}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gift.cover} alt="" loading="lazy" className={s.coverImage} />
          </span>
        ) : (
          <GiftIcon size={40} className={s.giftIcon} />
        )}
        <span className={s.occasion}>
          {occasion ? <occasion.icon size={13} strokeWidth={2} /> : null} {occasion?.label}
        </span>
        <span className={s.qr}>
          <QrCode size={17} />
        </span>
      </button>
      <div className={s.meta}>
        <div className={s.info}>
          <h3 className={s.name}>{gift.recipient}</h3>
          <p className={s.sub}>
            {opening ? <opening.icon size={13} strokeWidth={2} className={s.subIcon} /> : null}
            {gift.collages.length} {plural(gift.collages.length, "коллаж", "коллажа", "коллажей")} · <TimeAgo ts={gift.createdAt} />
          </p>
        </div>
        <a className={`icon-btn ${s.action}`} href={`/g/${gift.id}`} target="_blank" rel="noreferrer" aria-label="Открыть страницу" title="Открыть страницу">
          <ExternalLink size={16} />
        </a>
        <button className={`icon-btn ${s.action} ${s.last}`} onClick={onDelete} aria-label="Удалить подарок" title="Удалить подарок">
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
    <div className={page.page}>
      <header className={`${page.header} ${page.headerLoose}`}>
        <div>
          <p className="eyebrow">Библиотека</p>
          <h1 className={`display ${page.title}`}>Мои подарки</h1>
          <p className={page.lead}>Страницы-сюрпризы с QR-кодом. Нажмите на подарок, чтобы снова скачать QR или скопировать ссылку.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setCreating(true)}>
          <Plus size={16} /> Создать подарок
        </button>
      </header>

      {isPending ? (
        <div className={page.grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={`skeleton ${s.skeleton}`} />
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
        <div className={page.grid}>
          {gifts.map((g) => (
            <GiftCard key={g.id} gift={g} onShare={() => setSharing(g)} onDelete={() => setDeleting(g)} />
          ))}
        </div>
      )}

      {creating ? <GiftWizard open onClose={() => setCreating(false)} /> : null}

      <Modal open={!!sharing} onClose={() => setSharing(null)} label="QR-код подарка" className={s.dialog}>
        {sharing ? (
          <div className={s.dialogBody}>
            <p className={`eyebrow ${s.eyebrowAccent}`}>Подарок</p>
            <h2 className={`display ${s.dialogTitle} ${s.shareTitle}`}>{sharing.recipient}</h2>
            <GiftShare id={sharing.id} recipient={sharing.recipient} />
          </div>
        ) : null}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} label="Удалить подарок" className={s.dialog}>
        <div className={s.dialogBody}>
          <h2 className={`display ${s.dialogTitle}`}>Удалить подарок?</h2>
          <p className={s.dialogText}>
            Страница-сюрприз «{deleting?.recipient}» перестанет открываться, а уже напечатанный QR-код будет вести в никуда. Коллажи в проектах останутся.
          </p>
          <div className={s.actions}>
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>
              Отмена
            </button>
            <button className={`btn btn-primary ${s.danger}`} onClick={confirmDelete}>
              <Trash2 size={15} /> Удалить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
