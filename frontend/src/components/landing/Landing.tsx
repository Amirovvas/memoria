import { ArrowRight, Check, Download, ImagePlus, LayoutTemplate } from "lucide-react"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"
import { photo, type PhotoKey } from "@/src/lib/photos"
import { ThemeToggle } from "../ui/bits"
import { LandingQr } from "./LandingQr"
import s from "./Landing.module.css"

/* The landing shows loose photos and a gift on a phone, never the template collages of the catalogue. */

const OCCASIONS = ["Путешествия", "Любовь", "Дни рождения", "Свадьба", "Друзья", "Семья", "Выпускной", "Воспоминания"]

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "Выберите шаблон",
    text: "Больше сотни композиций для путешествий, любви, праздников и будней — от плёнки до журнального разворота.",
  },
  {
    icon: ImagePlus,
    title: "Добавьте свои фото",
    text: "Перетащите снимки в рамки, поменяйте подписи, цвета и шрифты. Всё сохраняется само.",
  },
  {
    icon: Download,
    title: "Скачайте или подарите",
    text: "PNG, JPG и PDF для печати — или страница-сюрприз с QR-кодом для близкого человека.",
  },
]

const GIFT_POINTS = [
  "Три анимации открытия: конверт, коробка и торт со свечами",
  "Поздравление печатается прямо на глазах, как на машинке",
  "Музыка из библиотеки или ваша собственная песня",
  "Получателю не нужен аккаунт — достаточно навести камеру",
]

const MOMENTS: { key: PhotoKey; label: string }[] = [
  { key: "positano", label: "Путешествия" },
  { key: "heartsBokeh", label: "Любовь" },
  { key: "cake", label: "День рождения" },
  { key: "weddingCouple", label: "Свадьба" },
  { key: "friendsSunset", label: "Друзья" },
  { key: "familyBeach", label: "Семья" },
]

/** One photo printed on paper and taped to the table; `--r` keeps the tilt while animate-float bobs it. */
function Print({ src, caption, rotate, delay, className }: { src: string; caption: string; rotate: number; delay: number; className: string }) {
  return (
    <figure className={`animate-float ${s.print} ${className}`} style={{ "--r": `${rotate}deg`, animationDelay: `${delay}s` } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={s.printPhoto} draggable={false} />
      <figcaption className={s.printCaption}>{caption}</figcaption>
      <span className={s.tape} aria-hidden />
    </figure>
  )
}

function HeroVisual() {
  return (
    <div className={s.heroVisual} aria-hidden>
      <div className={s.glow} />
      <Print src={photo("amalfiCoast", 560)} caption="Амальфи" rotate={-8} delay={0.3} className={s.printA} />
      <Print src={photo("friendsSunset", 560)} caption="мы ♡" rotate={7} delay={1.1} className={s.printB} />
      <Print src={photo("heartHands", 560)} caption="навсегда" rotate={-2} delay={0} className={s.printC} />
      <div className={`animate-float ${s.ticket}`} style={{ "--r": "9deg", animationDelay: "0.7s" } as CSSProperties}>
        <span className={s.ticketQr}>
          <LandingQr />
        </span>
        <span className={s.ticketText}>Сканируй — тут сюрприз 🎁</span>
      </div>
    </div>
  )
}

/** The first screen a friend sees after scanning the code, drawn in CSS. */
function PhoneMock() {
  return (
    <div className={s.phone} aria-hidden>
      <span className={s.notch} />
      <div className={s.screen}>
        <span className={s.sparkA}>✦</span>
        <span className={s.sparkB}>✦</span>
        <span className={s.giftBadge}>🎁</span>
        <span className={s.screenEyebrow}>Для тебя есть сюрприз</span>
        <span className={s.screenName}>Алина</span>
        <span className={s.screenText}>Кто-то собрал для тебя немного тёплых воспоминаний</span>
        <span className={s.screenButton}>Открыть 🎁</span>
        <span className={s.screenHint}>🔊 Включи звук — тут есть музыка</span>
      </div>
    </div>
  )
}

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text?: string }) {
  return (
    <div className={s.sectionHead}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`display ${s.sectionTitle}`}>{title}</h2>
      {text ? <p className={s.sectionText}>{text}</p> : null}
    </div>
  )
}

