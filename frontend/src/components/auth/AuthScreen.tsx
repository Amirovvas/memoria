import { ShieldCheck } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { asset } from "@/src/lib/photos"
import { Logo, ThemeToggle } from "../ui/bits"

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
  const tapePos = tape === "left" ? "left-3 -rotate-12" : tape === "right" ? "right-3 rotate-[14deg]" : "left-1/2 -translate-x-1/2 rotate-2"
  return (
    <div
      className={`animate-float absolute ${className}`}
      style={{ "--r": `${rotate}deg`, animationDelay: `${delay}s` } as CSSProperties}
    >
      <div className="rounded-[3px] bg-[#fbf7f0] p-[3.5%] pb-[12%] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7),0_8px_20px_-8px_rgb(0_0_0/0.5)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="aspect-[3/4] w-full rounded-[1px] object-cover" draggable={false} />
      </div>
      {tape ? (
        <span
          className={`absolute -top-3 h-6 w-[38%] bg-[#e8c9a8]/70 mix-blend-multiply shadow-sm backdrop-blur-[1px] ${tapePos}`}
          aria-hidden
        />
      ) : null}
    </div>
  )
}

/** Three collages fanned out on a dark table. Every size is a percentage, so it scales with its box. */
function CollageFan({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-[4/3] ${className}`} aria-hidden>
      <Print src={asset("15.jpg")} rotate={-11} delay={0.4} tape="left" className="left-[2%] top-[14%] w-[34%]" />
      <Print src={asset("7.jpg")} rotate={10} delay={1.1} tape="right" className="right-[2%] top-[12%] w-[34%]" />
      <Print src={asset("1.jpg")} rotate={-2} tape="center" className="left-1/2 top-0 z-10 w-[40%] -translate-x-1/2" />
      <div
        className="animate-float absolute bottom-[4%] right-[14%] z-20 rounded-[2px] bg-[#fff6d8] px-[3%] py-[1.6%] shadow-lg"
        style={{ "--r": "-6deg", animationDelay: "0.8s" } as CSSProperties}
      >
        <span className="font-hand text-[clamp(15px,2.6cqi,26px)] leading-none text-[#3b2f25]">сохрани это лето ♡</span>
      </div>
    </div>
  )
}

const TAGS = ["Путешествия", "Любовь", "Дни рождения", "Свадьба", "Мудборды"]

function Backdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[#17130f]" />
      <div className="absolute -left-1/4 -top-1/4 size-[80%] rounded-full bg-[#b4553a]/25 blur-[120px]" />
      <div className="absolute -bottom-1/3 -right-1/4 size-[70%] rounded-full bg-[#74826a]/20 blur-[120px]" />
      {/* faint paper grain */}
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
    </>
  )
}

/** Big visual on desktop: the product itself, collages fanned out with a serif headline. */
function DesktopVisual() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] text-[#f6efe6] [container-type:inline-size]">
      <Backdrop />
      <div className="relative flex items-center justify-between p-8 xl:p-10">
        <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white/80 backdrop-blur">
          Коллажи с историей
        </span>
        <span className="font-hand text-xl text-white/60">est. 2026</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-8">
        <CollageFan className="w-full max-w-[620px]" />
      </div>

      <div className="relative p-8 xl:p-12">
        <h2 className="display text-[clamp(40px,4.4vw,64px)]">
          Каждое фото —
          <br />
          <em className="text-[#e7a588]">начало истории</em>
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
          Выберите шаблон, добавьте свои снимки — и Memoria соберёт коллаж, который хочется распечатать.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <span key={t} className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/75">
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
    <div className="relative mx-auto h-[210px] w-full max-w-[560px] overflow-hidden rounded-[28px] [container-type:inline-size] sm:h-[280px]">
      <Backdrop />
      <div className="absolute inset-x-0 top-6 mx-auto w-[min(360px,88%)] sm:top-8 sm:w-[440px]">
        <CollageFan />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#17130f] to-transparent" />
    </div>
  )
}

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
      <div className="flex min-h-dvh flex-col px-4 pb-[env(safe-area-inset-bottom)] sm:px-8 lg:px-12 xl:px-20">
        <header className="flex h-16 shrink-0 items-center justify-between sm:h-20">
          <Logo />
          <ThemeToggle />
        </header>

        <div className="pt-1 lg:hidden">
          <CompactVisual />
        </div>

        <main className="flex flex-1 items-start justify-center py-8 sm:py-10 lg:items-center lg:py-12">
          <div className="animate-fade-up w-full max-w-[420px]">{children}</div>
        </main>

        <footer className="flex shrink-0 items-center justify-center gap-1.5 pb-6 text-xs text-faint lg:justify-start">
          <ShieldCheck size={14} />
          Пароли хранятся только в зашифрованном виде
        </footer>
      </div>

      <aside className="sticky top-0 hidden h-dvh p-3 lg:block">
        <DesktopVisual />
      </aside>
    </div>
  )
}
