"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteTorneoButtonProps = {
  endpoint: string;
  title: string;
  compact?: boolean;
};

export function DeleteTorneoButton({
  endpoint,
  title,
  compact = false,
}: DeleteTorneoButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const remove = async () => {
    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "No se pudo eliminar el torneo.");
        return;
      }

      setMessage("Torneo eliminado.");
      setIsConfirming(false);
      router.refresh();
    } catch {
      setMessage("Error de conexion. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  const buttonSize = compact ? "min-h-0 px-2.5 py-1.5 text-xs" : "min-h-10 px-3 py-2";

  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
      {isConfirming ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className={`ui-button-danger ${buttonSize}`}
          >
            <Trash2 className={compact ? "size-3" : "size-4"} aria-hidden="true" />
            {isPending ? "Eliminando..." : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            disabled={isPending}
            className={`ui-button-ghost ${buttonSize}`}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setIsConfirming(true);
          }}
          className={`ui-button-danger ${buttonSize}`}
          aria-label={`Eliminar torneo ${title}`}
        >
          <Trash2 className={compact ? "size-3" : "size-4"} aria-hidden="true" />
          Eliminar
        </button>
      )}
      <span className="min-h-4 max-w-60 text-xs text-zinc-600" aria-live="polite">
        {message ?? (isConfirming ? "Se borrara el torneo y sus inscripciones." : null)}
      </span>
    </div>
  );
}
