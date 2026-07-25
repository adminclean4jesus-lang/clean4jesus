import { expect, test } from "@playwright/test";

const enabledShieldState = JSON.stringify({
  activatedAt: "2026-07-14T12:00:00.000Z",
  disabledAt: null,
  enabled: true,
  nativeStatus: "active",
  primaryDns: "1.1.1.3",
  provider: "cloudflare-family",
  secondaryDns: "1.0.0.3",
  setupComplete: true,
  statusMessage: "Proteccion activa",
});

test("la navegacion persistente conserva cuatro destinos legibles", async ({ page }) => {
  test.setTimeout(120_000);

  await page.addInitScript((shieldState) => {
    localStorage.setItem("clean4jesus.languagePreference", JSON.stringify("es"));
    localStorage.setItem("clean4jesus.shield.enabled", "true");
    localStorage.setItem("clean4jesus.shield.state", shieldState);
  }, enabledShieldState);

  await page.goto("/devotional", { waitUntil: "networkidle", timeout: 120_000 });

  const footer = page.getByTestId("persistent-tab-bar");
  await expect(footer).toBeVisible({ timeout: 120_000 });
  await expect(footer).toContainText("Refugio");
  await expect(footer).toContainText("Palabra");
  await expect(footer).toContainText("Comunidad");
  await expect(footer).toContainText("Mi perfil");
  await expect(page.getByTestId("devotional-open-plans")).toBeVisible();
  const todayMode = page.getByTestId("devotional-mode-today");
  const plansMode = page.getByTestId("devotional-mode-plans");
  const todayModeBox = await todayMode.boundingBox();
  const plansModeBox = await plansMode.boundingBox();
  expect(todayModeBox).not.toBeNull();
  expect(plansModeBox).not.toBeNull();
  expect((todayModeBox?.width ?? 0)).toBeLessThan(100);
  expect((plansModeBox?.width ?? 0)).toBeLessThan(100);
  expect((plansModeBox?.x ?? 0) - ((todayModeBox?.x ?? 0) + (todayModeBox?.width ?? 0))).toBeGreaterThanOrEqual(6);
  expect((plansModeBox?.x ?? 0) + (plansModeBox?.width ?? 0) - (todayModeBox?.x ?? 0)).toBeLessThan(200);
  await expect(page.getByText("Sigue solo lo que ya estás caminando", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Para aplicar", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("devotional-open-plans")).toContainText("Ir a planes");
  const tabBackgrounds = await Promise.all(
    ["refugio", "palabra", "comunidad", "ajustes"].map((key) =>
      page.getByTestId(`persistent-tab-${key}`).evaluate((element) => getComputedStyle(element).backgroundColor),
    ),
  );
  expect(tabBackgrounds.filter((color) => color !== "rgba(0, 0, 0, 0)")).toHaveLength(1);
  expect(tabBackgrounds[1]).not.toBe("rgba(0, 0, 0, 0)");

  const todayBackground = await todayMode.evaluate((element) => getComputedStyle(element).backgroundColor);
  const plansBackground = await plansMode.evaluate((element) => getComputedStyle(element).backgroundColor);
  const todayColor = await page.getByTestId("devotional-mode-today-label").evaluate((element) => getComputedStyle(element).color);
  const plansColor = await page.getByTestId("devotional-mode-plans-label").evaluate((element) => getComputedStyle(element).color);
  expect(todayBackground).toBe("rgb(17, 27, 92)");
  expect(plansBackground).toBe("rgb(255, 255, 255)");
  expect(todayColor).toBe("rgb(255, 255, 255)");
  expect(plansColor).toBe("rgb(17, 27, 92)");
  await plansMode.click();
  await expect.poll(() => plansMode.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(17, 27, 92)");
  await expect.poll(() => todayMode.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");

  const footerBox = await footer.boundingBox();
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  expect(footerBox?.width).toBeGreaterThan(380);
  expect((footerBox?.y ?? 0) + (footerBox?.height ?? 0)).toBeGreaterThanOrEqual(viewportHeight - 2);

  const tabBoxes = await Promise.all(
    ["refugio", "palabra", "comunidad", "ajustes"].map((key) => page.getByTestId(`persistent-tab-${key}`).boundingBox()),
  );
  const labelBoxes = await Promise.all(
    ["refugio", "palabra", "comunidad", "ajustes"].map((key) => page.getByTestId(`persistent-tab-label-${key}`).boundingBox()),
  );

  for (let index = 0; index < tabBoxes.length; index += 1) {
    const tab = tabBoxes[index];
    const label = labelBoxes[index];
    expect(tab).not.toBeNull();
    expect(label).not.toBeNull();
    const expectedCenter = (footerBox?.x ?? 0) + ((footerBox?.width ?? 0) * (index + 0.5)) / 4;
    const tabCenter = (tab?.x ?? 0) + (tab?.width ?? 0) / 2;
    expect((tab?.width ?? 0)).toBeGreaterThanOrEqual((footerBox?.width ?? 0) / 4 - 2);
    expect(Math.abs(tabCenter - expectedCenter)).toBeLessThanOrEqual(2);
    expect((label?.x ?? 0)).toBeGreaterThanOrEqual(tab?.x ?? 0);
    expect((label?.x ?? 0) + (label?.width ?? 0)).toBeLessThanOrEqual((tab?.x ?? 0) + (tab?.width ?? 0));
  }

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual((footerBox?.width ?? 0) + 1);
});

test("el footer y los planes hacen fit en anchos Android comunes", async ({ page }) => {
  test.setTimeout(120_000);

  await page.addInitScript((shieldState) => {
    localStorage.setItem("clean4jesus.languagePreference", JSON.stringify("es"));
    localStorage.setItem("clean4jesus.shield.enabled", "true");
    localStorage.setItem("clean4jesus.shield.state", shieldState);
  }, enabledShieldState);

  for (const width of [320, 360, 393, 412]) {
    await page.setViewportSize({ height: 800, width });
    await page.goto("/devotional", { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.getByTestId("devotional-mode-plans").click();

    const footer = page.getByTestId("persistent-tab-bar");
    const footerBox = await footer.boundingBox();
    expect(Math.abs((footerBox?.width ?? 0) - width)).toBeLessThanOrEqual(1);

    const tabBoxes = await Promise.all(
      ["refugio", "palabra", "comunidad", "ajustes"].map((key) => page.getByTestId(`persistent-tab-${key}`).boundingBox()),
    );
    expect(Math.abs(tabBoxes.reduce((sum, box) => sum + (box?.width ?? 0), 0) - width)).toBeLessThanOrEqual(1);

    const card = page.getByTestId("plan-catalog-row-ansiedad-y-soledad");
    const title = page.getByTestId("plan-catalog-title-ansiedad-y-soledad");
    const cardBox = await card.boundingBox();
    const titleBox = await title.boundingBox();
    expect((cardBox?.x ?? 0)).toBeGreaterThanOrEqual(16);
    expect((cardBox?.x ?? 0) + (cardBox?.width ?? 0)).toBeLessThanOrEqual(width - 16);
    expect((titleBox?.x ?? 0)).toBeGreaterThanOrEqual((cardBox?.x ?? 0) + 16);
    expect((titleBox?.x ?? 0) + (titleBox?.width ?? 0)).toBeLessThanOrEqual((cardBox?.x ?? 0) + (cardBox?.width ?? 0) - 16);
  }
});
