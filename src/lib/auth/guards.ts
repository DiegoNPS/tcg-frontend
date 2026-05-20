import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { fetchMe, type MePayload } from "./fetch-me";

function buildLoginPath(nextPath: string) {
  return `${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`;
}

export async function requireAuthenticatedUser(nextPath: string): Promise<MePayload> {
  const me = await fetchMe();

  if (!me?.user) {
    redirect(buildLoginPath(nextPath));
  }

  return me;
}

export async function requireStore() {
  const me = await requireAuthenticatedUser("/tienda/dashboard");

  const isAdminUser = me.profile?.user_role === "admin";
  if (!me.isTienda && !isAdminUser) {
    redirect("/");
  }
}

export async function requirePlayer() {
  const me = await requireAuthenticatedUser("/");

  if (me.profile?.user_role !== "jugador") {
    redirect("/");
  }
}

export async function requireAdmin() {
  const me = await requireAuthenticatedUser("/admin");

  if (me.profile?.user_role !== "admin") {
    redirect("/");
  }
}
