/** Skeleton shown instantly while an admin page checks the session and loads data. */
export function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <div className="h-7 w-48 animate-pulse rounded bg-line" />
      <div className="mt-2 h-4 w-28 animate-pulse rounded bg-line" />
      <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-white">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="flex items-center gap-4 p-3 sm:p-4">
            <div className="aspect-[4/3] w-20 shrink-0 animate-pulse rounded-md bg-paper sm:w-28" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 animate-pulse rounded bg-paper" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-paper" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
