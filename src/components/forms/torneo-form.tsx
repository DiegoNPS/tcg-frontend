"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DireccionAutocomplete } from "@/components/ui/direccion-autocomplete";
import { ImagenUpload } from "@/components/ui/imagen-upload";
import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";
import type { CategoriaTorneo, TcgJuego } from "@/types/database.types";

type TorneoDefaults = {
  id?: string;
  titulo?: string;
  descripcion?: string;
  tcg_juego?: TcgJuego;
  categoria?: CategoriaTorneo;
  direccion?: string;
  fecha_inicio?: string;
  cupo_maximo?: number;
  costo_entrada?: number;
  publicado?: boolean;
  latitud?: number | null;
  longitud?: number | null;
  imagen_url?: string | null;
};

type LookupOption = {
  id: string;
  key: string;
  nombre: string;
};

type CreateProps = {
  mode?: "create";
  defaults?: never;
};

type EditProps = {
  mode: "edit";
  defaults: TorneoDefaults;
};

type TorneoFormProps = CreateProps | EditProps;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-rose-600">{message}</span>;
}

function resolveLookupSelection(
  items: LookupOption[],
  preferredKey: string | undefined,
  fallbackKey: string,
) {
  return (
    items.find((item) => item.key === preferredKey) ??
    items.find((item) => item.key === fallbackKey) ??
    items[0] ??
    null
  );
}

