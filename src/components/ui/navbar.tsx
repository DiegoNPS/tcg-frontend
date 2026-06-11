import { LayoutDashboard, LogOut, PlusCircle, Shield, Store, Ticket, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { signOut } from "@/actions/auth";
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
      <div className="ui-shell flex min-h-[5.5rem] min-w-0 items-center gap-3 py-3 sm:gap-4">
        <Link href="/" className="inline-flex shrink-0 items-center text-white" aria-label="TCG Tournaments">
          <Image
            src="/brand/tcg-tournaments-logo-crop.png"
            alt="TCG Tournaments"
            width={180}
            height={80}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/torneos"
            className="ui-nav-link"
          >
            <Ticket className="size-4" />
            Eventos
          </Link>

          <Link
            href="/tienda/nuevo-torneo"
            className="ui-nav-link"
          >
            <PlusCircle className="size-4" />
            Publicar evento
          </Link>

          {isTienda ? (
            <>
              <Link
                href="/tienda/dashboard"
                className="ui-nav-link"
              >
                <Store className="size-4" />
                Panel de tienda
              </Link>
            </>
          ) : null}

          {isJugador ? (
            <>
              <Link
                href="/jugador/inscripciones"
                className="ui-nav-link"
              >
                <User className="size-4" />
                Mis inscripciones
              </Link>
              <Link
                href="/jugador/perfil"
                className="ui-nav-link"
              >
                <User className="size-4" />
                Mi perfil
              </Link>
            </>
          ) : null}

          {isAdmin ? (
            <Link
              href="/admin"
              className="ui-nav-link"
            >
              <LayoutDashboard className="size-4" />
              Administración
            </Link>
          ) : null}

        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!userEmail ? (
            <>
              <Link
                href={LOGIN_PATH}
                className="ui-button-ghost hidden min-h-0 px-3 py-2 sm:inline-flex"
              >
                <Shield className="size-4" />
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
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
