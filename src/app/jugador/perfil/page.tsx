import Link from "next/link";
import { cookies } from "next/headers";

import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
import { requirePlayer } from "@/lib/auth/guards";

type MePayload = {
  user: { id: string; email: string | null };
  profile: {
    display_name: string | null;
    user_role: string | null;
    created_at: string | null;
  } | null;
};

export default async function PerfilJugadorPage() {
  await requirePlayer();

  const baseUrl = await resolveServerApiBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let me: MePayload | null = null;

  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        cache: "no-store",
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      });
      if (res.ok) {
        const { data } = (await res.json()) as { data: MePayload };
        me = data;
      }
    } catch {
      // se muestra estado vacío abajo
    }
  }

  const user = me?.user ?? null;
  const profile = me?.profile ?? null;

  return (
    <main className="ui-shell flex flex-1 flex-col gap-6 py-10">
      <header className="ui-card rounded-lg p-5 sm:p-6">
        <p className="ui-eyebrow">Jugador</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Mi perfil</h1>
        <p className="text-sm text-zinc-600">Revisa tu información de cuenta y accesos.</p>
      </header>

      <section className="ui-card rounded-lg p-5 sm:p-6">
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-zinc-500">Nombre visible</p>
            <p className="font-medium text-zinc-900">{profile?.display_name ?? "Sin definir"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Correo</p>
            <p className="font-medium text-zinc-900">{user?.email ?? "Sin correo"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Rol</p>
            <p className="font-medium text-zinc-900">{profile?.user_role ?? "jugador"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Miembro desde</p>
            <p className="font-medium text-zinc-900">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES") : "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="ui-card rounded-lg p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Acciones rápidas</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/jugador/inscripciones"
            className="ui-button-primary"
          >
            Ver mis inscripciones
          </Link>
          <Link
            href="/torneos"
            className="ui-button-ghost"
          >
            Buscar torneos
          </Link>
        </div>
      </section>
    </main>
  );
}
