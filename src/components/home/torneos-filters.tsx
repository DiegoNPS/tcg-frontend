"use client";

import { ListFilter, MapPin, RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";

type GameOption = {
  value: string;
  label: string;
};

type TorneosFiltersProps = {
  initialValues: {
    juego: string;
    categoria: string;
    ciudad: string;
  };
  juegos: GameOption[];
};

export function TorneosFilters({ initialValues, juegos }: TorneosFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const gameOptions = juegos.length ? juegos : TCG_OPTIONS;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(nextUrl);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <section className="ui-card rounded-lg p-4">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <label className="ui-searchbar min-h-[3.25rem]">
          <Search className="size-5 shrink-0 text-[var(--accent)]" />
          <input
            defaultValue={initialValues.ciudad}
            onBlur={(event) => updateParam("ciudad", event.target.value.trim())}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParam("ciudad", event.currentTarget.value.trim());
              }
            }}
            placeholder="Buscar por ciudad o comuna..."
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-500"
          />
          <MapPin className="size-4 shrink-0 text-zinc-500" />
        </label>

        <button
          type="button"
          onClick={clearFilters}
          disabled={isPending}
          className="ui-button-ghost"
        >
          <RotateCcw className="size-4" />
          Limpiar
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="ui-eyebrow inline-flex w-20 items-center gap-1">
            <ListFilter className="size-3.5" />
            Juego
          </span>
          <button
            type="button"
            onClick={() => updateParam("juego", "")}
            disabled={isPending}
            className={`ui-chip ${initialValues.juego ? "" : "ui-chip-active"}`}
          >
            Todos
          </button>
          {gameOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParam("juego", option.value)}
              disabled={isPending}
              className={`ui-chip ${initialValues.juego === option.value ? "ui-chip-active" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="ui-eyebrow w-20">Formato</span>
          <button
            type="button"
            onClick={() => updateParam("categoria", "")}
            disabled={isPending}
            className={`ui-chip ${initialValues.categoria ? "" : "ui-chip-active"}`}
          >
            Todos
          </button>
          {CATEGORIA_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParam("categoria", option.value)}
              disabled={isPending}
              className={`ui-chip ${initialValues.categoria === option.value ? "ui-chip-active" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isPending ? <p className="text-xs font-semibold text-[var(--accent)]">Actualizando resultados...</p> : null}
      </div>
    </section>
  );
}
