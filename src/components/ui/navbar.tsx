import { LogOut, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { signOut } from "@/actions/auth";
import { NavLinks } from "@/components/ui/nav-links";
import { fetchMe } from "@/lib/auth/fetch-me";
import { LOGIN_PATH, SIGNUP_PATH } from "@/lib/auth/routes";

export async function Navbar() {
  const me = await fetchMe();
  const userEmail = me?.user.email ?? null;
  const isTienda = me?.isTienda ?? false;
  const isAdmin = me?.profile?.user_role === "admin";
  const isJugador = me?.profile?.user_role === "jugador";

  return (
    <header className="ui-topbar sticky top-0 z-20">
      <div className="ui-shell grid min-h-[5.5rem] min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-2 sm:gap-x-4 md:py-3">
        <Link href="/" className="inline-flex min-h-11 shrink-0 items-center text-white" aria-label="TCG Tournaments">
          <Image
            src="/brand/tcg-tournaments-logo-crop.png"
            alt="TCG Tournaments"
            width={180}
            height={80}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <NavLinks isAdmin={isAdmin} isJugador={isJugador} isTienda={isTienda} />

        <div className="col-start-3 row-start-1 ml-auto flex shrink-0 items-center gap-2">
          {!userEmail ? (
            <>
              <Link
                href={LOGIN_PATH}
                className="ui-button-ghost ui-auth-login min-h-0 px-3 py-2"
              >
                <Shield className="size-4" aria-hidden="true" />
                Iniciar sesión
              </Link>
              <Link
                href={SIGNUP_PATH}
                className="ui-button-primary min-h-0 px-3 py-2"
              >
                <span className="hidden sm:inline">Crear cuenta</span>
                <span className="sm:hidden">Cuenta</span>
              </Link>
            </>
          ) : (
            <form action={signOut}>
              <button
                type="submit"
                className="ui-button-ghost min-h-0 px-3 py-2"
                title={userEmail}
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sr-only sm:hidden">Cerrar sesión</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
