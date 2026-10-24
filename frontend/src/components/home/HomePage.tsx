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

const HERO_FAN = ["love-1", "travel-1", "travel-2"]
const FEATURED_CATEGORIES = ["travel", "love", "birthday", "friends", "memories"]

function SeeAll({ href, label = "Смотреть все" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
      {label}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

function Hero() {
  return (
    <section className="relative grid items-center gap-8 pb-6 pt-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] @4xl:gap-6 @4xl:pt-10">
      <div className="animate-fade-up relative z-10 max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-accent" /> Коллажи с историей
        </p>
        {/* sized by the content width (cqi), so the sidebar never leaves it a cramped column */}
        <h1 className="display mt-5 text-[clamp(42px,9cqi,68px)] @4xl:text-[clamp(56px,6.4cqi,84px)]">
          Твои воспоминания.
          <br />
          Твоя история.
          <br />
          <em className="text-accent">Твой коллаж.</em>
        </h1>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted">
          Превращай любимые фотографии в красивые истории, которые хочется сохранить.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/templates" className="btn btn-lg btn-accent">
            <LayoutTemplate size={18} /> Смотреть шаблоны
          </Link>
        </div>
        <dl className="mt-10 flex gap-8 text-sm">
          {[
            [String(TEMPLATES.length), "шаблонов"],
            [String(CATEGORIES.length), "категорий"],
            [String(Object.keys(STYLES).length), "стилей"],
          ].map(([n, l]) => (
            <div key={l}>
              <dt className="display text-3xl">{n}</dt>
              <dd className="text-muted">{l}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mx-auto h-[340px] w-full max-w-[560px] @xl:h-[460px] @4xl:h-[540px]" aria-hidden>
        {HERO_FAN.map((id, i) => {
          const t = TEMPLATE_BY_ID[id]
          const pos = [
            "left-[2%] top-[14%] w-[42%] [--r:-8deg]",
            "left-1/2 top-0 z-10 w-[50%] -translate-x-1/2 [--r:1deg]",
            "right-[2%] top-[18%] w-[42%] [--r:7deg]",
          ][i]
          return (
            <div
              key={id}
              className={`animate-float absolute overflow-hidden rounded-xl shadow-float ring-1 ring-black/5 ${pos}`}
              style={{ animationDelay: `${i * -2.2}s` }}
            >
              <CollageCanvas doc={templateDoc(t)} imgWidth={520} />
            </div>
          )
        })}
        <div className="absolute bottom-[11%] left-[4%] z-20 -rotate-6 rounded-sm bg-[#fdf7e6] px-3 py-2 font-hand text-xl text-[#5a4632] shadow-card @xl:px-4 @xl:py-2.5 @xl:text-2xl">
          лето в Италии ✶
        </div>
        {/* lower than the note so the two never overlap; hidden where there is no room beside it */}
        <div className="absolute bottom-[1%] right-[2%] z-20 hidden rotate-3 items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-[13px] font-semibold shadow-card ring-1 ring-line @xl:flex">
          <Sparkles size={14} className="text-accent" /> Фото разложены автоматически
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
    <section className="mt-16">
      <SectionHeader eyebrow="Ваши проекты" title="Продолжить создание" action={<SeeAll href="/projects" label="Все проекты" />} />
      {/* scroll-px keeps snapped cards off the screen edge */}
      <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-10 lg:scroll-px-10 lg:px-10 @6xl:mx-0 @6xl:grid @6xl:grid-cols-6 @6xl:overflow-visible @6xl:px-0">
        {list.map((p) => (
          <div key={p.id} className="w-[200px] shrink-0 snap-start sm:w-[220px] @6xl:w-auto">
            <ProjectCard project={p} compact />
          </div>
        ))}
      </div>
    </section>
  )
}

function CategoriesSection() {
  return (
    <section className="mt-20">
      <SectionHeader eyebrow="С чего начать" title="Популярные категории" action={<SeeAll href="/templates" label="Все категории" />} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 @4xl:grid-cols-4 @4xl:grid-rows-2">
        {FEATURED_CATEGORIES.map((slug, i) => {
          const c = CATEGORY_BY_SLUG[slug]
          const n = templatesFor(slug).length
          const big = i === 0
          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className={`group relative overflow-hidden rounded-[22px] bg-surface-2 ${
                big ? "col-span-2 aspect-[16/11] @xl:aspect-[2/1] @4xl:row-span-2 @4xl:aspect-auto" : "aspect-[4/5] @xl:aspect-[5/4]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo(c.cover, big ? 1400 : 700)}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-6">
                <div>
                  <span className="mb-3 grid size-9 place-items-center rounded-full bg-white/20 backdrop-blur">
                    <CategoryIcon icon={c.icon} size={17} />
                  </span>
                  <h3 className={`display ${big ? "text-4xl @xl:text-5xl" : "text-[22px] leading-[1.05] @xl:text-3xl"}`}>{c.short}</h3>
                  <p className="mt-1 text-[13px] text-white/80">
                    {n} {plural(n, "шаблон", "шаблона", "шаблонов")}
                  </p>
                </div>
                <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-white text-[#1f1b16] opacity-0 transition-all duration-300 group-hover:opacity-100 @4xl:grid">
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
    <section className="mt-20">
      <SectionHeader eyebrow="Подборка редакции" title="Особенные композиции" />
      <div className="grid gap-4 @5xl:grid-cols-[1.2fr_1fr] @5xl:gap-6">
        <article
          className="group relative grid cursor-pointer items-center gap-6 overflow-hidden rounded-[28px] p-6 @2xl:grid-cols-[1fr_1.1fr] @2xl:p-10"
          style={{ background: PALETTES[lead.palette].bg, color: PALETTES[lead.palette].ink }}
          onClick={() => open(lead.id)}
        >
          <div className="order-2 @2xl:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-semibold text-white">
              <Sparkles size={11} /> Выбор редакции
            </span>
            <h3 className="display mt-5 text-4xl @2xl:text-5xl">{lead.title}</h3>
            <p className="mt-3 max-w-xs text-[15px] leading-relaxed opacity-70">
              {LAYOUTS[lead.layout].description}. Просто добавьте свои фото — композиция уже готова.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                className="btn bg-[#1f1b16] text-white hover:bg-black"
                onClick={(e) => {
                  e.stopPropagation()
                  open(lead.id)
                }}
              >
                Использовать шаблон
              </button>
            </div>
          </div>
          <div className="order-1 mx-auto w-full max-w-[340px] rotate-2 transition-transform duration-500 group-hover:rotate-0 @2xl:order-2">
            <CollageCanvas doc={templateDoc(lead)} imgWidth={700} className="shadow-float" />
          </div>
        </article>
        <div className="grid grid-cols-2 gap-4 @5xl:gap-6">
          {rest.slice(0, 4).map((t) => (
            <article key={t.id} className="group relative cursor-pointer" onClick={() => open(t.id)}>
              <div
                className="flex aspect-square items-center justify-center overflow-hidden rounded-[22px] p-[12%] transition-transform duration-300 group-hover:-translate-y-1"
                style={{ background: PALETTES[t.palette].bg }}
              >
                <div className="w-full" style={{ maxWidth: t.orientation === "landscape" ? "100%" : "78%" }}>
                  <CollageCanvas doc={templateDoc(t)} imgWidth={400} className="shadow-card" />
                </div>
              </div>
              <FavoriteButton id={t.id} size="size-8" className="absolute right-3 top-3" />
              <h3 className="mt-3 truncate text-[15px] font-semibold">{t.title}</h3>
              <p className="text-[13px] text-muted">
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
    <section className="mt-20">
      <SectionHeader eyebrow="Подборки" title="Коллекции для твоих воспоминаний" />
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
        {COLLECTIONS.slice(0, 4).map((c, ci) => {
          const items = c.templateIds.slice(0, 3).map((id) => TEMPLATE_BY_ID[id])
          const tint = ["#efe2cf", "#2a2520", "#f1dfd8", "#e4e8de"][ci % 4]
          const dark = ci === 1
          return (
            <Link
              key={c.id}
              href={`/templates?collection=${c.id}`}
              className="group overflow-hidden rounded-[22px] ring-1 ring-line transition-shadow hover:shadow-card"
              style={{ background: tint }}
            >
              <div className="relative h-52">
                {items.map((t, i) => (
                  <div
                    key={t.id}
                    className="absolute top-8 w-[34%] overflow-hidden rounded-md shadow-card transition-transform duration-500"
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
              <div className={`relative px-5 pb-5 ${dark ? "text-[#f2ece3]" : "text-[#1f1b16]"}`}>
                <h3 className="display text-2xl">{c.title}</h3>
                <p className={`mt-1 text-[13px] ${dark ? "text-white/60" : "text-black/55"}`}>
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
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
      <Hero />
      <ContinueSection />
      <CategoriesSection />
      <section className="mt-20">
        <SectionHeader eyebrow="Тренды недели" title="Популярные шаблоны" action={<SeeAll href="/templates" />} />
        <TemplateGrid templates={POPULAR_TEMPLATES.slice(0, 8)} showCategory />
      </section>
      <EditorsSection />
      <CollectionsSection />
    </div>
  )
}
