"use client"

import { Check, ChevronDown } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

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

  const close = () => setOpen(false)
  const pos = align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen(!open) })}
      {open ? (
        <div
          className={`animate-pop-in absolute z-50 min-w-48 rounded-2xl border border-line bg-surface p-1.5 shadow-card ${pos} ${
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } ${className}`}
        >
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
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-surface-2 ${
        danger ? "text-accent" : "text-ink"
      }`}
    >
      {icon ? <span className="text-muted [&>svg]:size-4">{icon}</span> : null}
      <span className="flex-1">{children}</span>
      {active ? <Check size={15} className="text-accent" /> : null}
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
          {current?.swatch ? <span className="size-3 rounded-full border border-black/10" style={{ background: current.swatch }} /> : null}
          <span className={value ? "" : "text-muted"}>{label}:</span>
          <span>{current?.label ?? allLabel}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    >
      {(close) => (
        <div className="max-h-72 overflow-auto">
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
              icon={o.swatch ? <span className="block size-4 rounded-full border border-black/10" style={{ background: o.swatch }} /> : undefined}
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
