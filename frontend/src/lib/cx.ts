/** Joins class names, skipping falsy ones: cx(s.a, open && s.open). */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
