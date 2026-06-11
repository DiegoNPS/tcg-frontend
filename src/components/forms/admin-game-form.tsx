"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminGameFormProps = {
  actionLabel?: string;
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

export function AdminGameForm({ actionLabel = "Guardar juego" }: AdminGameFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [key, setKey] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [message, setMessage] = useState<string | null>(null);
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

      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error || "No se pudo guardar el juego.");
        return;
      }

      setMessage("Juego guardado correctamente.");
      setNombre("");
      setKey("");
      setDescripcion("");
      router.refresh();
    } catch {
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-card-soft space-y-4 rounded-lg p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="font-medium text-zinc-700">Nombre del juego</span>
          <input
            required
            value={nombre}
            onChange={(event) => {
              const nextNombre = event.target.value;
              setNombre(nextNombre);
              if (!key.trim()) {
                setKey(toSlug(nextNombre));
              }
            }}
            placeholder="Pokémon TCG"
            className="ui-field"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Clave</span>
          <input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="pokemon_tcg"
            className="ui-field"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Descripción</span>
          <input
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Juego de cartas coleccionables"
            className="ui-field"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="ui-button-primary"
      >
        {isPending ? "Guardando..." : actionLabel}
      </button>

      {message ? <p className="ui-alert">{message}</p> : null}
    </form>
  );
}
