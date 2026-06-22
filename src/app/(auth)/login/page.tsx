import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
    password?: string | string[];
  }>;
};

function sanitizeNextPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value;

  if (!nextValue || !nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return undefined;
  }

  return nextValue;
}

function getErrorMessage(value: string | string[] | undefined) {
  const errorValue = Array.isArray(value) ? value[0] : value;

  if (errorValue === "callback") {
    return "No pudimos completar el inicio de sesión. Verifica tus credenciales o intenta con Google.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);
  const errorMessage = getErrorMessage(params.error);
  const passwordStatus = Array.isArray(params.password) ? params.password[0] : params.password;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-zinc-500">Cuenta</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Accede a TCG Hub</h1>
          <p className="text-sm text-zinc-600">
            Inicia sesión con tu cuenta (correo y contraseña) o con Google.
          </p>
        </div>

        <LoginForm nextPath={nextPath} />

        {passwordStatus === "updated" ? (
          <p className="ui-alert ui-alert-success" role="status">
            Contraseña actualizada. Ya puedes iniciar sesión.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </p>
        ) : null}

        <p className="text-sm text-zinc-600">
          <Link href="/forgot-password" className="font-medium text-zinc-900 underline underline-offset-4">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-sm text-zinc-600">
          No tienes cuenta?{" "}
          <Link href="/signup" className="font-medium text-zinc-900 underline underline-offset-4">
            Regístrate
          </Link>
          .
        </p>

        <p className="text-sm text-zinc-600">
          Volver a{" "}
          <Link href="/" className="font-medium text-zinc-900 underline underline-offset-4">
            torneos públicos
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
