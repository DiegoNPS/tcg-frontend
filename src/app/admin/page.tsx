import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Gamepad2,
  RefreshCw,
  ShieldCheck,
  Store,
  Ticket,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import {
  AdminRoleControl,
  PublishTournamentButton,
} from "@/components/admin/admin-actions";
import { AdminGameForm } from "@/components/forms/admin-game-form";
import { DeleteTorneoButton } from "@/components/torneos/delete-torneo-button";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
import { requireAdmin } from "@/lib/auth/guards";

type UserRole = "jugador" | "tienda" | "admin";

type TournamentItem = {
  id: string;
  titulo: string;
  publicado: boolean;
  fecha_inicio: string;
  tienda_id: string;
  tienda_nombre: string;
  ciudad: string | null;
};

type DashboardPayload = {
  generatedAt: string;
  counts: {
    profiles: number;
    tiendas: number;
    torneos: number;
    entries: number;
    juegos: number;
  };
  attention: {
    draftTournaments: number;
    profilesWithoutRole: number;
  };
  juegos: {
    id: string;
    key: string;
    nombre: string;
    descripcion: string | null;
    created_at: string;
  }[];
  recentUsers: {
    id: string;
    email: string | null;
    created_at: string | null;
    email_confirmed_at: string | null;
    role: UserRole | null;
  }[];
  recentTorneos: TournamentItem[];
  draftTournaments: TournamentItem[];
  recentStores: {
    id: string;
    nombre: string;
    ciudad: string | null;
    owner_id: string;
    created_at: string;
  }[];
};

type Metric = {
  label: string;
  value: number;
  Icon: LucideIcon;
};

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
});

const numberFormatter = new Intl.NumberFormat("es-CL");

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : "Sin fecha";
}

function ErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="ui-shell flex flex-1 flex-col py-10">
      <section className="ui-card mx-auto w-full max-w-2xl rounded-lg p-6">
        <AlertTriangle className="size-6 text-amber-300" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">{message}</p>
        <Link href="/admin" className="ui-button-secondary mt-5">
          <RefreshCw className="size-4" aria-hidden="true" />
          Reintentar
        </Link>
      </section>
    </main>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  const baseUrl = await resolveServerApiBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let payload: DashboardPayload | null = null;
  let missingServiceRole = false;

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/api/admin/dashboard`, {
        cache: "no-store",
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      });

      if (response.ok) {
        const body = (await response.json()) as { data: DashboardPayload };
        payload = body.data;
      } else if (response.status === 503) {
        const body = (await response.json()) as { code?: string };
        missingServiceRole = body.code === "missing-service-role";
      }
    } catch {
      payload = null;
    }
  }

  if (missingServiceRole) {
    return (
      <ErrorState
        title="Configuración administrativa incompleta"
        message="El panel no puede acceder a los datos protegidos. Revisa la configuración segura del servidor antes de continuar."
      />
    );
  }

  if (!payload) {
    return (
      <ErrorState
        title="No pudimos cargar el centro de operaciones"
        message="Los datos permanecen seguros. Reintenta la carga y, si el problema continúa, revisa el estado de la API administrativa."
      />
    );
  }

  const {
    counts,
    attention,
    juegos,
    recentUsers,
    recentTorneos,
    draftTournaments,
    recentStores,
  } = payload;
  const attentionTotal = attention.draftTournaments + attention.profilesWithoutRole;
  const metrics: Metric[] = [
    { label: "Usuarios", value: counts.profiles, Icon: Users },
    { label: "Tiendas", value: counts.tiendas, Icon: Store },
    { label: "Torneos", value: counts.torneos, Icon: Ticket },
    { label: "Inscripciones", value: counts.entries, Icon: UserRound },
    { label: "Juegos", value: counts.juegos, Icon: Gamepad2 },
  ];

  return (
    <main className="ui-shell flex flex-1 flex-col gap-6 py-8 sm:py-10">
      <header className="flex flex-col gap-5 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Centro de operaciones</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">Administración</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Resuelve pendientes, revisa actividad y mantén el catálogo listo para la próxima ronda.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Actualizado {formatDate(payload.generatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="ui-button-secondary">
            <RefreshCw className="size-4" aria-hidden="true" />
            Actualizar
          </Link>
          <Link href="/tienda/nuevo-torneo" className="ui-button-primary">
            Publicar evento
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="ui-card overflow-hidden rounded-lg" aria-label="Resumen de la plataforma">
        <dl className="grid grid-cols-2 lg:grid-cols-5">
          {metrics.map(({ label, value, Icon }, index) => (
            <div
              key={label}
              className={`min-w-0 p-4 sm:p-5 ${
                index < metrics.length - 1 ? "border-b border-zinc-200 lg:border-b-0 lg:border-r" : ""
              }`}
            >
              <dt className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                {numberFormatter.format(value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ui-card overflow-hidden rounded-lg" aria-labelledby="pending-title">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              {attentionTotal > 0 ? (
                <AlertTriangle className="size-5 text-amber-300" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-5 text-emerald-300" aria-hidden="true" />
              )}
              <h2 id="pending-title" className="text-lg font-semibold text-zinc-900">
                Trabajo pendiente
              </h2>
            </div>
            <p className="mt-1 text-sm text-zinc-600">
              {attentionTotal > 0
                ? `${numberFormatter.format(attentionTotal)} elementos requieren atención.`
                : "No hay pendientes críticos en este momento."}
            </p>
          </div>
          {attentionTotal > 0 ? (
            <span className="ui-badge ui-badge-warning">{attentionTotal} pendientes</span>
          ) : (
            <span className="ui-badge ui-badge-success">Al día</span>
          )}
        </div>

        <div className="grid xl:grid-cols-2">
          <article className="min-w-0 px-4 py-5 sm:px-5 xl:border-r xl:border-zinc-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-zinc-900">Borradores de torneo</h3>
                <p className="mt-1 text-sm text-zinc-600">Revisa y publica los eventos listos.</p>
              </div>
              <span className="ui-badge">{attention.draftTournaments}</span>
            </div>

            {draftTournaments.length ? (
              <ul className="mt-4 divide-y divide-zinc-100" aria-label="Torneos en borrador">
                {draftTournaments.map((tournament) => (
                  <li key={tournament.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">{tournament.titulo}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {tournament.tienda_nombre} · {formatDate(tournament.fecha_inicio)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                      <PublishTournamentButton tournamentId={tournament.id} />
                      <DeleteTorneoButton
                        endpoint={`/api/admin/torneos/${tournament.id}`}
                        title={tournament.titulo}
                        compact
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-lg bg-[rgba(52,211,153,0.08)] px-4 py-5 text-sm text-emerald-100">
                No hay borradores esperando publicación.
              </div>
            )}
          </article>

          <article className="min-w-0 border-t border-zinc-200 px-4 py-5 sm:px-5 xl:border-t-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-zinc-900">Usuarios recientes</h3>
                <p className="mt-1 text-sm text-zinc-600">Confirma su estado y asigna el rol correcto.</p>
              </div>
              {attention.profilesWithoutRole > 0 ? (
                <span className="ui-badge ui-badge-warning">
                  {attention.profilesWithoutRole} sin rol
                </span>
              ) : null}
            </div>

            {recentUsers.length ? (
              <ul className="mt-4 divide-y divide-zinc-100" aria-label="Usuarios recientes">
                {recentUsers.map((user) => (
                  <li key={user.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-all font-medium text-zinc-900">{user.email ?? "Correo no disponible"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                        <span className={user.email_confirmed_at ? "ui-badge ui-badge-success" : "ui-badge ui-badge-warning"}>
                          {user.email_confirmed_at ? "Correo confirmado" : "Correo pendiente"}
                        </span>
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                    <AdminRoleControl userId={user.id} initialRole={user.role} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">No hay usuarios recientes para revisar.</p>
            )}
          </article>
        </div>
      </section>

      <section className="ui-card overflow-hidden rounded-lg" aria-labelledby="activity-title">
        <div className="border-b border-zinc-200 px-4 py-4 sm:px-5">
          <h2 id="activity-title" className="text-lg font-semibold text-zinc-900">Actividad reciente</h2>
          <p className="mt-1 text-sm text-zinc-600">Una lectura rápida de eventos y nuevas tiendas.</p>
        </div>

        <div className="grid lg:grid-cols-2">
          <article className="min-w-0 px-4 py-4 sm:px-5 lg:border-r lg:border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-700">Últimos torneos</h3>
            {recentTorneos.length ? (
              <ul className="mt-3 divide-y divide-zinc-100">
                {recentTorneos.map((tournament) => (
                <li key={tournament.id} className="flex min-w-0 items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">{tournament.titulo}</p>
                    <p className="mt-1 truncate text-zinc-600">
                      {tournament.tienda_nombre} · {formatDate(tournament.fecha_inicio)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-start justify-end gap-2">
                    <span className={tournament.publicado ? "ui-badge ui-badge-success" : "ui-badge ui-badge-warning"}>
                      {tournament.publicado ? "Publicado" : "Borrador"}
                    </span>
                    <DeleteTorneoButton
                      endpoint={`/api/admin/torneos/${tournament.id}`}
                      title={tournament.titulo}
                      compact
                    />
                  </div>
                </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">Aún no hay actividad de torneos.</p>
            )}
          </article>

          <article className="min-w-0 border-t border-zinc-200 px-4 py-4 sm:px-5 lg:border-t-0">
            <h3 className="text-sm font-semibold text-zinc-700">Nuevas tiendas</h3>
            {recentStores.length ? (
              <ul className="mt-3 divide-y divide-zinc-100">
                {recentStores.map((storeItem) => (
                <li key={storeItem.id} className="flex min-w-0 items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">{storeItem.nombre}</p>
                    <p className="mt-1 text-zinc-600">{storeItem.ciudad ?? "Ciudad no informada"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">{formatDate(storeItem.created_at)}</span>
                </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">Aún no hay tiendas recientes.</p>
            )}
          </article>
        </div>
      </section>

      <details className="ui-card group overflow-hidden rounded-lg">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 sm:px-5">
          <span>
            <span className="block font-semibold text-zinc-900">Catálogo de juegos</span>
            <span className="mt-1 block text-sm text-zinc-600">
              {juegos.length} juegos disponibles · administración ocasional
            </span>
          </span>
          <ChevronDown className="size-5 text-zinc-500 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>

        <div className="grid gap-6 border-t border-zinc-200 px-4 py-5 sm:px-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
          <div>
            <h2 className="font-semibold text-zinc-900">Agregar un juego</h2>
            <p className="mt-1 mb-4 text-sm text-zinc-600">Úsalo cuando la plataforma incorpore un nuevo TCG.</p>
            <AdminGameForm actionLabel="Agregar al catálogo" embedded />
          </div>

          <div className="min-w-0 xl:border-l xl:border-zinc-200 xl:pl-6">
            <h2 className="font-semibold text-zinc-900">Juegos activos</h2>
            {juegos.length ? (
              <ul className="mt-3 divide-y divide-zinc-100">
                {juegos.map((game) => (
                  <li key={game.id} className="py-3 text-sm">
                    <p className="font-medium text-zinc-900">{game.nombre}</p>
                    <p className="mt-1 break-words text-zinc-600">
                      <code className="font-mono text-xs text-zinc-500">{game.key}</code>
                      {game.descripcion ? ` · ${game.descripcion}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">Aún no hay juegos en el catálogo.</p>
            )}
          </div>
        </div>
      </details>

      <p className="flex items-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="size-4" aria-hidden="true" />
        Las acciones administrativas quedan protegidas y registradas por el servidor.
      </p>
    </main>
  );
}
