"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminGameFormProps = {
  actionLabel?: string;
  embedded?: boolean;
};

type FormMessage = {
  tone: "success" | "danger";
  text: string;
};

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function AdminGameForm({
  actionLabel = "Guardar juego",
  embedded = false,
}: AdminGameFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [key, setKey] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [keyEditedManually, setKeyEditedManually] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/admin/juegos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          key: (key.trim() || toSlug(nombre)).trim(),
          descripcion: descripcion.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage({
          tone: "danger",
          text: payload?.error ?? "No se pudo guardar el juego.",
        });
        return;
      }

      setMessage({ tone: "success", text: "Juego guardado correctamente." });
      setNombre("");
      setKey("");
      setDescripcion("");
      setKeyEditedManually(false);
      router.refresh();
    } catch {
      setMessage({
        tone: "danger",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={embedded ? "space-y-4" : "ui-card-soft space-y-4 rounded-lg p-4"}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700">Nombre del juego</span>
          <input
            required
            value={nombre}
            onChange={(event) => {
              const nextNombre = event.target.value;
              setNombre(nextNombre);
              if (!keyEditedManually) setKey(toSlug(nextNombre));
            }}
            placeholder="Pokémon TCG"
            className="ui-field"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700">Descripción</span>
          <input
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Juego de cartas coleccionables"
            className="ui-field"
          />
        </label>
      </div>

      <details className="group border-t border-zinc-200 pt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-zinc-700">
          Opciones avanzadas
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <label className="mt-3 flex max-w-xl flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700">Clave interna</span>
          <input
            value={key}
            onChange={(event) => {
              setKey(event.target.value);
              setKeyEditedManually(true);
            }}
            placeholder="pokemon_tcg"
            className="ui-field font-mono"
          />
          <span className="text-xs leading-5 text-zinc-600">
            Se genera automáticamente. Modifícala sólo si necesitas mantener compatibilidad con una clave existente.
          </span>
        </label>
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="ui-button-primary">
          <Plus className="size-4" aria-hidden="true" />
          {isPending ? "Guardando…" : actionLabel}
        </button>
        {message ? (
          <p
            className={`ui-alert ${message.tone === "success" ? "ui-alert-success" : "ui-alert-danger"}`}
            role={message.tone === "danger" ? "alert" : "status"}
            aria-live="polite"
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
