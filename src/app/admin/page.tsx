import Link from "next/link";
import { cookies, headers } from "next/headers";

import { AdminGameForm } from "@/components/forms/admin-game-form";
import { requireAdmin } from "@/lib/auth/guards";

type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
};

type DashboardPayload = {
  counts: {
    profiles: number;
    tiendas: number;
    torneos: number;
    entries: number;
    juegos: number;
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
  }[];
  recentTorneos: {
    id: string;
    titulo: string;
    publicado: boolean;
    fecha_inicio: string;
    tienda_id: string;
  }[];
  recentStores: {
    id: string;
    nombre: string;
    ciudad_id: string | null;
    owner_id: string;
  }[];
};

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
    </article>
  );
}

async function resolveBaseUrl(): Promise<string | null> {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function AdminPage() {
  await requireAdmin();

  const baseUrl = await resolveBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let payload: DashboardPayload | null = null;
  let missingServiceRole = false;
  let loadError = false;

  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
        cache: "no-store",
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      });

      if (res.ok) {
        const { data } = (await res.json()) as { data: DashboardPayload };
        payload = data;
      } else if (res.status === 503) {
        const body = (await res.json()) as { code?: string };
        if (body.code === "missing-service-role") {
          missingServiceRole = true;
        } else {
          loadError = true;
        }
      } else {
        loadError = true;
      }
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }

  if (missingServiceRole) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Panel de administración</h1>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configura `SUPABASE_SERVICE_ROLE` para cargar métricas y usuarios del sistema.
        </p>
      </main>
    );
  }

  if (loadError || !payload) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Panel de administración</h1>
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          No se pudo cargar el panel de administración. Intenta refrescar.
        </p>
      </main>
    );
  }

  const { counts, juegos, recentUsers, recentTorneos, recentStores } = payload;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Administración</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Panel de control</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Supervisa usuarios, tiendas, torneos e inscripciones. Este panel consume la API admin del backend.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Refrescar panel
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Usuarios" value={counts.profiles} description="Perfiles registrados en `profiles`" />
        <StatCard label="Tiendas" value={counts.tiendas} description="Tiendas creadas por usuarios" />
        <StatCard label="Torneos" value={counts.torneos} description="Eventos creados en la plataforma" />
        <StatCard label="Inscripciones" value={counts.entries} description="Entradas registradas en torneos" />
        <StatCard label="Juegos" value={counts.juegos} description="Catálogo disponible para torneos" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Catálogo de juegos</h2>
          </div>
          <div className="space-y-4 px-4 py-4">
            <AdminGameForm actionLabel="Crear juego" />
            <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200">
              {juegos.length ? (
                juegos.map((juego) => (
                  <div key={juego.id} className="px-4 py-3 text-sm">
                    <p className="font-medium text-zinc-900">{juego.nombre}</p>
                    <p className="text-zinc-600">{juego.key}{juego.descripcion ? ` · ${juego.descripcion}` : ""}</p>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-zinc-600">Todavía no hay juegos cargados.</p>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Usuarios recientes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentUsers.length ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{user.email ?? "Sin email"}</p>
                    <p className="text-zinc-600">{user.created_at ? new Date(user.created_at).toLocaleString("es-ES") : "Sin fecha"}</p>
                  </div>
                  <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {user.email_confirmed_at ? "Confirmado" : "Pendiente"}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-600">No hay usuarios para mostrar.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Torneos recientes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentTorneos.length ? (
              recentTorneos.map((torneo) => {
                const tienda = recentStores.find((t) => t.id === torneo.tienda_id);
                return (
                  <div key={torneo.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-zinc-900">{torneo.titulo}</p>
                      <p className="text-zinc-600">{tienda?.nombre ?? "Tienda independiente"} · {new Date(torneo.fecha_inicio).toLocaleString("es-ES")}</p>
                    </div>
                    <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {torneo.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-600">No hay torneos para mostrar.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Tiendas recientes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentStores.length ? (
              recentStores.map((tienda) => (
                <div key={tienda.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-zinc-900">{tienda.nombre}</p>
                  <p className="text-zinc-600">{tienda.ciudad_id ?? "-"}</p>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-600">No hay tiendas para mostrar.</p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Acciones recomendadas</h2>
        </div>
        <div className="space-y-3 px-4 py-4 text-sm text-zinc-700">
          <p>• Revisar usuarios nuevos y asignarles `jugador`, `tienda` o `admin`.</p>
          <p>• Verificar torneos borrador antes de publicarlos.</p>
          <p>• Monitorear inscripciones y detectar duplicados o abuso.</p>
          <p>• Auditar tiendas inactivas o sin torneos publicados.</p>
        </div>
      </section>
    </main>
  );
}
