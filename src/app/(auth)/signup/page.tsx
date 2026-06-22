import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SignupForm } from "@/components/forms/signup-form";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/routes";

type SignupPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function sanitizeNextPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value;

  if (!nextValue || !nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return nextValue;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 sm:py-10 lg:py-12">
      <div className="w-full space-y-6">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 self-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 shadow-sm">
            <Sparkles className="size-3.5" />
            Registro de nuevo jugador
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Crea tu cuenta
            </h1>
            <p className="mx-auto max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base">
              Registra tus datos de jugador para inscribirte a eventos.
            </p>
          </div>
        </header>

        <div className="mx-auto h-px w-full max-w-5xl bg-zinc-300/80" />

        <section className="mx-auto w-full max-w-2xl">
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                Datos de cuenta
              </h2>
            </div>

            <SignupForm nextPath={nextPath} />

            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
              <span>Ya tienes cuenta?</span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-zinc-900 underline underline-offset-4"
              >
                Iniciar sesión
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
