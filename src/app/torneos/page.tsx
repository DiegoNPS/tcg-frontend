import { cookies, headers } from "next/headers";

import { TorneoCard } from "@/components/cards/torneo-card";
import { TorneosFilters } from "@/components/home/torneos-filters";
import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";
import type { CategoriaTorneo } from "@/types/database.types";

type TorneosPageProps = {
  searchParams: Promise<{
    juego?: string | string[];
    categoria?: string | string[];
    ciudad?: string | string[];
    inscripcion?: string | string[];
  }>;
};

type JuegoOption = { value: string; label: string };

type TorneoApiItem = {
  id: string;
  tienda_id: string;
  titulo: string;
  descripcion: string;
  direccion: string;
  fecha_inicio: string;
  cupo_maximo: number;
  costo_entrada: number;
  imagen_url: string | null;
  latitud: number | null;
  longitud: number | null;
  tienda_nombre: string | null;
  tcg_juego: string | null;
  categoria: string | null;
  ciudad: string | null;
};

type InscripcionEntry = {
  id: string;
  torneo_id: string;
  status: string;
  entry_type: string;
};

function getSingleParam(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

const validCategorias = new Set<CategoriaTorneo>(
  CATEGORIA_OPTIONS.map((option) => option.value),
);

function isCategoriaTorneo(value: string): value is CategoriaTorneo {
  return validCategorias.has(value as CategoriaTorneo);
}

const inscripcionMessages: Record<string, string> = {
  ok: "Inscripcion completada.",
  existente: "Ya estabas inscrito en este torneo.",
  error: "No se pudo completar la inscripcion.",
  "no-jugador": "Solo jugadores pueden inscribirse a torneos.",
  "torneo-invalido": "El torneo solicitado no es valido.",
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

export default async function TorneosPage({ searchParams }: TorneosPageProps) {
  const params = await searchParams;

  const juegoRaw = getSingleParam(params.juego);
  const categoriaRaw = getSingleParam(params.categoria);
  const ciudadRaw = getSingleParam(params.ciudad);
  const inscripcionCode = getSingleParam(params.inscripcion);

  const categoria: CategoriaTorneo | "" =
    categoriaRaw && isCategoriaTorneo(categoriaRaw) ? categoriaRaw : "";
  const ciudad = ciudadRaw?.trim() ?? "";

  const baseUrl = await resolveBaseUrl();

  if (!baseUrl) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Torneos TCG</h1>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configura NEXT_PUBLIC_APP_URL para que la pagina pueda llamar a la API.
        </p>
      </main>
    );
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const authHeaders: HeadersInit | undefined = cookieHeader
    ? { Cookie: cookieHeader }
    : undefined;

  let gameOptions: JuegoOption[] = TCG_OPTIONS;
  try {
    const res = await fetch(`${baseUrl}/api/lookups/juegos`, {
      cache: "no-store",
    });
    if (res.ok) {
      const { data } = (await res.json()) as {
        data: { key: string; nombre: string }[] | null;
      };
      if (data && data.length > 0) {
        gameOptions = data.map((juego) => ({
          value: juego.key,
          label: juego.nombre,
        }));
      }
    }
  } catch {}

  const validJuegos = new Set(gameOptions.map((option) => option.value));
  const juego: string = juegoRaw && validJuegos.has(juegoRaw) ? juegoRaw : "";

  const torneosQuery = new URLSearchParams();
  if (juego) torneosQuery.set("juego", juego);
  if (categoria) torneosQuery.set("categoria", categoria);
  if (ciudad) torneosQuery.set("ciudad", ciudad);

  let torneosApi: TorneoApiItem[] = [];
  let torneosLoadError = false;

  try {
    const res = await fetch(
      `${baseUrl}/api/torneos${torneosQuery.size ? `?${torneosQuery.toString()}` : ""}`,
      { cache: "no-store" },
    );

    if (res.ok) {
      const { data } = (await res.json()) as { data: TorneoApiItem[] | null };
      torneosApi = data ?? [];
    } else {
      torneosLoadError = true;
    }
  } catch {
    torneosLoadError = true;
  }

  const enrichedTorneos = torneosApi.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    descripcion: t.descripcion,
    direccion: t.direccion,
    fecha_inicio: t.fecha_inicio,
    cupo_maximo: t.cupo_maximo,
    costo_entrada: t.costo_entrada,
    imagen_url: t.imagen_url,
    latitud: t.latitud,
    longitud: t.longitud,
    tcg_juego: t.tcg_juego ?? "otro",
    categoria: t.categoria ?? "casual",
    ciudad: t.ciudad ?? "",
    tiendaNombre: t.tienda_nombre ?? "Tienda independiente",
  }));

  const torneosInscritos = new Set<string>();
  let userLoggedIn = false;

  try {
    const res = await fetch(`${baseUrl}/api/inscripciones/me`, {
      cache: "no-store",
      headers: authHeaders,
    });

    if (res.ok) {
      userLoggedIn = true;
      const { data } = (await res.json()) as { data: InscripcionEntry[] | null };
      (data ?? []).forEach((entry) => {
        if (
          entry.entry_type === "solo" &&
          entry.status !== "dropped" &&
          entry.status !== "eliminated"
        ) {
          torneosInscritos.add(entry.torneo_id);
        }
      });
    }
  } catch {}

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Calendario publico
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Torneos TCG</h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Descubre eventos de Pokemon, Yu-Gi-Oh!, Magic y mas. Filtra por juego y ciudad para encontrar tu proxima fecha.
        </p>
      </header>

      {inscripcionCode ? (
        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
          {inscripcionMessages[inscripcionCode] ?? "Estado de inscripcion actualizado."}
        </p>
      ) : null}

      <TorneosFilters
        initialValues={{
          juego,
          categoria,
          ciudad,
        }}
        juegos={gameOptions}
      />

      {torneosLoadError ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
          No se pudieron cargar los torneos en este momento. Intenta refrescar la pagina.
        </section>
      ) : enrichedTorneos.length ? (
        <section className="grid gap-4 sm:grid-cols-3">
          {enrichedTorneos.map((torneo) => (
            <TorneoCard
              key={torneo.id}
              torneo={torneo}
              canInscribirse={userLoggedIn}
              yaInscripto={torneosInscritos.has(torneo.id)}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">No hay torneos con esos filtros</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Ajusta los filtros o vuelve mas tarde para ver nuevas publicaciones.
          </p>
        </section>
      )}
    </main>
  );
}
