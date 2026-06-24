import { expect, test } from "@playwright/test";

test.describe("criterios de aceptación de navegación pública", () => {
  test("CA-01: la portada permite comenzar la búsqueda de torneos", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Encuentra tu próximo torneo/i })).toBeVisible();
    await page.getByRole("link", { name: /Buscar eventos, juegos o comunas/i }).click();

    await expect(page).toHaveURL(/\/torneos/);
    await expect(page.getByRole("heading", { name: "Torneos TCG" })).toBeVisible();
  });

  test("CA-02: el filtro por ciudad queda reflejado en la URL", async ({ page }) => {
    await page.goto("/torneos");

    const city = page.getByPlaceholder("Buscar por ciudad o comuna...");
    await city.fill("Santiago");
    await city.press("Enter");

    await expect(page).toHaveURL(/ciudad=Santiago/);
  });
});
