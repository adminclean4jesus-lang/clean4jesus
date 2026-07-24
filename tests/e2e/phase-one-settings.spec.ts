import { expect, test } from "@playwright/test";

test("Phase 1 settings expose private customization and a safe exit", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/interruption-settings", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.getByText("Tu motivo para volver", { exact: true })).toBeVisible();
  await expect(page.getByText(/no se sube a Comunidad ni a Supabase/i)).toBeVisible();
  await expect(page.getByLabel("Mensaje de la pantalla de interrupción")).toBeVisible();
  await expect(page.getByLabel("Volver")).toBeVisible();
});

test("Phase 1 trusted-person flow stays private and requires authentication", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/trusted-person", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.getByText("Persona de confianza", { exact: true })).toBeVisible();
  await expect(page.getByText("Primero inicia sesión", { exact: true })).toBeVisible();
  await expect(page.getByText(/solo la persona correcta reciba alertas/i)).toBeVisible();
  await expect(page.getByLabel("Volver")).toBeVisible();
});
