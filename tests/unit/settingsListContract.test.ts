import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("contrato visual de Ajustes", () => {
  it("presenta acciones como lista simple sin iconos decorativos por ajuste", () => {
    const source = readFileSync("app/settings.tsx", "utf8");

    expect(source).toContain("function SettingsRow");
    expect(source).not.toMatch(/leadingIcon|iconWrap|settingsIcon/);
    expect(source).not.toMatch(/name="(?:shield|account-heart|image|translate|weather-night)"/);
    expect(source).not.toContain("trailingIcon");
    expect(source).not.toMatch(/name=\{trailingIcon\}/);
  });

  it("conserva español, inglés y francés con su escritura correcta", () => {
    const source = readFileSync("src/features/i18n/i18n.ts", "utf8");

    expect(source).toContain("Español");
    expect(source).toContain("English");
    expect(source).toContain("Français");
    expect(source).not.toContain("Ã");
  });
});
