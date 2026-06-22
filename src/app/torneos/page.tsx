import { cookies } from "next/headers";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { TorneoCard } from "@/components/cards/torneo-card";
import { TorneosFilters } from "@/components/home/torneos-filters";
import { NoticeToast } from "@/components/ui/notice-toast";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
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
  ok: "Inscripción completada.",
  espera: "El torneo está completo. Quedaste en la lista de espera.",
  existente: "Ya estabas inscrito en este torneo.",
  error: "No se pudo completar la inscripción.",
  "no-jugador": "Solo jugadores pueden inscribirse a torneos.",
  "torneo-invalido": "El torneo solicitado no es válido.",
  "torneo-cerrado": "Las inscripciones de este torneo están cerradas.",
};

function resolveNoticeTone(code?: string) {
  switch (code) {
    case "ok":
      return "success";
    case "existente":
    case "espera":
    case "no-jugador":
      return "warning";
    case "torneo-invalido":
    case "torneo-cerrado":
      return "error";
    case "error":
      return "error";
    default:
      return "info";
  }
}

function getCurrentTimestamp() {
  return Date.now();
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

  const baseUrl = await resolveServerApiBaseUrl();

  if (!baseUrl) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Torneos TCG</h1>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configura BACKEND_URL para que la pagina pueda llamar a la API.
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

  const now = getCurrentTimestamp();
  const torneosConEstado = enrichedTorneos.map((torneo) => {
    const startsAt = new Date(torneo.fecha_inicio).getTime();
    const isPast = Number.isFinite(startsAt) && startsAt < now;

    return {
      ...torneo,
      isPast,
    };
  });
  const proximosTorneos = torneosConEstado.filter((torneo) => !torneo.isPast);
  const torneosFinalizados = torneosConEstado.filter((torneo) => torneo.isPast);
  const selectedGameLabel = juego
    ? gameOptions.find((option) => option.value === juego)?.label ?? juego
    : "Todos";

  const torneosInscritos = new Set<string>();
  let isAuthenticated = false;
  let userRole: "jugador" | "tienda" | "admin" | null = null;

  try {
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      cache: "no-store",
      headers: authHeaders,
    });

    if (meResponse.ok) {
      const { data } = (await meResponse.json()) as {
        data: { profile: { user_role: "jugador" | "tienda" | "admin" | null } | null };
      };
      isAuthenticated = true;
      userRole = data.profile?.user_role ?? null;
    }

    if (userRole === "jugador") {
      const entriesResponse = await fetch(`${baseUrl}/api/inscripciones/me`, {
        cache: "no-store",
        headers: authHeaders,
      });

      if (!entriesResponse.ok) throw new Error("entries-load-failed");

      const { data } = (await entriesResponse.json()) as { data: InscripcionEntry[] | null };
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
    <main className="flex flex-1 flex-col">
      <section className="border-b border-zinc-200">
        <div className="ui-shell py-7">
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-end">
            <div>
              <p className="ui-eyebrow">Eventos</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl">Torneos TCG</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Explora torneos publicados por tiendas, prioriza fechas próximas y revisa el historial sin mezclar eventos vencidos.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="ui-card-soft rounded-lg px-3 py-3">
                <p className="text-2xl font-black text-zinc-900">{proximosTorneos.length}</p>
                <p className="text-[11px] font-semibold uppercase text-zinc-500">Activos</p>
              </div>
              <div className="ui-card-soft rounded-lg px-3 py-3">
                <p className="text-2xl font-black text-zinc-900">{torneosFinalizados.length}</p>
                <p className="text-[11px] font-semibold uppercase text-zinc-500">Historial</p>
              </div>
              <div className="ui-card-soft rounded-lg px-3 py-3">
                <p className="text-2xl font-black text-zinc-900">{torneosConEstado.length}</p>
                <p className="text-[11px] font-semibold uppercase text-zinc-500">Total</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="ui-searchbar">
              <Search className="size-5 shrink-0 text-[var(--accent)]" />
              <span className="min-w-0 flex-1 text-sm font-medium sm:text-base">
                Filtra por juego, formato o ciudad para encontrar el evento correcto.
              </span>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              <span className="ui-chip ui-chip-active">
                <CalendarDays className="size-4" />
                Próximos primero
              </span>
              <span className="ui-chip">
                <MapPin className="size-4 text-[var(--accent)]" />
                {ciudad || "Todas las ciudades"}
              </span>
              <span className="ui-chip">{selectedGameLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="ui-shell flex flex-col gap-5 py-5">
        {inscripcionCode ? (
          <NoticeToast
            message={inscripcionMessages[inscripcionCode] ?? "Estado de inscripcion actualizado."}
            tone={resolveNoticeTone(inscripcionCode)}
          />
        ) : null}

        <TorneosFilters
          key={`${juego}:${categoria}:${ciudad}`}
          initialValues={{
            juego,
            categoria,
            ciudad,
          }}
          juegos={gameOptions}
        />

        {torneosLoadError ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
            No se pudieron cargar los torneos en este momento. Intenta refrescar la pagina.
          </section>
        ) : torneosConEstado.length ? (
          <div className="space-y-8">
            <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Próximos torneos</h2>
              </div>
              <span className="ui-badge ui-badge-accent">{proximosTorneos.length} activos</span>
            </div>

            {proximosTorneos.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {proximosTorneos.map((torneo) => (
                  <TorneoCard
                    key={torneo.id}
                    torneo={torneo}
                    canInscribirse={userRole === "jugador"}
                    isAuthenticated={isAuthenticated}
                    yaInscripto={torneosInscritos.has(torneo.id)}
                  />
                ))}
              </div>
            ) : (
              <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-900">No hay torneos próximos con esos filtros</h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Puedes revisar el historial o limpiar filtros para ampliar la búsqueda.
                </p>
              </section>
            )}
            </section>

            {torneosFinalizados.length ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-zinc-200 pt-6">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900">Torneos finalizados</h2>
                  </div>
                  <span className="ui-badge">{torneosFinalizados.length} pasados</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {torneosFinalizados.map((torneo) => (
                    <TorneoCard
                      key={torneo.id}
                      torneo={torneo}
                      canInscribirse={false}
                      isAuthenticated={isAuthenticated}
                      yaInscripto={torneosInscritos.has(torneo.id)}
                      isPast
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">No hay torneos con esos filtros</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Ajusta los filtros o vuelve mas tarde para ver nuevas publicaciones.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
