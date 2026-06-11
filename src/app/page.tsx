import { ArrowRight, CalendarClock, CalendarDays, MapPin, Search, Sparkles, Store, Trophy, UserRound, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GameCarousel } from "@/components/home/game-carousel";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
import { TCG_OPTIONS } from "@/lib/constants";

type TorneoApiItem = {
  id: string;
  titulo: string;
  direccion: string;
  fecha_inicio: string;
  cupo_maximo: number;
  costo_entrada: number;
  imagen_url?: string | null;
  tienda_nombre: string | null;
  tcg_juego: string | null;
  categoria: string | null;
  ciudad: string | null;
};

async function fetchUpcomingTorneos() {
  const baseUrl = await resolveServerApiBaseUrl();
  if (!baseUrl) return [] as TorneoApiItem[];

  try {
    const res = await fetch(`${baseUrl}/api/torneos`, { cache: "no-store" });
    if (!res.ok) return [];

    const { data } = (await res.json()) as { data: TorneoApiItem[] | null };
    const now = Date.now();
    const upcoming = (data ?? []).filter((torneo) => {
      const startsAt = new Date(torneo.fecha_inicio).getTime();
      return Number.isFinite(startsAt) && startsAt >= now;
    });

    return upcoming.slice(0, 5);
  } catch {
    return [];
  }
}

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const quickLinks: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Publicar evento", href: "/tienda/nuevo-torneo", Icon: Store },
  { label: "Panel de tienda", href: "/tienda/dashboard", Icon: Trophy },
  { label: "Mis inscripciones", href: "/jugador/inscripciones", Icon: UserRound },
];

const gameLabelByValue = new Map<string, string>(TCG_OPTIONS.map((option) => [option.value, option.label]));

