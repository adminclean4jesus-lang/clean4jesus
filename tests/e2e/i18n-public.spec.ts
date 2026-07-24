import { expect, test } from "@playwright/test";

const enabledShieldState = JSON.stringify({
  activatedAt: "2026-07-21T12:00:00.000Z",
  disabledAt: null,
  enabled: true,
  nativeStatus: "active",
  primaryDns: "1.1.1.3",
  provider: "cloudflare-family",
  secondaryDns: "1.0.0.3",
  setupComplete: true,
  statusMessage: "active",
});

const locales = [
  { catalog: "Elige un camino para esta semana", community: "Comunidad", language: "es", plans: "Planes", refuge: "Refugio", title: "Devocional guiado", today: "Hoy", word: "Palabra" },
  { catalog: "Choose a path for this week", community: "Community", language: "en", plans: "Plans", refuge: "Refuge", title: "Guided devotional", today: "Today", word: "Word" },
  { catalog: "Choisissez un chemin pour cette semaine", community: "Communauté", language: "fr", plans: "Plans", refuge: "Refuge", title: "Dévotion guidée", today: "Aujourd'hui", word: "Parole" },
  { catalog: "Escolha um caminho para esta semana", community: "Comunidade", language: "pt", plans: "Planos", refuge: "Refúgio", title: "Devocional guiado", today: "Hoje", word: "Palavra" },
] as const;

for (const locale of locales) {
  test(`la interfaz publica renderiza ${locale.language} sin perder estructura`, async ({ page }) => {
    await page.addInitScript(({ language, shieldState }) => {
      localStorage.setItem("clean4jesus.languagePreference", JSON.stringify(language));
      localStorage.setItem("clean4jesus.shield.enabled", "true");
      localStorage.setItem("clean4jesus.shield.state", shieldState);
    }, { language: locale.language, shieldState: enabledShieldState });

    await page.goto("/devotional", { waitUntil: "domcontentloaded", timeout: 120_000 });

    await expect(page.getByText(locale.title, { exact: true })).toBeVisible();
    await expect(page.getByTestId("devotional-mode-today")).toContainText(locale.today);
    await expect(page.getByTestId("devotional-mode-plans")).toContainText(locale.plans);

    const footer = page.getByTestId("persistent-tab-bar");
    await expect(footer).toContainText(locale.refuge);
    await expect(footer).toContainText(locale.word);
    await expect(footer).toContainText(locale.community);

    await page.getByTestId("devotional-mode-plans").click();
    await expect(page.getByText(locale.catalog, { exact: true })).toBeVisible();

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
}
