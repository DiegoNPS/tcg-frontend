import { cookies } from "next/headers";

import { InscripcionesList } from "@/components/jugador/inscripciones-list";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
import { requirePlayer } from "@/lib/auth/guards";

type EntryWithTorneo = {
  id: string;
  status: string;
  torneo: {
    id: string;
    titulo: string;
    fecha_inicio: string | null;
    tienda_nombre: string | null;
    ciudad: string | null;
    costo_entrada: number | null;
  } | null;
};

export default async function InscripcionesPage() {
  await requirePlayer();

  const baseUrl = await resolveServerApiBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let entries: EntryWithTorneo[] = [];
  let loadError = false;

  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/inscripciones/me?include=torneo`, {
        cache: "no-store",
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      });

      if (res.ok) {
        const { data } = (await res.json()) as { data: EntryWithTorneo[] | null };
        entries = data ?? [];
      } else {
        loadError = true;
      }
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }

  return (
    <main className="ui-shell flex flex-1 flex-col py-10">
      <header className="ui-card mb-6 rounded-lg p-5 sm:p-6">
        <p className="ui-eyebrow">Jugador</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Mis inscripciones</h1>
        <p className="text-sm text-zinc-600">Lista de tus inscripciones a torneos.</p>
      </header>

      <section className="ui-card rounded-lg p-5 sm:p-6">
        {loadError ? (
          <p className="ui-alert ui-alert-warning">
            No se pudieron cargar tus inscripciones en este momento. Intenta refrescar la pagina.
          </p>
        ) : entries.length > 0 ? (
          <InscripcionesList entries={entries} />
        ) : (
          <p className="text-sm text-zinc-600">Aun no tienes inscripciones.</p>
        )}
      </section>
    </main>
  );
}
