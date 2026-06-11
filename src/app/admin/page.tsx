import Link from "next/link";
import { cookies } from "next/headers";

import { AdminGameForm } from "@/components/forms/admin-game-form";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
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
    <article className="ui-card rounded-lg p-5">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
    </article>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  const baseUrl = await resolveServerApiBaseUrl();
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
      <main className="ui-shell flex flex-1 flex-col py-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Panel de administración</h1>
        <p className="ui-alert ui-alert-warning mt-3">
          Configura `SUPABASE_SERVICE_ROLE` para cargar métricas y usuarios del sistema.
        </p>
      </main>
    );
  }

  if (loadError || !payload) {
    return (
      <main className="ui-shell flex flex-1 flex-col py-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Panel de administración</h1>
        <p className="ui-alert ui-alert-danger mt-3">
          No se pudo cargar el panel de administración. Intenta refrescar.
        </p>
      </main>
    );
  }

  const { counts, juegos, recentUsers, recentTorneos, recentStores } = payload;

  return (
    <main className="ui-shell flex flex-1 flex-col gap-8 py-10">
      <header className="ui-card rounded-lg p-5 sm:p-6">
        <div>
          <p className="ui-eyebrow">Administración</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Panel de control</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Supervisa usuarios, tiendas, torneos e inscripciones. Este panel consume la API admin del backend.
          </p>
        </div>
        <div className="mt-5">
          <Link href="/admin" className="ui-button-primary">
            Refrescar panel
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Usuarios" value={counts.profiles} description="Perfiles registrados en `profiles`" />
        <StatCard label="Tiendas" value={counts.tiendas} description="Tiendas creadas por usuarios" />
        <StatCard label="Torneos" value={counts.torneos} description="Eventos creados en la plataforma" />
        <StatCard label="Inscripciones" value={counts.entries} description="Entradas registradas en torneos" />
        <StatCard label="Juegos" value={counts.juegos} description="Catálogo disponible para torneos" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="ui-card overflow-hidden rounded-lg">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Catálogo de juegos</h2>
          </div>
          <div className="space-y-4 px-4 py-4">
            <AdminGameForm actionLabel="Crear juego" />
            <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200">
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

        <article className="ui-card overflow-hidden rounded-lg">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Usuarios recientes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentUsers.length ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{user.email ?? "Sin correo"}</p>
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
        <article className="ui-card overflow-hidden rounded-lg">
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

        <article className="ui-card overflow-hidden rounded-lg">
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

      <section className="ui-card overflow-hidden rounded-lg">
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
