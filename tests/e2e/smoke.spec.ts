import { expect, test } from "@playwright/test";

test("Clean4Jesus opens without runtime overlay", async ({ page }) => {
  test.setTimeout(120_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120_000 });

  await expect(page.getByText("Clean4Jesus").first()).toBeVisible();
  await expect(page.getByText("Refugio diario").first()).toBeVisible();
  await expect(page.getByText("Primero configuramos la protección").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Preparar refugio/i }).first()).toBeVisible();
  const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
  expect(bodyText).not.toContain("Uncaught Error");
  expect(bodyText).not.toMatch(/Cannot manually set color scheme/i);
  expect(bodyText).not.toMatch(/Ãƒ|Ã¢â‚¬Å“|Ã¢â‚¬|Ã°Å¸/i);
  expect(pageErrors).toEqual([]);
});

