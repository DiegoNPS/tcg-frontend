"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PasswordResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (password !== confirmation) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: password }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error || "No se pudo actualizar la contraseña.");
        return;
      }

      router.replace("/login?password=updated");
      router.refresh();
    } catch {
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-card space-y-4 rounded-lg p-5 sm:p-6">
      <label className="block space-y-1.5 text-sm font-medium text-zinc-700" htmlFor="new-password">
        <span>Nueva contraseña</span>
        <span className="relative block">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="ui-field ui-field-icon-start"
          />
        </span>
      </label>

      <label className="block space-y-1.5 text-sm font-medium text-zinc-700" htmlFor="confirm-new-password">
        <span>Confirmar contraseña</span>
        <input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          maxLength={128}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="ui-field"
        />
      </label>

      <button type="submit" disabled={isPending} className="ui-button-primary w-full">
        {isPending ? "Actualizando..." : "Guardar nueva contraseña"}
      </button>

      {message ? <p className="ui-alert ui-alert-danger" role="alert">{message}</p> : null}
    </form>
  );
}
