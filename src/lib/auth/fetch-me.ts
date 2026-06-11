import { cookies } from "next/headers";

import { resolveServerApiBaseUrl } from "@/lib/api/base-url";

export type MeProfile = {
  display_name: string | null;
  user_role: "jugador" | "tienda" | "admin" | null;
  created_at: string | null;
};

export type MePayload = {
  user: { id: string; email: string | null };
  profile: MeProfile | null;
  isTienda: boolean;
};

export async function fetchMe(): Promise<MePayload | null> {
  const baseUrl = await resolveServerApiBaseUrl();
  if (!baseUrl) return null;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      cache: "no-store",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    if (!res.ok) return null;
    const { data } = (await res.json()) as { data: MePayload };
    return data;
  } catch {
    return null;
  }
}
