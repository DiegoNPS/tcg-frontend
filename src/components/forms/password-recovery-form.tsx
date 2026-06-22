"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

export function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsError(false);
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setIsError(true);
        setMessage(payload?.error || "No se pudo iniciar la recuperación.");
        return;
      }

      setMessage(
        "Si el correo pertenece a una cuenta, recibirás un enlace para crear una nueva contraseña.",
      );
    } catch {
      setIsError(true);
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ui-card space-y-5 rounded-lg p-5 sm:p-6">
      <label className="block space-y-1.5 text-sm font-medium text-zinc-700" htmlFor="recovery-email">
        <span>Correo</span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="ui-field ui-field-icon-start"
          />
        </span>
      </label>

      <button type="submit" disabled={isPending} className="ui-button-primary w-full">
        {isPending ? "Enviando enlace..." : "Enviar enlace de recuperación"}
      </button>

      {message ? (
        <p
          className={`ui-alert ${isError ? "ui-alert-danger" : "ui-alert-success"}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
