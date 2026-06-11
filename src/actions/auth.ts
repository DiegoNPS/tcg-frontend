"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { resolveServerApiBaseUrl } from "@/lib/api/base-url";
import { LOGIN_PATH } from "@/lib/auth/routes";

export async function signOut() {
  const baseUrl = await resolveServerApiBaseUrl();

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