export default async function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const storageBase = supabaseUrl
    ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/tcg`
    : "";
  const upcomingTorneos = await fetchUpcomingTorneos();
  const gameCounts = new Map<string, number>();
  upcomingTorneos.forEach((torneo) => {
    if (torneo.tcg_juego) {
      gameCounts.set(torneo.tcg_juego, (gameCounts.get(torneo.tcg_juego) ?? 0) + 1);
    }
  });

  return (
    <main className="flex w-full flex-1 flex-col">
      <section className="ui-section-line border-b border-zinc-200">
        <div className="ui-shell py-7 sm:py-9">
          <div className="max-w-3xl">
            <Image
              src="/brand/tcg-tournaments-logo-crop.png"
              alt="TCG Tournaments"
              width={280}
              height={124}
              className="mb-5 h-auto w-52 sm:w-64"
              priority
            />
            <p className="ui-eyebrow inline-flex items-center gap-2">
              <Sparkles className="size-3.5 text-[var(--accent-alt)]" />
              Eventos TCG en Chile
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl">
              Encuentra tu próximo torneo.
            </h1>
          </div>

          <div className="mt-7 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-center">
            <Link href="/torneos" className="ui-searchbar max-w-3xl">
              <Search className="size-5 shrink-0 text-[var(--accent)]" />
              <span className="min-w-0 flex-1 text-sm font-medium sm:text-base">Buscar eventos, juegos o comunas...</span>
              <kbd className="hidden rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-500 sm:inline-flex">/</kbd>
            </Link>

            <div className="grid min-w-0 grid-cols-3 gap-2 text-center">
              <div className="ui-card-soft rounded-lg px-3 py-3">
                <p className="text-xl font-black text-zinc-900">{upcomingTorneos.length}</p>
                <p className="text-[11px] font-semibold uppercase text-zinc-500">Próximos</p>
              </div>
              <div className="ui-card-soft rounded-lg px-3 py-3">
                <p className="text-xl font-black text-zinc-900">{TCG_OPTIONS.length}</p>
                <p className="text-[11px] font-semibold uppercase text-zinc-500">Juegos</p>
              </div>
              <div className="ui-card-soft rounded-lg px-3 py-3">
                <p className="text-xl font-black text-zinc-900">24/7</p>
                <p className="text-[11px] font-semibold uppercase text-zinc-500">Activo</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ui-eyebrow w-16">Dónde</span>
              <Link href="/torneos?ciudad=Santiago" className="ui-chip">
                <MapPin className="size-4 text-[var(--accent)]" />
                Santiago, Chile
              </Link>
              <span className="ui-chip ui-chip-active">Próximos primero</span>
              <Link href="/torneos" className="ui-chip">Calendario completo</Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="ui-eyebrow w-16">Juego</span>
              <Link href="/torneos" className="ui-chip ui-chip-active">Todos</Link>
              {TCG_OPTIONS.slice(0, 4).map((option) => (
                <Link
                  key={option.value}
                  href={`/torneos?juego=${encodeURIComponent(option.value)}`}
                  className="ui-chip"
                >
                  {option.label}
                  {gameCounts.has(option.value) ? (
                    <span className="ui-chip-muted">{gameCounts.get(option.value)}</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ui-shell py-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="ui-eyebrow">Agenda</p>
            <h2 className="text-2xl font-black text-zinc-900">Eventos destacados</h2>
          </div>
          <Link href="/torneos" className="text-sm font-semibold text-[var(--accent)]">
            Ver todos
          </Link>
        </div>
        {upcomingTorneos.length ? (
          <div className="ui-event-rail">
            {upcomingTorneos.map((torneo) => {
              const fecha = new Date(torneo.fecha_inicio);
              const fallbackImage = torneo.tcg_juego && storageBase
                ? `${storageBase}/${torneo.tcg_juego}.jpg`
                : "";
              const imageUrl = torneo.imagen_url || fallbackImage;

              return (
                <Link
                  key={torneo.id}
                  href="/torneos"
                  className="ui-event-card"
                >
                  <div
                    className="h-40 border-b border-zinc-200 bg-zinc-900"
                    style={{
                      backgroundImage: imageUrl
                        ? `linear-gradient(180deg, rgba(6, 10, 16, 0.05), rgba(6, 10, 16, 0.18)), url(${imageUrl})`
                        : "linear-gradient(135deg, rgba(106, 169, 245, 0.28), rgba(247, 198, 74, 0.2))",
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-clamp-2 min-h-[3.15rem] text-lg font-black leading-tight text-zinc-900">
                        {torneo.titulo}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-600">
                        {torneo.tcg_juego ? gameLabelByValue.get(torneo.tcg_juego) ?? torneo.tcg_juego : "TCG"}
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm text-zinc-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4 text-white" />
                        {Number.isFinite(fecha.getTime()) ? dateFormatter.format(fecha) : "Por definir"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4 text-white" />
                        {torneo.ciudad ?? torneo.direccion}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Users className="size-4 text-white" />
                        {torneo.cupo_maximo.toLocaleString("es-CL")} cupos
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="ui-card rounded-lg p-8 text-sm text-zinc-600">
            No hay eventos próximos publicados para mostrar todavía.
          </div>
        )}
      </section>

      <section className="ui-shell grid gap-5 pb-10">
        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,22.5rem)]">
          <div className="ui-card min-w-0 overflow-hidden rounded-lg">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">Agenda rápida</h2>
              <Link href="/torneos" className="text-xs font-semibold text-[var(--accent)]">
                Abrir calendario
              </Link>
            </div>
            <div className="divide-y divide-zinc-100">
              {upcomingTorneos.length ? (
                upcomingTorneos.map((torneo) => {
                  const fecha = new Date(torneo.fecha_inicio);
                  return (
                    <Link
                      key={torneo.id}
                      href="/torneos"
                      className="grid min-w-0 gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 md:grid-cols-[8rem_minmax(0,1fr)_minmax(6rem,9.5rem)]"
                    >
                      <div className="flex items-center gap-2 text-zinc-600">
                        <CalendarClock className="size-4 text-[var(--accent)]" />
                        {Number.isFinite(fecha.getTime()) ? dateFormatter.format(fecha) : "Por definir"}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{torneo.titulo}</p>
                        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600">
                          <span className="inline-flex items-center gap-1">
                            <Store className="size-3.5" />
                            {torneo.tienda_nombre ?? "Tienda independiente"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {torneo.ciudad ?? torneo.direccion}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 md:justify-end">
                        <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600">
                          {torneo.tcg_juego ?? "TCG"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                          <Users className="size-3.5" />
                          {torneo.cupo_maximo}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-sm text-zinc-600">
                  No hay eventos próximos publicados para mostrar todavía.
                </div>
              )}
            </div>
          </div>

          <aside className="ui-card min-w-0 rounded-lg p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="ui-eyebrow">Accesos</p>
                <h2 className="text-sm font-semibold text-zinc-900">Acciones rápidas</h2>
              </div>
              <ArrowRight className="size-4 text-[var(--accent)]" />
            </div>
            <div className="grid gap-2">
              {quickLinks.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="ui-card-soft flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-zinc-900 transition hover:border-[var(--accent)] hover:bg-[rgba(106,169,245,0.1)]"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <Icon className="size-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{label}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-zinc-500" />
                </Link>
              ))}
            </div>
          </aside>
        </div>

        <section className="pt-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Explorar</p>
              <h2 className="text-lg font-semibold text-zinc-900">Juegos destacados</h2>
            </div>
            <Link href="/torneos" className="text-sm font-semibold text-[var(--accent)]">
              Ver todos
            </Link>
          </div>
          <GameCarousel
            items={TCG_OPTIONS.map((option) => {
              const imageUrl = storageBase ? `${storageBase}/${option.value}.jpg` : "";
              const backgroundImage = imageUrl
                ? `linear-gradient(180deg, rgba(9, 12, 18, 0.12) 0%, rgba(9, 12, 18, 0.62) 100%), url(${imageUrl})`
                : "linear-gradient(160deg, rgba(26, 32, 42, 0.96) 0%, rgba(67, 78, 96, 0.88) 100%)";

              return {
                label: option.label,
                href: `/torneos?juego=${encodeURIComponent(option.value)}`,
                backgroundImage,
              };
            })}
          />
        </section>
      </section>
    </main>
  );
}
