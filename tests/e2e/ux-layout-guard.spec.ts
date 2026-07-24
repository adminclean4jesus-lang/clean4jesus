import { expect, Page, test } from "@playwright/test";

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

async function seedShield(page: Page) {
  await page.addInitScript((shieldState) => {
    localStorage.setItem("clean4jesus.shield.enabled", "true");
    localStorage.setItem("clean4jesus.shield.state", shieldState);
  }, enabledShieldState);
}

test("UX guard: el footer conserva columnas separadas y espacio de lectura", async ({ page }) => {
  test.setTimeout(120_000);
  await seedShield(page);
  await page.goto("/devotional", { waitUntil: "domcontentloaded", timeout: 120_000 });

  const footer = page.getByTestId("persistent-tab-bar");
  await expect(footer).toBeVisible();

  const tabs = await Promise.all(
    ["refugio", "palabra", "comunidad", "ajustes"].map((key) => page.getByTestId(`persistent-tab-${key}`).boundingBox()),
  );

  for (let index = 0; index < tabs.length - 1; index += 1) {
    expect(tabs[index]).not.toBeNull();
    expect(tabs[index + 1]).not.toBeNull();
    expect((tabs[index]?.x ?? 0) + (tabs[index]?.width ?? 0)).toBeLessThanOrEqual(tabs[index + 1]?.x ?? 0);
  }

  await expect(page.getByTestId("devotional-open-plans")).toBeVisible();
  await page.getByTestId("devotional-mode-plans").click();
  await expect(page.getByText("Elige un camino para esta semana")).toBeVisible();
  await expect(page.getByText("Trayecto", { exact: true })).toHaveCount(0);
  const planCard = page.getByTestId("plan-catalog-row-ansiedad-y-soledad");
  const planArt = page.getByTestId("plan-catalog-art-ansiedad-y-soledad");
  const planTitle = page.getByTestId("plan-catalog-title-ansiedad-y-soledad");
  await expect(planCard).toBeVisible();
  await expect(planArt).toBeVisible();
  await expect(planTitle).toBeVisible();
  const cardBox = await planCard.boundingBox();
  const artBox = await planArt.boundingBox();
  const titleBox = await planTitle.boundingBox();
  expect(artBox?.width ?? 0).toBeGreaterThan((cardBox?.width ?? 0) * 0.72);
  expect(artBox?.y ?? 0).toBeLessThan(titleBox?.y ?? 0);
  expect(titleBox?.x ?? 0).toBeGreaterThanOrEqual((cardBox?.x ?? 0) + 16);
  expect((titleBox?.x ?? 0) + (titleBox?.width ?? 0)).toBeLessThanOrEqual((cardBox?.x ?? 0) + (cardBox?.width ?? 0) - 16);
  await expect(page.getByText("Abrir plan", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-planes-mobile.png", fullPage: true });
});

test("UX guard: comunidad conectada muestra acceso seguro y estable", async ({ page }) => {
  test.setTimeout(120_000);
  await seedShield(page);
  await page.goto("/community", { waitUntil: "domcontentloaded", timeout: 120_000 });

  const authGate = page.getByTestId("community-auth-gate");
  await expect(authGate).toBeVisible();
  await expect(page.getByText("Vuelve a caminar acompañado", { exact: true })).toBeVisible();
  await expect(page.getByText("Ingresar", { exact: true })).toBeVisible();
  await expect(page.getByText("Crear cuenta", { exact: true })).toBeVisible();
  await expect(page.getByText(/tu correo nunca se muestra en el feed/i)).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-social-auth-light-mobile.png", fullPage: true });
  await page.getByText("Crear cuenta", { exact: true }).click();
  await expect(page.getByRole("checkbox")).toBeVisible();
  await expect(page.getByText("Aviso de privacidad", { exact: true })).toBeVisible();
  await expect(page.getByText("Reglas de comunidad", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-community-mobile.png", fullPage: true });
});

test("UX guard: el reto antiabuso tiene una salida clara antes de autenticar", async ({ page }) => {
  test.setTimeout(120_000);
  await seedShield(page);
  await page.goto("/community", { waitUntil: "domcontentloaded", timeout: 120_000 });

  const inputs = page.locator("input");
  await inputs.nth(0).fill("qa@clean4jesus.com");
  await inputs.nth(1).fill("ContrasenaDePrueba1");
  await page.getByRole("checkbox").click();
  await page.getByRole("button", { name: "Entrar a comunidad" }).click();

  await expect(page.getByText("Verificación disponible en la app móvil", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar" })).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-captcha-mobile.png", fullPage: true });
});

test("UX guard: la barra inferior conserva estructura en los cuatro destinos", async ({ page }) => {
  test.setTimeout(120_000);
  await seedShield(page);

  const routes = [
    ["/devotional", "ux-qa-palabra-mobile.png"],
    ["/community", "ux-qa-comunidad-mobile.png"],
    ["/perfil", "ux-qa-perfil-mobile.png"],
  ] as const;

  await page.goto("/devotional", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.getByTestId("persistent-tab-bar")).toBeVisible();
  await page.getByTestId("persistent-tab-refugio").click();
  await expect(page.getByTestId("persistent-tab-refugio")).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-refugio-mobile.png", fullPage: true });

  for (const [route, fileName] of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await expect(page.getByTestId("persistent-tab-bar")).toBeVisible();
    await page.screenshot({ path: `artifacts/previews/${fileName}`, fullPage: true });
  }
});

test("UX guard: perfil separa la cuenta de los ajustes y el modo oscuro", async ({ page }) => {
  test.setTimeout(120_000);
  await seedShield(page);
  await page.goto("/perfil", { waitUntil: "domcontentloaded", timeout: 120_000 });

  await expect(page.getByText("Tu espacio", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Ajustes de la aplicación", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-perfil-light-mobile.png", fullPage: true });

  await page.getByTestId("profile-open-settings").click();
  const settingsRows = [
    "settings-protection-apps",
    "settings-trusted-person",
    "settings-interruption",
    "settings-language",
    "settings-appearance",
    "settings-pin",
    "settings-advanced",
  ];
  const rowBoxes = [];
  for (const testId of settingsRows) {
    const row = page.getByTestId(testId);
    await expect(row).toBeVisible();
    const box = await row.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(68);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(280);
    rowBoxes.push(box!);
  }
  expect(rowBoxes[1].y - (rowBoxes[0].y + rowBoxes[0].height)).toBeGreaterThanOrEqual(7);
  expect(rowBoxes[2].y - (rowBoxes[1].y + rowBoxes[1].height)).toBeGreaterThanOrEqual(7);

  for (const width of [320, 360, 393, 412]) {
    await page.setViewportSize({ width, height: 851 });
    await page.goto("/settings", { waitUntil: "domcontentloaded", timeout: 120_000 });
    for (const testId of settingsRows) {
      const box = await page.getByTestId(testId).boundingBox();
      expect(box, `${testId} debe renderizarse a ${width}dp`).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(16);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width - 16);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(68);
    }
  }
  await page.setViewportSize({ width: 393, height: 851 });
  await page.goto("/settings", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.getByText("Protección de apps", { exact: true })).toBeVisible();
  await expect(page.getByText("Pantalla de interrupción", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-ajustes-light-mobile.png", fullPage: true });
  const appearanceSwitch = page.getByTestId("settings-appearance-switch");
  await expect(appearanceSwitch).toBeVisible();
  await expect(appearanceSwitch).toHaveAttribute("role", "switch");
  await appearanceSwitch.click();
  await expect(page.getByText("Modo oscuro", { exact: true })).toBeVisible();
  const darkRows = settingsRows.map((testId) => page.getByTestId(testId));
  for (const row of darkRows) {
    await expect(row).toBeVisible();
    const box = await row.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(68);
  }
  await page.screenshot({ path: "artifacts/previews/ux-qa-ajustes-dark-mobile.png", fullPage: true });

  await page.goto("/devotional", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.getByText("Devocional guiado", { exact: true })).toBeVisible();
  await expect(page.getByText("Palabra para hoy", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-palabra-dark-mobile.png", fullPage: true });

  await page.goto("/community", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible();
  await expect(page.getByTestId("google-brand-icon")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar con Apple" })).toHaveCount(0);
  await expect(page.getByText("Continuar con Google", { exact: true })).toHaveCSS(
    "color",
    "rgb(31, 31, 31)",
  );
  await expect(page.getByRole("button", { name: "Continuar con Google" })).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.getByRole("button", { name: "Continuar con Google" })).toHaveCSS(
    "border-color",
    "rgb(116, 119, 117)",
  );
  const googleButtonBox = await page
    .getByRole("button", { name: "Continuar con Google" })
    .boundingBox();
  const googleIconBox = await page.getByTestId("google-brand-icon").boundingBox();
  const googleLabelBox = await page
    .getByText("Continuar con Google", { exact: true })
    .boundingBox();
  expect(googleButtonBox).not.toBeNull();
  expect(googleButtonBox?.height ?? 0).toBeGreaterThanOrEqual(48);
  expect(googleIconBox?.width ?? 0).toBeGreaterThanOrEqual(19);
  expect(googleIconBox?.width ?? 0).toBeLessThanOrEqual(21);
  expect(Math.abs(
    (googleIconBox?.y ?? 0) + (googleIconBox?.height ?? 0) / 2
      - ((googleLabelBox?.y ?? 0) + (googleLabelBox?.height ?? 0) / 2),
  )).toBeLessThanOrEqual(2);
  expect((googleLabelBox?.x ?? 0) - ((googleIconBox?.x ?? 0) + (googleIconBox?.width ?? 0)))
    .toBeGreaterThanOrEqual(10);
  expect((googleLabelBox?.x ?? 0) - ((googleIconBox?.x ?? 0) + (googleIconBox?.width ?? 0)))
    .toBeLessThanOrEqual(11);
  expect((googleIconBox?.x ?? 0) - (googleButtonBox?.x ?? 0))
    .toBeGreaterThanOrEqual(12);
  expect(
    (googleButtonBox?.x ?? 0) + (googleButtonBox?.width ?? 0)
      - ((googleLabelBox?.x ?? 0) + (googleLabelBox?.width ?? 0)),
  ).toBeGreaterThanOrEqual(12);
  await page.screenshot({ path: "artifacts/previews/ux-qa-social-auth-dark-mobile.png", fullPage: true });

  await page.goto("/devotional", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByTestId("devotional-mode-plans").click();
  await expect(page.getByText("Elige un camino para esta semana", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-planes-dark-mobile.png", fullPage: true });
  await page.getByTestId("plan-catalog-row-ansiedad-y-soledad").click();
  await expect(page.getByText("Hilo conductor", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/previews/ux-qa-plan-detail-dark-mobile.png", fullPage: true });

  const darkSecondaryRoutes = [
    ["/app-protection", "Protección de apps", "ux-qa-app-protection-dark-mobile.png"],
    ["/trusted-person", "Persona de confianza", "ux-qa-trusted-person-dark-mobile.png"],
    ["/interruption-settings", "Tu motivo para volver", "ux-qa-interruption-settings-dark-mobile.png"],
  ] as const;

  for (const [route, title, fileName] of darkSecondaryRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const heading = page.getByText(title, { exact: true }).first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("color", "rgb(244, 247, 251)");
    await page.screenshot({ path: `artifacts/previews/${fileName}`, fullPage: true });
  }
});

test("UX guard: Google conserva geometria profesional en anchos Android", async ({ page }) => {
  test.setTimeout(180_000);
  await seedShield(page);

  for (const width of [320, 360, 393, 412]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/community", { waitUntil: "domcontentloaded", timeout: 120_000 });

    const button = page.getByRole("button", { name: "Continuar con Google" });
    const icon = page.getByTestId("google-brand-icon");
    const label = page.getByText("Continuar con Google", { exact: true });
    await expect(button).toBeVisible();

    const buttonBox = await button.boundingBox();
    const iconBox = await icon.boundingBox();
    const labelBox = await label.boundingBox();

    expect(buttonBox).not.toBeNull();
    expect(iconBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    expect(buttonBox?.height ?? 0).toBeGreaterThanOrEqual(48);
    expect(buttonBox?.x ?? 0).toBeGreaterThanOrEqual(12);
    expect(width - ((buttonBox?.x ?? 0) + (buttonBox?.width ?? 0))).toBeGreaterThanOrEqual(12);
    expect((iconBox?.width ?? 0)).toBeGreaterThanOrEqual(19);
    expect((iconBox?.width ?? 0)).toBeLessThanOrEqual(21);
    expect(Math.abs(
      (iconBox?.y ?? 0) + (iconBox?.height ?? 0) / 2
        - ((labelBox?.y ?? 0) + (labelBox?.height ?? 0) / 2),
    )).toBeLessThanOrEqual(2);
    expect((labelBox?.x ?? 0) - ((iconBox?.x ?? 0) + (iconBox?.width ?? 0)))
      .toBeGreaterThanOrEqual(10);
    expect((labelBox?.x ?? 0) - ((iconBox?.x ?? 0) + (iconBox?.width ?? 0)))
      .toBeLessThanOrEqual(11);
  }
});
