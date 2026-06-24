"use client";

import { Check, Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type UserRole = "jugador" | "tienda" | "admin";

type AdminRoleControlProps = {
  userId: string;
  initialRole: UserRole | null;
};

const roleLabels: Record<UserRole, string> = {
  jugador: "Jugador",
  tienda: "Tienda",
  admin: "Administrador",
};

export function AdminRoleControl({ userId, initialRole }: AdminRoleControlProps) {
  const router = useRouter();
  const fieldId = useId();
  const [role, setRole] = useState<UserRole>(initialRole ?? "jugador");
  const [savedRole, setSavedRole] = useState<UserRole | null>(initialRole);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const saveRole = async () => {
    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "No se pudo guardar el rol.");
        return;
      }

      setSavedRole(role);
      setMessage("Rol actualizado.");
      router.refresh();
    } catch {
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col items-start gap-2 sm:items-end">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <label htmlFor={fieldId} className="sr-only">
          Rol de usuario
        </label>
        <select
          id={fieldId}
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          disabled={isPending}
          className="ui-field min-h-10 w-auto py-2"
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={saveRole}
          disabled={isPending || role === savedRole}
          className="ui-button-secondary min-h-10 px-3 py-2"
        >
          {role === savedRole ? <Check className="size-4" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
          {isPending ? "Guardando…" : role === savedRole ? "Guardado" : "Guardar rol"}
        </button>
      </div>
      <p className="min-h-4 text-xs text-zinc-600" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

type PublishTournamentButtonProps = {
  tournamentId: string;
};

export function PublishTournamentButton({ tournamentId }: PublishTournamentButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const publish = async () => {
    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/admin/torneos/${tournamentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicado: true }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "No se pudo publicar.");
        return;
      }

      setMessage("Torneo publicado.");
      setIsConfirming(false);
      router.refresh();
    } catch {
      setMessage("Error de conexión.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
      {isConfirming ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={publish}
            disabled={isPending}
            className="ui-button-primary min-h-10 px-3 py-2"
          >
            <Send className="size-4" aria-hidden="true" />
            {isPending ? "Publicando…" : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            disabled={isPending}
            className="ui-button-ghost min-h-10 px-3 py-2"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="ui-button-primary min-h-10 px-3 py-2"
        >
          <Send className="size-4" aria-hidden="true" />
          Publicar
        </button>
      )}
      <span className="min-h-4 text-xs text-zinc-600" aria-live="polite">
        {message ?? (isConfirming ? "El evento quedará visible públicamente." : null)}
      </span>
    </div>
  );
}
