import { ShieldCheck } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { asset } from "@/src/lib/photos"
import { Logo, ThemeToggle } from "../ui/bits"
import s from "./AuthScreen.module.css"

/** A finished collage printed on photo paper; `--r` keeps the tilt while animate-float bobs it. */
function Print({
  src,
  className,
  rotate,
  delay = 0,
  tape,
}: {
  src: string
  className: string
  rotate: number
  delay?: number
  tape?: "left" | "right" | "center"
}) {
  const tapePos = tape === "left" ? s.tapeLeft : tape === "right" ? s.tapeRight : s.tapeCenter
  return (
    <div
      className={`animate-float ${s.print} ${className}`}
      style={{ "--r": `${rotate}deg`, animationDelay: `${delay}s` } as CSSProperties}
    >
      <div className={s.paper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className={s.photo} draggable={false} />
      </div>
      {tape ? <span className={`${s.tape} ${tapePos}`} aria-hidden /> : null}
    </div>
  )
}

/** Three collages fanned out on a dark table. Every size is a percentage, so it scales with its box. */
function CollageFan({ className = "" }: { className?: string }) {
  return (
    <div className={`${s.fan} ${className}`} aria-hidden>
      <Print src={asset("15.jpg")} rotate={-11} delay={0.4} tape="left" className={s.printLeft} />
      <Print src={asset("7.jpg")} rotate={10} delay={1.1} tape="right" className={s.printRight} />
      <Print src={asset("1.jpg")} rotate={-2} tape="center" className={s.printCenter} />
      <div className={`animate-float ${s.note}`} style={{ "--r": "-6deg", animationDelay: "0.8s" } as CSSProperties}>
        <span className={s.noteText}>сохрани это лето ♡</span>
      </div>
    </div>
  )
}

const TAGS = ["Путешествия", "Любовь", "Дни рождения", "Свадьба", "Мудборды"]

function Backdrop() {
  return (
    <>
      <div className={s.table} />
      <div className={s.glowWarm} />
      <div className={s.glowCool} />
      {/* faint paper grain */}
      <div className={s.grain} />
    </>
  )
}

/** Big visual on desktop: the product itself, collages fanned out with a serif headline. */
function DesktopVisual() {
  return (
    <div className={s.desk}>
      <Backdrop />
      <div className={s.deskTop}>
        <span className={s.badge}>Коллажи с историей</span>
        <span className={s.est}>est. 2026</span>
      </div>

      <div className={s.deskMid}>
        <CollageFan className={s.deskFan} />
      </div>

      <div className={s.deskBottom}>
        <h2 className={`display ${s.deskTitle}`}>
          Каждое фото —
          <br />
          <em className={s.deskAccent}>начало истории</em>
        </h2>
        <p className={s.deskText}>
          Выберите шаблон, добавьте свои снимки — и Memoria соберёт коллаж, который хочется распечатать.
        </p>
        <div className={s.tags}>
          {TAGS.map((t) => (
            <span key={t} className={s.tag}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Phones and tablets: the same fan in a short card above the form. */
function CompactVisual() {
  return (
    <div className={s.compact}>
      <Backdrop />
      <div className={s.compactFan}>
        <CollageFan />
      </div>
      <div className={s.compactFade} />
    </div>
  )
}

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className={s.screen}>
      <div className={s.column}>
        <header className={s.header}>
          <Logo />
          <ThemeToggle />
        </header>

        <div className={s.compactWrap}>
          <CompactVisual />
        </div>

        <main className={s.main}>
          <div className={`animate-fade-up ${s.formWrap}`}>{children}</div>
        </main>

        <footer className={s.footer}>
          <ShieldCheck size={14} />
          Пароли хранятся только в зашифрованном виде
        </footer>
      </div>

      <aside className={s.aside}>
        <DesktopVisual />
      </aside>
    </div>
  )
}
