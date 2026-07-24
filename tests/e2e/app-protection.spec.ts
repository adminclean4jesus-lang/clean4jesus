import { expect, test } from "@playwright/test";

test("Proteccion de apps exige PIN antes de crear reglas", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/app-protection", { waitUntil: "domcontentloaded", timeout: 120_000 });

  await expect(page.getByText("Protección de apps").first()).toBeVisible();
  await expect(page.getByTestId("app-protection-create-pin")).toBeVisible();
  await expect(page.getByText(/Crea el PIN del guardián antes de activar reglas por app/i)).toBeVisible();
});
