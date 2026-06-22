import Link from "next/link";
import { Pencil } from "lucide-react";
import { cookies } from "next/headers";

import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

type DashboardPageProps = {
  searchParams: Promise<{ created?: string; updated?: string; store?: string; error?: string }>;
};

type TiendaPayload = { id: string; nombre: string; ciudad: string | null };

type TorneoPayload = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  publicado: boolean;
  tcg_juego: string | null;
  categoria: string | null;
  ciudad: string | null;
};

const errorMessages: Record<string, string> = {
  "sin-tienda":
    "Tu cuenta no tiene una tienda asociada. Crea un registro en la tabla tiendas para desbloquear el panel.",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  await requireAuthenticatedUser("/tienda/dashboard");

  const baseUrl = await resolveServerApiBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const authHeaders: HeadersInit | undefined = cookieHeader
    ? { Cookie: cookieHeader }
    : undefined;

  let tienda: TiendaPayload | null = null;
  let torneos: TorneoPayload[] = [];
  let tiendaLoadError = false;
  let torneosLoadError = false;

  if (baseUrl) {
    try {
      const [tiendaRes, torneosRes] = await Promise.all([
        fetch(`${baseUrl}/api/tiendas/me`, {
          cache: "no-store",
          headers: authHeaders,
        }),
        fetch(`${baseUrl}/api/tiendas/me/torneos`, {
          cache: "no-store",
          headers: authHeaders,
        }),
      ]);

      if (tiendaRes.ok) {
        const { data } = (await tiendaRes.json()) as { data: TiendaPayload | null };
        tienda = data;
      } else {
        tiendaLoadError = true;
      }
      if (torneosRes.ok) {
        const { data } = (await torneosRes.json()) as { data: TorneoPayload[] | null };
        torneos = data ?? [];
      } else {
        torneosLoadError = true;
      }
    } catch {
      tiendaLoadError = true;
      torneosLoadError = true;
    }
  } else {
    tiendaLoadError = true;
    torneosLoadError = true;
  }

  const errorMessage = params.error ? errorMessages[params.error] : null;

  if (tiendaLoadError) {
    return (
      <main className="ui-shell flex flex-1 flex-col py-10">
        <h1 className="text-2xl font-bold text-zinc-900">Panel de tienda</h1>
        <p className="ui-alert ui-alert-danger mt-3" role="alert">
          No se pudo cargar tu tienda. Intenta nuevamente en unos minutos.
        </p>
      </main>
    );
  }

  if (!tienda) {
    return (
      <main className="ui-shell flex flex-1 flex-col py-10">
        <h1 className="text-2xl font-bold text-zinc-900">Panel de tienda</h1>
        <p className="ui-alert ui-alert-warning mt-3">
          Tu usuario aun no esta vinculado a una tienda. Crea una ahora para desbloquear el panel.
        </p>
        <div className="mt-4">
          <a
            href="/tienda/crear"
            className="ui-button-primary"
          >
            Crear tienda
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="ui-shell flex flex-1 flex-col gap-6 py-10">
      <header className="ui-card flex flex-wrap items-end justify-between gap-3 rounded-lg p-5 sm:p-6">
        <div>
          <p className="ui-eyebrow">Panel de tienda</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{tienda.nombre}</h1>
          <p className="text-sm text-zinc-600">{tienda.ciudad}</p>
        </div>
        <Link
          href="/tienda/nuevo-torneo"
          className="ui-button-primary"
        >
          Publicar nuevo torneo
        </Link>
      </header>

      {params.created === "1" ? (
        <p className="ui-alert ui-alert-success">
          Torneo creado correctamente.
        </p>
      ) : null}

      {params.store === "created" ? (
        <p className="ui-alert ui-alert-success">
          Tienda creada correctamente.
        </p>
      ) : null}

      {params.updated === "1" ? (
        <p className="ui-alert ui-alert-success">
          Torneo actualizado correctamente.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="ui-alert ui-alert-danger">
          {errorMessage}
        </p>
      ) : null}

      {torneosLoadError ? (
        <p className="ui-alert ui-alert-warning" role="alert">
          La tienda cargó correctamente, pero no pudimos obtener sus torneos.
        </p>
      ) : null}

      <section className="ui-card overflow-hidden rounded-lg">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Torneos publicados</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {torneos.length ? (
            torneos.map((torneo) => (
              <article key={torneo.id} className="flex flex-col gap-1 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-zinc-900">{torneo.titulo}</p>
                  <p className="text-zinc-600">{torneo.tcg_juego} / {torneo.categoria} / {torneo.ciudad}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-zinc-500">{new Date(torneo.fecha_inicio).toLocaleString("es-ES")}</p>
                  <Link
                    href={`/tienda/torneos/${torneo.id}/editar`}
                    className="ui-button-ghost min-h-0 px-2.5 py-1.5 text-xs"
                  >
                    <Pencil size={12} />
                    Editar
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-zinc-600">Aun no has publicado torneos.</p>
          )}
        </div>
      </section>
    </main>
  );
}
