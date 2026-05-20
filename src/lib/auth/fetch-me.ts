import { cookies, headers } from "next/headers";

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

async function resolveBaseUrl(): Promise<string | null> {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function fetchMe(): Promise<MePayload | null> {
  const baseUrl = await resolveBaseUrl();
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
