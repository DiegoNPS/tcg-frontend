"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-rose-600">{message}</span>;
}

export function TiendaForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const nombre = String(formData.get("nombre") ?? "").trim();
    const ciudad = String(formData.get("ciudad") ?? "").trim();

    try {
      const response = await fetch("/api/tiendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, ciudad }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400 && data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        } else {
          setError(data.error || "No se pudo crear la tienda");
        }
        setIsPending(false);
        return;
      }

      router.push("/tienda/dashboard?store=created");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-card max-w-xl space-y-4 rounded-lg p-5 sm:p-6">
      {error ? (
        <p className="ui-alert ui-alert-danger">{error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Nombre de la tienda</span>
        <input required name="nombre" placeholder="Mi tienda" className="ui-field" />
        <FieldError message={fieldErrors?.nombre} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Ciudad</span>
        <input required name="ciudad" placeholder="Ciudad" className="ui-field" />
        <FieldError message={fieldErrors?.ciudad} />
      </label>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="ui-button-primary"
        >
          {isPending ? "Creando…" : "Crear tienda"}
        </button>
      </div>
    </form>
  );
}

export default TiendaForm;
