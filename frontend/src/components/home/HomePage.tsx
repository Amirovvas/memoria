"use client"

import { ArrowRight, ArrowUpRight, LayoutTemplate, Sparkles } from "lucide-react"
import Link from "next/link"
import {
  CATEGORIES,
  CATEGORY_BY_SLUG,
  COLLECTIONS,
  EDITORS_TEMPLATES,
  POPULAR_TEMPLATES,
  TEMPLATE_BY_ID,
  TEMPLATES,
  templateDoc,
  templatesFor,
} from "@/src/lib/catalog"
import { LAYOUTS } from "@/src/lib/collage/layouts"
import { PALETTES, STYLES } from "@/src/lib/collage/styles"
import { photo } from "@/src/lib/photos"
import { CollageCanvas } from "../collage/CollageCanvas"
import { ProjectCard } from "../projects/ProjectCard"
import { useApp } from "../providers/AppProvider"
import { FavoriteButton, useOpenTemplate } from "../templates/TemplateCard"
import { TemplateGrid } from "../templates/TemplateGrid"
import { CategoryIcon, SectionHeader, plural } from "../ui/bits"
import s from "./HomePage.module.css"

const HERO_FAN = ["love-1", "travel-1", "travel-2"]
const FEATURED_CATEGORIES = ["travel", "love", "birthday", "friends", "memories"]

function SeeAll({ href, label = "Смотреть все" }: { href: string; label?: string }) {
  return (
    <Link href={href} className={s.seeAll}>
      {label}
      <ArrowRight size={15} className={s.seeAllArrow} />
    </Link>
  )
}

