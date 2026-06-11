import { headers } from "next/headers";

export async function resolveServerApiBaseUrl(): Promise<string | null> {
  const backendBase = process.env.BACKEND_URL?.trim();
  if (backendBase) return backendBase.replace(/\/$/, "");

  const appBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appBase) return appBase.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("host");
  if (!host) return null;

  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
