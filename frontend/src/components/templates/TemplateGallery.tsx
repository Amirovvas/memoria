"use client"

import { ChevronRight, Search, SearchX, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { CATEGORIES, CATEGORY_BY_SLUG, TEMPLATES, templateDoc, type Collection, type Template } from "@/src/lib/catalog"
import { LAYOUTS } from "@/src/lib/collage/layouts"
import { STYLES } from "@/src/lib/collage/styles"
import type { StyleKey } from "@/src/lib/collage/types"
import { photo } from "@/src/lib/photos"
import { CollageCanvas } from "../collage/CollageCanvas"
import { CategoryIcon, EmptyArt, EmptyState, plural } from "../ui/bits"
import { SelectChip } from "../ui/Menu"
import { TemplateGrid } from "./TemplateGrid"
import s from "./TemplateGallery.module.css"

type Sort = "popular" | "new"
type Count = "few" | "mid" | "many"

const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Популярные" },
  { value: "new", label: "Новые" },
]

const COUNTS: { value: Count; label: string; test: (n: number) => boolean }[] = [
  { value: "few", label: "1–3 фото", test: (n) => n <= 3 },
  { value: "mid", label: "4–6 фото", test: (n) => n >= 4 && n <= 6 },
  { value: "many", label: "7 и больше", test: (n) => n >= 7 },
]

function matches(t: Template, q: string) {
  if (!q) return true
  const hay = [t.title, t.texts.title, STYLES[t.style].name, LAYOUTS[t.layout].name, CATEGORY_BY_SLUG[t.category].name]
    .join(" ")
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w))
}

