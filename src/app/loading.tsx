export default function Loading() {
  return (
    <main className="ui-shell flex flex-1 flex-col gap-5 py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando contenido...</span>
      <div className="ui-card animate-pulse rounded-lg p-6">
        <div className="h-3 w-24 rounded bg-[var(--line)]" />
        <div className="mt-4 h-9 w-full max-w-lg rounded bg-[var(--line)]" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-[var(--line)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="ui-card h-72 animate-pulse rounded-lg" />
        ))}
      </div>
    </main>
  );
}