function Hero() {
  return (
    <section className={s.hero}>
      <div className={`animate-fade-up ${s.heroText}`}>
        <p className={`eyebrow ${s.heroEyebrow}`}>
          <span className={s.dot} /> Коллажи с историей
        </p>
        <h1 className={`display ${s.heroTitle}`}>
          Твои воспоминания.
          <br />
          Твоя история.
          <br />
          <em className={s.accent}>Твой коллаж.</em>
        </h1>
        <p className={s.heroLead}>Превращай любимые фотографии в красивые истории, которые хочется сохранить.</p>
        <div className={s.heroActions}>
          <Link href="/templates" className="btn btn-lg btn-accent">
            <LayoutTemplate size={18} /> Смотреть шаблоны
          </Link>
        </div>
        <dl className={s.stats}>
          {[
            [String(TEMPLATES.length), "шаблонов"],
            [String(CATEGORIES.length), "категорий"],
            [String(Object.keys(STYLES).length), "стилей"],
          ].map(([n, l]) => (
            <div key={l}>
              <dt className={`display ${s.statValue}`}>{n}</dt>
              <dd className={s.muted}>{l}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={s.fan} aria-hidden>
        {HERO_FAN.map((id, i) => {
          const t = TEMPLATE_BY_ID[id]
          return (
            <div
              key={id}
              className={`animate-float ${s.fanItem} ${[s.fan0, s.fan1, s.fan2][i]}`}
              style={{ animationDelay: `${i * -2.2}s` }}
            >
              <CollageCanvas doc={templateDoc(t)} imgWidth={520} />
            </div>
          )
        })}
        <div className={s.note}>лето в Италии ✶</div>
        <div className={s.pill}>
          <Sparkles size={14} className={s.accent} /> Фото разложены автоматически
        </div>
      </div>
    </section>
  )
}

function ContinueSection() {
  const { activeProjects } = useApp()
  const list = activeProjects.slice(0, 6)
  if (!list.length) return null
  return (
    <section className={s.sectionTight}>
      <SectionHeader eyebrow="Ваши проекты" title="Продолжить создание" action={<SeeAll href="/projects" label="Все проекты" />} />
      <div className={`scrollbar-none ${s.rail}`}>
        {list.map((p) => (
          <div key={p.id} className={s.railItem}>
            <ProjectCard project={p} compact />
          </div>
        ))}
      </div>
    </section>
  )
}

function CategoriesSection() {
  return (
    <section className={s.section}>
      <SectionHeader eyebrow="С чего начать" title="Популярные категории" action={<SeeAll href="/templates" label="Все категории" />} />
      <div className={s.categories}>
        {FEATURED_CATEGORIES.map((slug, i) => {
          const c = CATEGORY_BY_SLUG[slug]
          const n = templatesFor(slug).length
          const big = i === 0
          return (
            <Link key={slug} href={`/category/${slug}`} className={`${s.category} ${big ? s.categoryBig : s.categorySmall}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo(c.cover, big ? 1400 : 700)} alt="" loading="lazy" className={s.categoryImage} />
              <div className={s.categoryShade} />
              <div className={s.categoryBody}>
                <div>
                  <span className={s.categoryIcon}>
                    <CategoryIcon icon={c.icon} size={17} />
                  </span>
                  <h3 className={`display ${big ? s.categoryTitleBig : s.categoryTitle}`}>{c.short}</h3>
                  <p className={s.categoryCount}>
                    {n} {plural(n, "шаблон", "шаблона", "шаблонов")}
                  </p>
                </div>
                <span className={s.categoryArrow}>
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function EditorsSection() {
  const open = useOpenTemplate()
  const [lead, ...rest] = EDITORS_TEMPLATES
  return (
    <section className={s.section}>
      <SectionHeader eyebrow="Подборка редакции" title="Особенные композиции" />
      <div className={s.editors}>
        <article
          className={s.lead}
          style={{ background: PALETTES[lead.palette].bg, color: PALETTES[lead.palette].ink }}
          onClick={() => open(lead.id)}
        >
          <div className={s.leadText}>
            <span className={s.leadBadge}>
              <Sparkles size={11} /> Выбор редакции
            </span>
            <h3 className={`display ${s.leadTitle}`}>{lead.title}</h3>
            <p className={s.leadDescription}>
              {LAYOUTS[lead.layout].description}. Просто добавьте свои фото — композиция уже готова.
            </p>
            <div className={s.leadActions}>
              <button
                className={`btn ${s.leadButton}`}
                onClick={(e) => {
                  e.stopPropagation()
                  open(lead.id)
                }}
              >
                Использовать шаблон
              </button>
            </div>
          </div>
          <div className={s.leadArt}>
            <CollageCanvas doc={templateDoc(lead)} imgWidth={700} className={s.shadowFloat} />
          </div>
        </article>
        <div className={s.picks}>
          {rest.slice(0, 4).map((t) => (
            <article key={t.id} className={s.pick} onClick={() => open(t.id)}>
              <div className={s.pickFrame} style={{ background: PALETTES[t.palette].bg }}>
                <div className={s.pickInner} style={{ maxWidth: t.orientation === "landscape" ? "100%" : "78%" }}>
                  <CollageCanvas doc={templateDoc(t)} imgWidth={400} className={s.shadowCard} />
                </div>
              </div>
              <FavoriteButton id={t.id} className={s.pickFavorite} />
              <h3 className={s.pickTitle}>{t.title}</h3>
              <p className={s.pickSub}>
                {STYLES[t.style].name} · {t.slots} фото
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CollectionsSection() {
  return (
    <section className={s.section}>
      <SectionHeader eyebrow="Подборки" title="Коллекции для твоих воспоминаний" />
      <div className={s.collections}>
        {COLLECTIONS.slice(0, 4).map((c, ci) => {
          const items = c.templateIds.slice(0, 3).map((id) => TEMPLATE_BY_ID[id])
          const tint = ["#efe2cf", "#2a2520", "#f1dfd8", "#e4e8de"][ci % 4]
          const dark = ci === 1
          return (
            <Link key={c.id} href={`/templates?collection=${c.id}`} className={s.collection} style={{ background: tint }}>
              <div className={s.collectionStage}>
                {items.map((t, i) => (
                  <div
                    key={t.id}
                    className={s.collectionItem}
                    style={{
                      left: `${[8, 33, 58][i]}%`,
                      transform: `rotate(${[-8, 0, 8][i]}deg) translateY(${i === 1 ? -10 : 0}px)`,
                      zIndex: i === 1 ? 2 : 1,
                    }}
                  >
                    <CollageCanvas doc={templateDoc(t)} imgWidth={240} />
                  </div>
                ))}
              </div>
              <div className={`${s.collectionBody} ${dark ? s.collectionBodyDark : ""}`}>
                <h3 className={`display ${s.collectionTitle}`}>{c.title}</h3>
                <p className={s.collectionSub}>
                  {c.subtitle} · {c.templateIds.length}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div className={s.page}>
      <Hero />
      <ContinueSection />
      <CategoriesSection />
      <section className={s.section}>
        <SectionHeader eyebrow="Тренды недели" title="Популярные шаблоны" action={<SeeAll href="/templates" />} />
        <TemplateGrid templates={POPULAR_TEMPLATES.slice(0, 8)} showCategory />
      </section>
      <EditorsSection />
      <CollectionsSection />
    </div>
  )
}
