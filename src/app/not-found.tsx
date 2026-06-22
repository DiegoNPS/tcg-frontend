import Link from "next/link";

export default function NotFound() {
  return (
    <main className="ui-shell flex flex-1 items-center py-12">
      <section className="ui-card w-full rounded-lg p-6 sm:p-8">
        <p className="ui-eyebrow">404</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">No encontramos esta página</h1>
        <p className="mt-3 text-sm text-zinc-600">
          El enlace puede haber cambiado o el contenido ya no está disponible.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/torneos" className="ui-button-primary">Ver torneos</Link>
          <Link href="/" className="ui-button-ghost">Volver al inicio</Link>
        </div>
      </section>
    </main>
  );
}
