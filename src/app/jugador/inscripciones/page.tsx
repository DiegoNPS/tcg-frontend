import { cookies, headers } from "next/headers";

import { InscripcionesList } from "@/components/jugador/inscripciones-list";
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

async function resolveBaseUrl(): Promise<string | null> {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function InscripcionesPage() {
  await requirePlayer();

  const baseUrl = await resolveBaseUrl();
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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
      <header className="mb-6">
        <p className="text-sm font-medium text-zinc-500">Jugador</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mis inscripciones</h1>
        <p className="text-sm text-zinc-600">Lista de tus inscripciones a torneos.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {loadError ? (
          <p className="text-sm text-amber-800">
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
