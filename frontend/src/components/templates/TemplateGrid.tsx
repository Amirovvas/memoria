"use client"

import { useDeferredValue, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react"
import type { Template } from "@/src/lib/catalog"
import { FORMATS } from "@/src/lib/collage/styles"
import { TemplateCard } from "./TemplateCard"
import s from "./TemplateGrid.module.css"

/** Cards drawn straight away; the rest of a long list is rendered in the background. */
const FIRST_SCREEN = 12
/** Title and caption under a card, as a share of the column width. */
const META_HEIGHT = 0.3

/** The column count the stylesheet picks for the current width (--columns in TemplateGrid.module.css). */
function useColumns(ref: RefObject<HTMLDivElement | null>) {
  const [columns, setColumns] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current!
    const read = () => setColumns(Number(getComputedStyle(el).getPropertyValue("--columns")) || 2)
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return columns
}

/**
 * Each card goes to the shortest column. Heights are known from the collage format, so the first row
 * holds the first templates of the list, and appending more never moves the cards already placed.
 */
function place(templates: Template[], columns: number) {
  const out = Array.from({ length: columns }, () => [] as Template[])
  const heights = new Array<number>(columns).fill(0)
  for (const t of templates) {
    const i = heights.indexOf(Math.min(...heights))
    out[i].push(t)
    heights[i] += 1 / FORMATS[t.format].ratio + META_HEIGHT
  }
  return out
}

/** Pinterest-like masonry of template cards; a click opens the template in the editor. */
export function TemplateGrid({ templates, showCategory }: { templates: Template[]; showCategory?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const columns = useColumns(ref)
  // the first screen shows at once; a new list (a filter, a search) replaces the old one when it is ready
  const firstScreen = useMemo(() => templates.slice(0, FIRST_SCREEN), [templates])
  const shown = useDeferredValue(templates, firstScreen)
  const stacks = useMemo(() => (columns ? place(shown, columns) : []), [shown, columns])

  return (
    <div ref={ref} className={s.grid}>
      {stacks.map((stack, i) => (
        <div key={i} className={s.column}>
          {stack.map((t) => (
            <div key={t.id} className={s.item}>
              <TemplateCard template={t} showCategory={showCategory} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