export function TorneoForm({ mode = "create", defaults }: TorneoFormProps) {
  const router = useRouter();
  const initialTcgJuego = defaults?.tcg_juego || "pokemon";
  const initialCategoria = defaults?.categoria || "casual";
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [titulo, setTitulo] = useState(defaults?.titulo || "");
  const [descripcion, setDescripcion] = useState(defaults?.descripcion || "");
  const [tcgJuego, setTcgJuego] = useState(initialTcgJuego);
  const [categoria, setCategoria] = useState(initialCategoria);
  const [juegos, setJuegos] = useState<LookupOption[]>([]);
  const [categorias, setCategorias] = useState<LookupOption[]>([]);
  const [juegoId, setJuegoId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [direccion, setDireccion] = useState(defaults?.direccion || "");
  const [latitud, setLatitud] = useState(defaults?.latitud ?? null);
  const [longitud, setLongitud] = useState(defaults?.longitud ?? null);
  const [fechaInicio, setFechaInicio] = useState(
    defaults?.fecha_inicio ? new Date(defaults.fecha_inicio).toISOString().slice(0, 16) : "",
  );
  const [cupoMaximo, setCupoMaximo] = useState(defaults?.cupo_maximo ?? 32);
  const [costoEntrada, setCostoEntrada] = useState(defaults?.costo_entrada ?? 0);
  const [imagenUrl, setImagenUrl] = useState(defaults?.imagen_url || "");

  const handleDireccionChange = (addr: string, lat: number | null, lng: number | null) => {
    setDireccion(addr);
    setLatitud(lat);
    setLongitud(lng);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      try {
        const [juegosResponse, categoriasResponse] = await Promise.all([
          fetch("/api/lookups/juegos"),
          fetch("/api/lookups/categorias"),
        ]);
        const [juegosJson, categoriasJson] = await Promise.all([
          juegosResponse.ok ? juegosResponse.json() : Promise.resolve({ data: [] }),
          categoriasResponse.ok ? categoriasResponse.json() : Promise.resolve({ data: [] }),
        ]);

        if (cancelled) return;

        const nextJuegos = (juegosJson.data ?? []) as LookupOption[];
        const nextCategorias = (categoriasJson.data ?? []) as LookupOption[];
        const selectedJuego = resolveLookupSelection(nextJuegos, initialTcgJuego, "pokemon");
        const selectedCategoria = resolveLookupSelection(nextCategorias, initialCategoria, "casual");

        setJuegos(nextJuegos);
        setCategorias(nextCategorias);

        if (selectedJuego) {
          setJuegoId(selectedJuego.id);
          setTcgJuego(selectedJuego.key as TcgJuego);
        }

        if (selectedCategoria) {
          setCategoriaId(selectedCategoria.id);
          setCategoria(selectedCategoria.key as CategoriaTorneo);
        }
      } catch {
        if (!cancelled) {
          setJuegos([]);
          setCategorias([]);
        }
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, [initialCategoria, initialTcgJuego]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const publicar = submitter?.value !== "false";
    setError(null);
    setFieldErrors({});
    setIsPending(true);

    const payload: any = {
      titulo,
      descripcion,
      tcg_juego: tcgJuego,
      categoria,
      juego_id: juegoId,
      categoria_id: categoriaId,
      direccion,
      fecha_inicio: fechaInicio,
      cupo_maximo: Number(cupoMaximo),
      costo_entrada: Number(costoEntrada),
      publicado: publicar,
      latitud,
      longitud,
      imagen_url: imagenUrl || null,
    };

    try {
      const url =
        mode === "create"
          ? "/api/torneos/crear"
          : `/api/torneos/${defaults?.id}/editar`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        } else {
          setError(data.error || "No se pudo guardar el torneo");
        }
        setIsPending(false);
        return;
      }

      router.push(mode === "edit" ? "/tienda/dashboard?updated=1" : "/tienda/dashboard?created=1");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-card space-y-6 rounded-lg p-5 sm:p-6">
      {error ? (
        <p className="ui-alert ui-alert-danger">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Titulo</span>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Liga de Sabado"
            className="ui-field aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.titulo || undefined}
          />
          <FieldError message={fieldErrors.titulo} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Fecha y hora</span>
          <input
            required
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="ui-field aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.fecha_inicio || undefined}
          />
          <FieldError message={fieldErrors.fecha_inicio} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Descripcion</span>
        <textarea
          required
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles del torneo, premios y formato."
          className="ui-field min-h-28 aria-[invalid]:border-rose-400"
          aria-invalid={!!fieldErrors.descripcion || undefined}
        />
        <FieldError message={fieldErrors.descripcion} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Juego</span>
          <select
            required
            value={juegos.length > 0 ? (juegoId ?? "") : tcgJuego}
            onChange={(e) => {
              const val = e.target.value;
              const found = juegos.find((j: any) => j.id === val);
              if (found) {
                setJuegoId(found.id);
                setTcgJuego(found.key as TcgJuego);
              } else {
                setJuegoId(null);
                setTcgJuego(val as TcgJuego);
              }
            }}
            className="ui-field"
          >
            {juegos.length > 0 ? (
              <>
                <option value="" disabled>
                  Selecciona un juego
                </option>
                {juegos.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nombre}
                  </option>
                ))}
              </>
            ) : (
              TCG_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
          <FieldError message={fieldErrors.juego_id ?? fieldErrors.tcg_juego} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Categoria</span>
          <select
            required
            value={categorias.length > 0 ? (categoriaId ?? "") : categoria}
            onChange={(e) => {
              const val = e.target.value;
              const found = categorias.find((c: any) => c.id === val);
              if (found) {
                setCategoriaId(found.id);
                setCategoria(found.key as CategoriaTorneo);
              } else {
                setCategoriaId(null);
                setCategoria(val as CategoriaTorneo);
              }
            }}
            className="ui-field"
          >
            {categorias.length > 0 ? (
              <>
                <option value="" disabled>
                  Selecciona una categoria
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </>
            ) : (
              CATEGORIA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
          <FieldError message={fieldErrors.categoria_id ?? fieldErrors.categoria} />
        </label>
      </div>

      <DireccionAutocomplete
        error={fieldErrors.direccion}
        defaultValue={defaults?.direccion}
        defaultLat={defaults?.latitud ?? undefined}
        defaultLng={defaults?.longitud ?? undefined}
        onAddressChange={handleDireccionChange}
      />

      <p className="text-xs text-zinc-500">
        La ciudad del torneo se toma desde la tienda asociada.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Cupo maximo</span>
          <input
            required
            type="number"
            min={2}
            max={1024}
            value={cupoMaximo}
            onChange={(e) => setCupoMaximo(Number(e.target.value))}
            className="ui-field aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.cupo_maximo || undefined}
          />
          <FieldError message={fieldErrors.cupo_maximo} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Costo de entrada</span>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={costoEntrada}
            onChange={(e) => setCostoEntrada(Number(e.target.value))}
            className="ui-field aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.costo_entrada || undefined}
          />
          <FieldError message={fieldErrors.costo_entrada} />
        </label>
      </div>

      <ImagenUpload defaultValue={defaults?.imagen_url} onUpload={setImagenUrl} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          name="publicado"
          value="true"
          disabled={isPending}
          className="ui-button-primary"
        >
          {isPending ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Publicar torneo"}
        </button>
        <button
          type="submit"
          name="publicado"
          value="false"
          disabled={isPending}
          className="ui-button-ghost"
        >
          {isPending ? "Guardando…" : "Guardar borrador"}
        </button>
      </div>
    </form>
  );
}
