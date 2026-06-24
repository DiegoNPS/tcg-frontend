import { expect, test } from "@playwright/test";

test("CA-03: se informa un error cuando las credenciales son rechazadas", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Credenciales de prueba rechazadas" }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("Correo").fill("jugador@example.com");
  await page.getByLabel("Contraseña").fill("incorrecta");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByText("Credenciales de prueba rechazadas", { exact: true })).toBeVisible();
});
