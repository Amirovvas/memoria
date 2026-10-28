"use client"

import { Check, ChevronDown } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { cx } from "@/src/lib/cx"
import s from "./Menu.module.css"

/** Small popover anchored to its trigger; closes on outside click and Escape. */
export function Popover({
  trigger,
  children,
  align = "left",
  className = "",
  open: controlledOpen,
  onOpenChange,
  side = "bottom",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: "left" | "right" | "center"
  side?: "bottom" | "top"
  className?: string
  open?: boolean
  onOpenChange?: (v: boolean) => void
}) {
  const [innerOpen, setInnerOpen] = useState(false)
  const open = controlledOpen ?? innerOpen
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setInnerOpen(v))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) (onOpenChange ?? setInnerOpen)(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (onOpenChange ?? setInnerOpen)(false)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onOpenChange])

  // A menu opening near the edge of the window flips to the other side instead of running off screen.
  const panelRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  useLayoutEffect(() => {
    if (!open || !ref.current || !panelRef.current) return setFlipped(false)
    const anchor = ref.current.getBoundingClientRect()
    const need = panelRef.current.offsetHeight + 12
    const below = window.innerHeight - anchor.bottom
    const above = anchor.top
    setFlipped(side === "bottom" ? below < need && above > below : above < need && below > above)
  }, [open, side])

  const close = () => setOpen(false)
  const pos = align === "right" ? s.alignRight : align === "center" ? s.alignCenter : s.alignLeft
  const top = (side === "top") !== flipped
  return (
    <div ref={ref} className={s.root}>
      {trigger({ open, toggle: () => setOpen(!open) })}
      {open ? (
        <div ref={panelRef} className={cx("animate-pop-in", s.panel, pos, top ? s.sideTop : s.sideBottom, className)}>
          {typeof children === "function" ? children(close) : children}
        </div>
      ) : null}
    </div>
  )
}

export function MenuItem({
  icon,
  children,
  onClick,
  danger,
  active,
}: {
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
  danger?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cx(s.item, danger && s.danger)}
    >
      {icon ? <span className={s.itemIcon}>{icon}</span> : null}
      <span className={s.itemLabel}>{children}</span>
      {active ? <Check size={15} className={s.check} /> : null}
    </button>
  )
}

export function SelectChip<T extends string>({
  label,
  value,
  options,
  onChange,
  allLabel = "Все",
}: {
  label: string
  value: T | null
  options: { value: T; label: string; swatch?: string }[]
  onChange: (v: T | null) => void
  allLabel?: string
}) {
  const current = options.find((o) => o.value === value)
  return (
    <Popover
      trigger={({ toggle, open }) => (
        <button className="chip" data-active={value ? "true" : undefined} onClick={toggle} aria-expanded={open}>
          {current?.swatch ? <span className={s.swatch} style={{ background: current.swatch }} /> : null}
          <span className={value ? "" : s.muted}>{label}:</span>
          <span>{current?.label ?? allLabel}</span>
          <ChevronDown size={14} className={cx(s.chevron, open && s.chevronOpen)} />
        </button>
      )}
    >
      {(close) => (
        <div className={s.list}>
          <MenuItem
            active={!value}
            onClick={() => {
              onChange(null)
              close()
            }}
          >
            {allLabel}
          </MenuItem>
          {options.map((o) => (
            <MenuItem
              key={o.value}
              active={o.value === value}
              icon={o.swatch ? <span className={cx(s.swatch, s.swatchLg)} style={{ background: o.swatch }} /> : undefined}
              onClick={() => {
                onChange(o.value)
                close()
              }}
            >
              {o.label}
            </MenuItem>
          ))}
        </div>
      )}
    </Popover>
  )
}
