import Link from "next/link";
import { cookies, headers } from "next/headers";

import { requirePlayer } from "@/lib/auth/guards";

type MePayload = {
  user: { id: string; email: string | null };
  profile: {
    display_name: string | null;
    user_role: string | null;
    created_at: string | null;
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

export default async function PerfilJugadorPage() {
  await requirePlayer();

  const baseUrl = await resolveBaseUrl();
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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <p className="text-sm font-medium text-zinc-500">Jugador</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mi perfil</h1>
        <p className="text-sm text-zinc-600">Revisa tu información de cuenta y accesos.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
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

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Acciones rápidas</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/jugador/inscripciones"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Ver mis inscripciones
          </Link>
          <Link
            href="/torneos"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Buscar torneos
          </Link>
        </div>
      </section>
    </main>
  );
}
