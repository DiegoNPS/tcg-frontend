import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

import { TorneoForm } from "@/components/forms/torneo-form";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
import { LOGIN_PATH } from "@/lib/auth/routes";
import type { CategoriaTorneo, TcgJuego } from "@/types/database.types";

type EditarTorneoPageProps = {
  params: Promise<{ id: string }>;
};

type TorneoEditPayload = {
  id: string;
  titulo: string;
  descripcion: string;
  direccion: string;
  fecha_inicio: string;
  cupo_maximo: number;
  costo_entrada: number;
  publicado: boolean;
  latitud: number | null;
  longitud: number | null;
  imagen_url: string | null;
  tcg_juego: string | null;
  categoria: string | null;
};

export default async function EditarTorneoPage({ params }: EditarTorneoPageProps) {
  const { id } = await params;

  const baseUrl = await resolveServerApiBaseUrl();
  if (!baseUrl) notFound();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${baseUrl}/api/tiendas/me/torneos/${id}`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (res.status === 401) redirect(LOGIN_PATH);
  if (res.status === 403 || res.status === 404) notFound();
  if (!res.ok) notFound();

  const { data: torneo } = (await res.json()) as { data: TorneoEditPayload };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Editar torneo</h1>
        <p className="text-sm text-zinc-600">{torneo.titulo}</p>
      </header>

      <TorneoForm
        mode="edit"
        defaults={{
          id,
          titulo: torneo.titulo,
          descripcion: torneo.descripcion,
          tcg_juego: (torneo.tcg_juego as TcgJuego) ?? undefined,
          categoria: (torneo.categoria as CategoriaTorneo) ?? undefined,
          direccion: torneo.direccion,
          fecha_inicio: torneo.fecha_inicio,
          cupo_maximo: torneo.cupo_maximo,
          costo_entrada: torneo.costo_entrada,
          publicado: torneo.publicado,
          latitud: torneo.latitud,
          longitud: torneo.longitud,
          imagen_url: torneo.imagen_url,
        }}
      />
    </main>
  );
}
