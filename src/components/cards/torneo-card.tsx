"use client";

import { CalendarClock, ExternalLink, MapPin, Store, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TorneoCardModel = {
  id: string;
  titulo: string;
  descripcion: string;
  tcg_juego: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  fecha_inicio: string;
  cupo_maximo: number;
  costo_entrada: number;
  tiendaNombre: string;
  imagen_url?: string | null;
  latitud?: number | null;
  longitud?: number | null;
};

type TorneoCardProps = {
  torneo: TorneoCardModel;
  canInscribirse: boolean;
  yaInscripto: boolean;
  isPast?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function TorneoCard({ torneo, canInscribirse, yaInscripto, isPast = false }: TorneoCardProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const fecha = new Date(torneo.fecha_inicio);
  const canRegister = canInscribirse && !yaInscripto && !isPast;

  const handleInscribirse = async () => {
    if (!canRegister) return;

    setIsPending(true);
    try {
      const response = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ torneo_id: torneo.id }),
      });

      if (response.ok) {
        router.push("/torneos?inscripcion=ok");
      } else {
        let code: string | undefined;

        try {
          const data = await response.json();
          if (data && typeof data.code === "string") {
            code = data.code;
          }
        } catch {
          code = undefined;
        }

        if (response.status === 401) {
          router.push(loginHref);
        } else if (code) {
          router.push(`/torneos?inscripcion=${code}`);
        } else if (response.status === 409) {
          router.push("/torneos?inscripcion=existente");
        } else if (response.status === 403) {
          router.push("/torneos?inscripcion=no-jugador");
        } else {
          router.push("/torneos?inscripcion=error");
        }
      }
    } catch {
      router.push("/torneos?inscripcion=error");
    } finally {
      setIsPending(false);
    }
  };
  const loginHref = `/login?next=${encodeURIComponent(`/torneos?torneo=${torneo.id}`)}`;
  const latitud = torneo.latitud ?? null;
  const longitud = torneo.longitud ?? null;
  const hasCoordinates = typeof latitud === "number" && typeof longitud === "number";
  const mapsLink = hasCoordinates
    ? `https://www.google.com/maps?q=${latitud},${longitud}`
    : "";
  const backgroundImage = torneo.imagen_url
    ? `linear-gradient(160deg, rgba(9, 9, 11, 0.65) 0%, rgba(9, 9, 11, 0.55) 40%, rgba(9, 9, 11, 0.85) 100%), url(${torneo.imagen_url})`
    : "linear-gradient(160deg, rgba(24, 24, 27, 0.95) 0%, rgba(63, 63, 70, 0.85) 55%, rgba(9, 9, 11, 0.95) 100%)";

  return (
    <article
      className={`ui-event-card flex min-h-[28rem] flex-col ${isPast ? "opacity-75 grayscale-[0.15]" : ""}`}
    >
      <div
        className="relative h-40 border-b border-zinc-200 bg-zinc-900"
        style={{
          backgroundImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#111820]/42 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
          <span className="ui-badge ui-badge-accent bg-[rgba(8,12,18,0.78)]">{torneo.tcg_juego}</span>
          <span className="ui-badge ui-badge-warning bg-[rgba(8,12,18,0.78)]">{torneo.categoria}</span>
          {isPast ? <span className="ui-badge bg-[rgba(8,12,18,0.78)]">Finalizado</span> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <header className="space-y-2">
          <h2 className="text-clamp-2 min-h-[3.1rem] text-xl font-black leading-tight text-zinc-900">{torneo.titulo}</h2>
          <p className="text-clamp-2 min-h-[2.5rem] text-sm leading-5 text-zinc-600">{torneo.descripcion}</p>
        </header>

        <dl className="grid gap-2 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0 text-white" />
            <dt className="sr-only">Fecha</dt>
            <dd>{Number.isFinite(fecha.getTime()) ? dateFormatter.format(fecha) : "Por definir"}</dd>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-white" />
            <dt className="sr-only">Ubicación</dt>
            <dd className="text-clamp-2">{torneo.ciudad ? `${torneo.ciudad} - ${torneo.direccion}` : torneo.direccion}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Store className="size-4 shrink-0 text-white" />
            <dt className="sr-only">Tienda organizadora</dt>
            <dd className="truncate">{torneo.tiendaNombre}</dd>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="ui-card-soft rounded-lg px-3 py-2">
              <dt className="flex items-center gap-1 text-xs font-semibold uppercase text-zinc-500">
                <Ticket className="size-3.5" />
                Entrada
              </dt>
              <dd className="mt-1 font-bold text-zinc-900">
                {torneo.costo_entrada === 0 ? "Gratis" : `$${torneo.costo_entrada.toLocaleString("es-CL")}`}
              </dd>
            </div>
            <div className="ui-card-soft rounded-lg px-3 py-2">
              <dt className="flex items-center gap-1 text-xs font-semibold uppercase text-zinc-500">
                <Users className="size-3.5" />
                Cupos
              </dt>
              <dd className="mt-1 font-bold text-zinc-900">{torneo.cupo_maximo.toLocaleString("es-CL")}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-auto space-y-3">
          <div className="flex min-h-5 flex-wrap items-center gap-3">
            {mapsLink ? (
              <a
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                href={mapsLink}
                rel="noreferrer"
                target="_blank"
              >
                Ver mapa
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}

            {yaInscripto ? <p className="text-xs font-semibold text-emerald-300">Ya estás inscrito.</p> : null}
            {isPast ? <p className="text-xs font-semibold text-zinc-500">Inscripciones cerradas.</p> : null}
          </div>

          {canRegister ? (
            <button
              onClick={handleInscribirse}
              disabled={isPending}
              className="ui-button-primary w-full"
            >
              {isPending ? "Inscribiendo..." : "Inscribirme"}
            </button>
          ) : null}

          {!canInscribirse && !isPast ? (
            <Link href={loginHref} className="ui-button-ghost w-full">
              Inicia sesión para inscribirte
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
