import Link from "next/link";

import { PasswordRecoveryForm } from "@/components/forms/password-recovery-form";

export const metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="ui-eyebrow">Cuenta</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Recupera tu contraseña</h1>
          <p className="text-sm leading-6 text-zinc-600">
            Te enviaremos un enlace seguro al correo asociado a tu cuenta.
          </p>
        </header>

        <PasswordRecoveryForm />

        <Link href="/login" className="inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