function CategoryHero({ slug, count }: { slug: string; count: number }) {
  const c = CATEGORY_BY_SLUG[slug]
  const fan = TEMPLATES.filter((t) => t.category === slug).slice(0, 3)
  const styles = new Set(TEMPLATES.filter((t) => t.category === slug).map((t) => t.style)).size

  return (
    <section className={s.hero}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo(c.cover, 1800)} alt="" className={s.heroImage} />
      <div className={s.heroShade} />
      <div className={s.heroBody}>
        <div className={s.heroText}>
          <nav className={s.heroCrumbs} aria-label="Хлебные крошки">
            <Link href="/templates">Шаблоны</Link>
            <ChevronRight size={13} />
            <span className={s.heroCurrent}>{c.name}</span>
          </nav>
          <span className={s.heroIcon}>
            <CategoryIcon icon={c.icon} size={20} />
          </span>
          <h1 className={`display ${s.title}`}>{c.name}</h1>
          <p className={s.heroDescription}>{c.description}</p>
          <p className={s.heroStats}>
            {count} {plural(count, "шаблон", "шаблона", "шаблонов")} · {styles} {plural(styles, "стиль", "стиля", "стилей")}
          </p>
        </div>
        {fan.length >= 3 ? (
          <div className={s.fan} aria-hidden>
            {fan.map((t, i) => (
              <div
                key={t.id}
                className={s.fanCard}
                style={{ left: i * 90, transform: `rotate(${[-7, 2, 9][i]}deg)`, zIndex: i === 1 ? 2 : 1 }}
              >
                <CollageCanvas doc={templateDoc(t)} imgWidth={300} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function TemplateGallery({
  category,
  collection,
  initialQuery = "",
}: {
  category?: string
  collection?: Collection
  initialQuery?: string
}) {
  const [q, setQ] = useState(initialQuery)
  const [style, setStyle] = useState<StyleKey | null>(null)
  const [count, setCount] = useState<Count | null>(null)
  const [sort, setSort] = useState<Sort>("popular")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const base = useMemo(() => {
    if (collection) return TEMPLATES.filter((t) => collection.templateIds.includes(t.id))
    return category ? TEMPLATES.filter((t) => t.category === category) : TEMPLATES
  }, [category, collection])

  const list = useMemo(() => {
    const out = base.filter(
      (t) =>
        matches(t, q.trim()) &&
        (!style || t.style === style) &&
        (!count || COUNTS.find((c) => c.value === count)!.test(t.slots)),
    )
    return out.sort((a, b) => (sort === "new" ? b.order - a.order : b.uses - a.uses))
  }, [base, q, style, count, sort])

  const activeCount = [style, count].filter(Boolean).length
  const reset = () => {
    setStyle(null)
    setCount(null)
    setQ("")
  }

  const filters = (
    <>
      <SelectChip
        label="Стиль"
        value={style}
        onChange={setStyle}
        options={(Object.keys(STYLES) as StyleKey[]).map((k) => ({ value: k, label: STYLES[k].name }))}
      />
      <SelectChip label="Фото" value={count} onChange={setCount} options={COUNTS.map(({ value, label }) => ({ value, label }))} />
    </>
  )

  return (
    <div className={s.page}>
      {category ? (
        <CategoryHero slug={category} count={base.length} />
      ) : collection ? (
        <section className={s.intro}>
          <nav className={s.crumbs} aria-label="Хлебные крошки">
            <Link href="/templates">Шаблоны</Link>
            <ChevronRight size={13} />
            <span className={s.crumbsCurrent}>Коллекция</span>
          </nav>
          <h1 className={`display ${s.title}`}>{collection.title}</h1>
          <p className={s.lead}>
            {collection.subtitle} · {base.length} {plural(base.length, "шаблон", "шаблона", "шаблонов")}
          </p>
        </section>
      ) : (
        <section className={s.intro}>
          <p className="eyebrow">Библиотека</p>
          <h1 className={`display ${s.title} ${s.libraryTitle}`}>Все шаблоны</h1>
          <p className={s.lead}>
            {TEMPLATES.length} композиций в {CATEGORIES.length} категориях — от плёночных лент до журнальных разворотов.
          </p>
          <div className={`scrollbar-none ${s.categories}`}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="chip">
                <CategoryIcon icon={c.icon} size={14} className={s.muted} />
                {c.short}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className={s.toolbar}>
        <div className={s.toolbarRow}>
          <div className={s.search}>
            <Search size={16} className={s.searchIcon} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={category ? `Искать в «${CATEGORY_BY_SLUG[category].short}»` : "Искать шаблоны"}
              className={`input ${s.searchInput}`}
              aria-label="Поиск шаблонов"
            />
          </div>
          <button className={`chip ${s.filtersToggle}`} data-active={activeCount ? "true" : undefined} onClick={() => setFiltersOpen((v) => !v)}>
            <SlidersHorizontal size={14} /> Фильтры{activeCount ? ` · ${activeCount}` : ""}
          </button>
          <div className={s.filters}>{filters}</div>
          <div className={s.sortTabs} role="tablist" aria-label="Сортировка">
            {SORTS.map((o) => (
              <button key={o.value} role="tab" aria-selected={sort === o.value} onClick={() => setSort(o.value)} className={s.sortTab}>
                {o.label}
              </button>
            ))}
          </div>
          <div className={s.sortMobile}>
            <SelectChip label="Сортировка" value={sort} onChange={(v) => setSort(v ?? "popular")} options={SORTS} allLabel="Популярные" />
          </div>
        </div>
        {filtersOpen ? <div className={`animate-fade-in ${s.filtersOpen}`}>{filters}</div> : null}
      </div>

      <div className={s.summary}>
        <span>
          {list.length} {plural(list.length, "шаблон", "шаблона", "шаблонов")}
        </span>
        {activeCount || q ? (
          <button onClick={reset} className={s.reset}>
            <X size={14} /> Сбросить фильтры
          </button>
        ) : null}
      </div>

      {list.length === 0 ? (
        <EmptyState
          art={<EmptyArt icon={<SearchX size={26} />} />}
          title="Ничего не нашлось"
          text="Попробуйте другое слово или ослабьте фильтры — например, уберите формат или палитру."
          action={
            <button className="btn btn-primary" onClick={reset}>
              Сбросить фильтры
            </button>
          }
        />
      ) : (
        <TemplateGrid templates={list} showCategory={!category} />
      )}
    </div>
  )
}
