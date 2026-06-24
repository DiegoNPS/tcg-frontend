import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: "e2e_role",
      value: "admin",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
});

test("CA-08: el administrador recibe una mesa de trabajo accionable", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Administración" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trabajo pendiente" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publicar" })).toBeVisible();
  await expect(page.getByText("profiles", { exact: true })).toHaveCount(0);
});

test("CA-09: la clave del juego sigue al nombre hasta una edición manual", async ({ page }) => {
  await page.goto("/admin");

  await page.getByText("Catálogo de juegos", { exact: true }).click();
  await page.getByLabel("Nombre del juego").fill("Pokémon TCG Pocket");
  await page.getByText("Opciones avanzadas", { exact: true }).click();

  await expect(page.getByLabel("Clave interna")).toHaveValue("pokemon_tcg_pocket");
});

test("CA-10: el panel no genera desplazamiento horizontal en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }));

  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("heading", { name: "Trabajo pendiente" })).toBeVisible();
});

test("CA-11: el administrador puede publicar y asignar roles desde la cola", async ({ page }) => {
  await page.goto("/admin");

  const draft = page.getByRole("listitem").filter({ hasText: "Commander Night" });
  await draft.getByRole("button", { name: "Publicar" }).click();
  await expect(draft.getByText("El evento quedará visible públicamente.", { exact: true })).toBeVisible();
  await draft.getByRole("button", { name: "Confirmar" }).click();
  await expect(draft.getByText("Torneo publicado.", { exact: true })).toBeVisible();

  const user = page.getByRole("listitem").filter({ hasText: "nuevo@example.com" });
  await user.getByRole("combobox", { name: "Rol de usuario" }).selectOption("tienda");
  await user.getByRole("button", { name: "Guardar rol" }).click();
  await expect(user.getByText("Rol actualizado.", { exact: true })).toBeVisible();
});
