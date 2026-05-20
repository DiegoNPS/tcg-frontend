"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";

async function resolveBaseUrl(): Promise<string | null> {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signOut() {
  const baseUrl = await resolveBaseUrl();

  if (baseUrl) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      });
    } catch {}
  }

  redirect(LOGIN_PATH);
}
