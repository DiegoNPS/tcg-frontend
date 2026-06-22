"use client";

import { Mail, Send, ShieldCheck, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AUTH_CALLBACK_PATH, DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const buildCallbackUrl = () => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const callbackUrl = new URL(AUTH_CALLBACK_PATH, base);
    if (nextPath) callbackUrl.searchParams.set("next", nextPath);
    return callbackUrl.toString();
  };

  const handleGoogleLogin = async () => {
    setMessage(null);
    setIsPending(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildCallbackUrl(),
        },
      });

      if (error) {
        setMessage("No se pudo iniciar con Google. Intenta nuevamente.");
        setIsPending(false);
      }
    } catch {
      setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
      setIsPending(false);
    }
  };

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          nextPath,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        setMessage(error.error || "No se pudo iniciar sesión. Verifica tus credenciales.");
        setIsPending(false);
        return;
      }

      const payload = await response.json();
      router.replace(payload.redirectTo || nextPath || DEFAULT_POST_LOGIN_PATH);
      router.refresh();
    } catch {
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="ui-card space-y-5 rounded-lg p-5 sm:p-6">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="ui-button-secondary w-full"
      >
        <ShieldCheck className="size-4" />
        {isPending ? "Conectando..." : "Continuar con Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>o inicia sesión con correo</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium text-zinc-700" htmlFor="email">
          <span>Correo</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              name="email"
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

        <label className="block space-y-1.5 text-sm font-medium text-zinc-700" htmlFor="password">
          <span>Contraseña</span>
          <span className="relative block">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              className="ui-field ui-field-icon-start"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="ui-button-primary w-full"
        >
          <Send className="size-4" />
          {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      {message ? <p className="ui-alert ui-alert-warning" role="alert">{message}</p> : null}
    </div>
  );
}
