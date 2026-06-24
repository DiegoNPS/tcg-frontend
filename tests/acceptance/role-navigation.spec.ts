import { expect, test, type BrowserContext } from "@playwright/test";

async function setRole(context: BrowserContext, role: "jugador" | "tienda" | "admin") {
  await context.addCookies([
    {
      name: "e2e_role",
      value: role,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
}

test.describe("navegación según rol", () => {
  test("CA-04: un visitante no ve la acción de publicar", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Publicar evento" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Crear cuenta" }).first()).toBeVisible();
  });

  test("CA-05: un jugador no ve la acción de publicar", async ({ context, page }) => {
    await setRole(context, "jugador");
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Publicar evento" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Mis inscripciones" }).first()).toBeVisible();
  });

  test("CA-06: una tienda ve la acción de publicar", async ({ context, page }) => {
    await setRole(context, "tienda");
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Publicar evento" }).first()).toBeVisible();
  });

  test("CA-07: un administrador ve la acción de publicar", async ({ context, page }) => {
    await setRole(context, "admin");
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Publicar evento" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Administración" }).first()).toBeVisible();
  });
});
