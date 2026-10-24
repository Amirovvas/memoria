"use client"

import { ChevronRight, Search, SearchX, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CATEGORIES, CATEGORY_BY_SLUG, TEMPLATES, templateDoc, type Collection, type Template } from "@/src/lib/catalog"
import { LAYOUTS } from "@/src/lib/collage/layouts"
import { STYLES } from "@/src/lib/collage/styles"
import type { StyleKey } from "@/src/lib/collage/types"
import { photo } from "@/src/lib/photos"
import { CollageCanvas } from "../collage/CollageCanvas"
import { CategoryIcon, EmptyArt, EmptyState, plural } from "../ui/bits"
import { SelectChip } from "../ui/Menu"
import { TemplateGrid } from "./TemplateGrid"

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
    <section className="relative overflow-hidden rounded-[28px] bg-[#211c17]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo(c.cover, 1800)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-[#1b1611]/45" />
      <div className="relative grid min-h-[280px] items-end gap-6 p-6 sm:p-10 @4xl:grid-cols-[1fr_auto]">
        <div className="max-w-xl text-white">
          <nav className="mb-6 flex items-center gap-1.5 text-[13px] text-white/70" aria-label="Хлебные крошки">
            <Link href="/templates" className="hover:text-white">
              Шаблоны
            </Link>
            <ChevronRight size={13} />
            <span className="text-white">{c.name}</span>
          </nav>
          <span className="mb-4 inline-grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur">
            <CategoryIcon icon={c.icon} size={20} />
          </span>
          <h1 className="display text-5xl sm:text-6xl">{c.name}</h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">{c.description}</p>
          <p className="mt-5 text-[13px] font-semibold text-white/70">
            {count} {plural(count, "шаблон", "шаблона", "шаблонов")} · {styles} {plural(styles, "стиль", "стиля", "стилей")}
          </p>
        </div>
        {fan.length >= 3 ? (
          <div className="relative hidden h-[230px] w-[330px] @4xl:block" aria-hidden>
            {fan.map((t, i) => (
              <div
                key={t.id}
                className="absolute bottom-0 w-[150px] overflow-hidden rounded-lg shadow-float ring-1 ring-white/20 transition-transform duration-500 hover:-translate-y-2"
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
  const [loading, setLoading] = useState(true)
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

  // A short skeleton between filter changes makes the grid feel like it is fetching real results.
  const key = [q, style, count, sort].join("|")
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 380)
    return () => clearTimeout(t)
  }, [key])

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
    <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 md:pt-2 lg:px-10">
      {category ? (
        <CategoryHero slug={category} count={base.length} />
      ) : collection ? (
        <section className="pb-2 pt-4">
          <nav className="mb-3 flex items-center gap-1.5 text-[13px] text-muted" aria-label="Хлебные крошки">
            <Link href="/templates" className="hover:text-ink">
              Шаблоны
            </Link>
            <ChevronRight size={13} />
            <span className="text-ink">Коллекция</span>
          </nav>
          <h1 className="display text-5xl sm:text-6xl">{collection.title}</h1>
          <p className="mt-3 max-w-xl text-[15px] text-muted">
            {collection.subtitle} · {base.length} {plural(base.length, "шаблон", "шаблона", "шаблонов")}
          </p>
        </section>
      ) : (
        <section className="pb-2 pt-4">
          <p className="eyebrow">Библиотека</p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">Все шаблоны</h1>
          <p className="mt-3 max-w-xl text-[15px] text-muted">
            {TEMPLATES.length} композиций в {CATEGORIES.length} категориях — от плёночных лент до журнальных разворотов.
          </p>
          <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="chip">
                <CategoryIcon icon={c.icon} size={14} className="text-muted" />
                {c.short}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* toolbar */}
      <div className="sticky top-16 z-20 -mx-4 mt-6 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-[72px] lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          {/* own row on phones, so the filter and sort chips never squeeze it */}
          <div className="relative w-full min-w-0 sm:w-auto sm:max-w-xs sm:flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={category ? `Искать в «${CATEGORY_BY_SLUG[category].short}»` : "Искать шаблоны"}
              className="input pl-10"
              aria-label="Поиск шаблонов"
            />
          </div>
          <button className="chip md:hidden" data-active={activeCount ? "true" : undefined} onClick={() => setFiltersOpen((v) => !v)}>
            <SlidersHorizontal size={14} /> Фильтры{activeCount ? ` · ${activeCount}` : ""}
          </button>
          <div className="hidden flex-wrap gap-2 md:flex">{filters}</div>
          <div className="ml-auto hidden items-center rounded-full border border-line bg-surface p-1 sm:flex" role="tablist" aria-label="Сортировка">
            {SORTS.map((s) => (
              <button
                key={s.value}
                role="tab"
                aria-selected={sort === s.value}
                onClick={() => setSort(s.value)}
                className={`h-8 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
                  sort === s.value ? "bg-ink text-bg" : "text-muted hover:text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="ml-auto sm:hidden">
            <SelectChip label="Сортировка" value={sort} onChange={(v) => setSort(v ?? "popular")} options={SORTS} allLabel="Популярные" />
          </div>
        </div>
        {filtersOpen ? <div className="animate-fade-in mt-3 flex flex-wrap gap-2 md:hidden">{filters}</div> : null}
      </div>

      <div className="flex items-center justify-between py-5 text-sm text-muted">
        <span>
          {loading ? "Подбираем шаблоны…" : `${list.length} ${plural(list.length, "шаблон", "шаблона", "шаблонов")}`}
        </span>
        {activeCount || q ? (
          <button onClick={reset} className="flex items-center gap-1 font-semibold text-ink hover:text-accent">
            <X size={14} /> Сбросить фильтры
          </button>
        ) : null}
      </div>

      {!loading && list.length === 0 ? (
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
        <TemplateGrid templates={list} loading={loading} showCategory={!category} />
      )}
    </div>
  )
}
