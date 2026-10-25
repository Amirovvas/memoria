import s from "./FormSkeleton.module.css"

/** Shown while the form waits for the URL's ?next= on a full page load. */
export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div aria-hidden>
      <div className={`skeleton ${s.eyebrow}`} />
      <div className={`skeleton ${s.title}`} />
      <div className={`skeleton ${s.lead}`} />
      <div className={s.fields}>
        {Array.from({ length: fields }, (_, i) => (
          <div key={i}>
            <div className={`skeleton ${s.label}`} />
            <div className={`skeleton ${s.input}`} />
          </div>
        ))}
      </div>
      <div className={`skeleton ${s.submit}`} />
    </div>
  )
}