export function Landing() {
  return (
    <div className={s.page} id="top">
      <header className={s.header}>
        <div className={s.headerInner}>
          <a href="#top" className={s.brand} aria-label="Memoria — наверх">
            <span className={s.brandMark}>M</span>
            <span className={s.brandName}>Memoria</span>
          </a>
          <nav className={s.nav} aria-label="Разделы">
            <a href="#how">Как это работает</a>
            <a href="#gift">Подарок с QR</a>
          </nav>
          <div className={s.headerActions}>
            <ThemeToggle />
            <Link href="/login" className={`btn btn-ghost ${s.signIn}`}>
              Войти
            </Link>
            <Link href="/register" className="btn btn-accent">
              Начать
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={s.hero}>
          <div className={`animate-fade-up ${s.heroCopy}`}>
            <p className="eyebrow">Фотоколлажи · Подарки с QR-кодом</p>
            <h1 className={`display ${s.heroTitle}`}>
              Ваши фото заслуживают <em className={s.accent}>большего</em>, чем галерея телефона
            </h1>
            <p className={s.heroText}>
              Memoria превращает снимки в коллажи, которые хочется распечатать, и в подарки-сюрпризы: QR-код на торте, в
              открытке или в коробке — а внутри ваши воспоминания, музыка и тёплые слова.
            </p>
            <div className={s.heroActions}>
              <Link href="/register" className="btn btn-accent btn-lg">
                Создать первый коллаж <ArrowRight size={17} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                У меня есть аккаунт
              </Link>
            </div>
            <p className={s.heroMeta}>
              <span>Бесплатно</span>
              <span>Без установки</span>
              <span>Удобно с телефона</span>
            </p>
          </div>
          <HeroVisual />
        </section>

        <div className={s.marquee} aria-hidden>
          <div className={s.marqueeTrack}>
            {[...OCCASIONS, ...OCCASIONS].map((o, i) => (
              <span key={i} className={s.marqueeItem}>
                {o} <span className={s.marqueeStar}>✦</span>
              </span>
            ))}
          </div>
        </div>

        <section id="how" className={s.section}>
          <SectionHead eyebrow="Как это работает" title={<>Три шага от снимков до <em className={s.accent}>истории</em></>} />
          <ol className={s.steps}>
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className={s.step}>
                <span className={s.stepNumber}>0{i + 1}</span>
                <span className={s.stepIcon}>
                  <Icon size={22} />
                </span>
                <h3 className={s.stepTitle}>{title}</h3>
                <p className={s.stepText}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="gift" className={s.giftSection}>
          <div className={s.gift}>
            <div className={s.giftVisual}>
              <PhoneMock />
              <div className={s.topper} aria-hidden>
                <span className={s.topperQr}>
                  <LandingQr />
                </span>
                <span className={s.topperText}>с днём рождения!</span>
              </div>
            </div>
            <div className={s.giftCopy}>
              <SectionHead
                eyebrow="Подарок с QR-кодом"
                title={
                  <>
                    Положите QR-код на торт — и <em className={s.accent}>удивите</em>
                  </>
                }
                text="Человек сканирует код и открывает свою страницу: конверт, коробку или торт со свечами, поздравление, ваши коллажи и музыку."
              />
              <ul className={s.points}>
                {GIFT_POINTS.map((p) => (
                  <li key={p}>
                    <span className={s.pointCheck}>
                      <Check size={14} strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`btn btn-primary btn-lg ${s.giftCta}`}>
                Собрать подарок <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <SectionHead eyebrow="Для любых моментов" title="Каждому событию — своя история" />
          <div className={s.moments}>
            {MOMENTS.map((m, i) => (
              <Link key={m.key} href="/register" className={s.moment} style={{ "--r": `${i % 2 ? 1.5 : -1.5}deg` } as CSSProperties}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo(m.key, 480)} alt="" loading="lazy" decoding="async" className={s.momentPhoto} />
                <span className={s.momentLabel}>{m.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={s.final}>
          <div className={s.finalCard}>
            <span className={s.finalNote}>а вдруг это лучший подарок в году?</span>
            <h2 className={`display ${s.finalTitle}`}>Начните со снимков, которые уже есть в вашем телефоне</h2>
            <p className={s.finalText}>Первый коллаж займёт пару минут. Регистрация — меньше минуты.</p>
            <Link href="/register" className="btn btn-accent btn-lg">
              Создать аккаунт <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <a href="#top" className={s.brand}>
            <span className={s.brandMark}>M</span>
            <span className={s.brandName}>Memoria</span>
          </a>
          <p className={s.footerText}>Коллажи с историей · 2026</p>
          <div className={s.footerLinks}>
            <Link href="/login">Войти</Link>
            <Link href="/register">Регистрация</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
