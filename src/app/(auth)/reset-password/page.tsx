import Link from "next/link";

import { PasswordResetForm } from "@/components/forms/password-reset-form";
import { fetchMe } from "@/lib/auth/fetch-me";

export const metadata = { title: "Nueva contraseña" };

export default async function ResetPasswordPage() {
  const me = await fetchMe();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="ui-eyebrow">Cuenta</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Crea una nueva contraseña</h1>
          <p className="text-sm leading-6 text-zinc-600">
            Usa al menos 6 caracteres y evita reutilizar una contraseña anterior.
          </p>
        </header>

        {me?.user ? (
          <PasswordResetForm />
        ) : (
          <div className="ui-alert ui-alert-danger" role="alert">
            El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/forgot-password" className="text-[var(--accent)] underline-offset-4 hover:underline">
            Solicitar otro enlace
          </Link>
          <Link href="/login" className="text-zinc-600 underline-offset-4 hover:underline">
            Volver al acceso
          </Link>
        </div>
      </div>
    </main>
  );
}
