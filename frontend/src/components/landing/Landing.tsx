import { ArrowRight, Check, Gift } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { photo, type PhotoKey } from "@/src/lib/photos"
import { Logo, ThemeToggle } from "../ui/bits"
import { LandingQr } from "./LandingQr"
import s from "./Landing.module.css"

/* An editorial landing: real photographs, one serif voice, plenty of air. Never the template collages of the catalogue. */

const STEPS = [
  {
    title: "Выберите шаблон",
    text: "Больше сотни композиций для путешествий, праздников и будней — от плёночной ленты до журнального разворота.",
  },
  {
    title: "Добавьте свои фото",
    text: "Перетащите снимки в рамки, поменяйте подписи, цвета и шрифты. Всё сохраняется в аккаунте само.",
  },
  {
    title: "Распечатайте или подарите",
    text: "PNG, JPG и PDF для печати — или страница-сюрприз с QR-кодом для близкого человека.",
  },
]

const GIFT_POINTS = [
  "Анимация открытия, поздравление и ваши коллажи на одной странице",
  "Музыка из библиотеки или ваша собственная песня",
  "Получателю не нужен аккаунт — достаточно навести камеру",
]

/** Three real prints under the first words, so the first screen shows what the site makes. */
const HERO_PRINTS: PhotoKey[] = ["friendsSunset", "positano", "heartsBokeh"]

const MOMENTS: { key: PhotoKey; label: string }[] = [
  { key: "positano", label: "Путешествия" },
  { key: "heartsBokeh", label: "Любовь" },
  { key: "cake", label: "День рождения" },
  { key: "weddingCouple", label: "Свадьба" },
  { key: "friendsSitting", label: "Друзья" },
  { key: "familyBeach", label: "Семья" },
]

/** The first screen a friend sees after scanning the code, drawn in CSS. */
function PhoneMock() {
  return (
    <div className={s.phone} aria-hidden>
      <span className={s.notch} />
      <div className={s.screen}>
        <span className={s.screenIcon}>
          <Gift size={26} strokeWidth={1.6} />
        </span>
        <span className={s.screenEyebrow}>Для тебя есть сюрприз</span>
        <span className={s.screenName}>Алина</span>
        <span className={s.screenText}>Кто-то собрал для тебя немного тёплых воспоминаний</span>
        <span className={s.screenButton}>Открыть</span>
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
          <Logo href="#top" />
          <nav className={s.nav} aria-label="Разделы">
            <a href="#how">Как это работает</a>
            <a href="#gift">Подарок с QR</a>
          </nav>
          <div className={s.headerActions}>
            <ThemeToggle />
            <Link href="/login" className={`btn btn-ghost ${s.signIn}`}>
              Войти
            </Link>
            <Link href="/register" className="btn btn-primary">
              Начать
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={`animate-fade-up ${s.hero}`}>
          <p className="eyebrow">Фотоколлажи и подарки с QR-кодом</p>
          <h1 className={`display ${s.heroTitle}`}>
            Фотографии, которые хочется <em className={s.accent}>держать в руках</em>
          </h1>
          <p className={s.heroText}>
            Memoria собирает ваши снимки в коллажи для печати и в подарки-сюрпризы: QR-код в открытке открывает страницу с
            вашими фото, словами и музыкой.
          </p>
          <div className={s.heroActions}>
            <Link href="/register" className={`btn btn-lg btn-accent ${s.heroCta}`}>
              Создать коллаж <ArrowRight size={18} />
            </Link>
            <p className={s.heroNote}>
              Бесплатно · уже есть аккаунт?{" "}
              <Link href="/login" className={s.heroLink}>
                Войти
              </Link>
            </p>
          </div>
          <div className={s.prints} aria-hidden>
            {HERO_PRINTS.map((key, i) => (
              <span key={key} className={`${s.print} ${[s.print0, s.print1, s.print2][i]}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo(key, 600)} alt="" decoding="async" className={s.printPhoto} />
              </span>
            ))}
          </div>
        </section>

        <section id="how" className={s.section}>
          <SectionHead eyebrow="Как это работает" title="Три шага от снимков до готовой истории" />
          <ol className={s.steps}>
            {STEPS.map(({ title, text }, i) => (
              <li key={title} className={s.step}>
                <span className={`display ${s.stepNumber}`}>0{i + 1}</span>
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
              <div className={s.qrCard} aria-hidden>
                <span className={s.qrCardImage}>
                  <LandingQr />
                </span>
                <span className={s.qrCardLabel}>Подарок для Алины</span>
              </div>
            </div>
            <div className={s.giftCopy}>
              <SectionHead
                eyebrow="Подарок с QR-кодом"
                title={
                  <>
                    Воспоминания, которые можно <em className={s.accent}>подарить</em>
                  </>
                }
                text="Положите QR-код в открытку, на торт или в коробку. Человек наводит камеру — и открывает страницу, собранную специально для него."
              />
              <ul className={s.points}>
                {GIFT_POINTS.map((p) => (
                  <li key={p}>
                    <Check size={16} strokeWidth={2.5} className={s.pointIcon} />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`btn btn-primary btn-lg ${s.giftCta}`}>
                Создать подарок <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <SectionHead eyebrow="Для любых событий" title="У каждого повода — своя история" />
          <div className={s.moments}>
            {MOMENTS.map((m) => (
              <Link key={m.key} href="/register" className={s.moment}>
                <span className={s.momentFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo(m.key, 520)} alt="" loading="lazy" decoding="async" className={s.momentPhoto} />
                </span>
                <span className={s.momentLabel}>{m.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={s.final}>
          <div className={s.finalCard}>
            <h2 className={`display ${s.finalTitle}`}>Начните с фотографий, которые уже есть в вашем телефоне</h2>
            <p className={s.finalText}>Первый коллаж займёт пару минут, регистрация — меньше минуты.</p>
            <Link href="/register" className={`btn btn-lg ${s.finalButton}`}>
              Создать аккаунт <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <Logo href="#top" />
          <p className={s.footerText}>Коллажи с историей · 2026</p>
        </div>
      </footer>
    </div>
  )
}
