"use client";

import { LayoutDashboard, PlusCircle, Store, Ticket, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinksProps = {
  isAdmin: boolean;
  isJugador: boolean;
  isTienda: boolean;
};

const publicLinks = [
  { href: "/torneos", label: "Eventos", Icon: Ticket },
];

const publishLink = {
  href: "/tienda/nuevo-torneo",
  label: "Publicar evento",
  Icon: PlusCircle,
};

function isCurrentPath(pathname: string, href: string) {
  if (href === "/torneos") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ isAdmin, isJugador, isTienda }: NavLinksProps) {
  const pathname = usePathname();
  const links = [
    ...publicLinks,
    ...(isTienda || isAdmin ? [publishLink] : []),
    ...(isTienda
      ? [{ href: "/tienda/dashboard", label: "Panel de tienda", Icon: Store }]
      : []),
    ...(isJugador
      ? [
          { href: "/jugador/inscripciones", label: "Mis inscripciones", Icon: User },
          { href: "/jugador/perfil", label: "Mi perfil", Icon: User },
        ]
      : []),
    ...(isAdmin
      ? [{ href: "/admin", label: "Administración", Icon: LayoutDashboard }]
      : []),
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="col-span-3 row-start-2 flex min-w-0 items-center gap-2 overflow-x-auto pb-1 text-sm [-ms-overflow-style:none] [scrollbar-width:none] md:col-span-1 md:col-start-2 md:row-start-1 md:pb-0 [&::-webkit-scrollbar]:hidden"
    >
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className="ui-nav-link"
          aria-current={isCurrentPath(pathname, href) ? "page" : undefined}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
