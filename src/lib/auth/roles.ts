import { fetchMe } from "./fetch-me";

export type UserRole = "jugador" | "tienda" | "admin";

export async function getUserProfile() {
  const me = await fetchMe();
  return me?.profile ?? null;
}

export async function isStore() {
  const profile = await getUserProfile();
  return profile?.user_role === "tienda";
}

export async function isPlayer() {
  const profile = await getUserProfile();
  return profile?.user_role === "jugador";
}

export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.user_role === "admin";
}

export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  return (profile?.user_role as UserRole | null) ?? null;
}
