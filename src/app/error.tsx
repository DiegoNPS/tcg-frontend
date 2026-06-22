"use client";

import { RotateCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="ui-shell flex flex-1 items-center py-12">
      <section className="ui-card w-full rounded-lg p-6 sm:p-8" role="alert">
        <p className="ui-eyebrow">Error inesperado</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">No pudimos cargar esta pantalla</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Tus datos no se han modificado. Puedes intentar cargar la vista nuevamente.
        </p>
        <button type="button" onClick={reset} className="ui-button-primary mt-6">
          <RotateCcw className="size-4" />
          Reintentar
        </button>
      </section>
    </main>
  );
}
