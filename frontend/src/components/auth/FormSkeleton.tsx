/** Shown while the form waits for the URL's ?next= on a full page load. */
export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div aria-hidden>
      <div className="skeleton h-3 w-28 rounded-full" />
      <div className="skeleton mt-4 h-12 w-4/5 rounded-2xl" />
      <div className="skeleton mt-4 h-4 w-full rounded-full" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i}>
            <div className="skeleton mb-2 h-3 w-16 rounded-full" />
            <div className="skeleton h-12 rounded-full" />
          </div>
        ))}
      </div>
      <div className="skeleton mt-7 h-12 rounded-full" />
    </div>
  )
}
