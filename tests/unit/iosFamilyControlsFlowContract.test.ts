import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getIosProtectionText } from "@/features/i18n/iosProtectionText";

describe("Family Controls activation flow", () => {
  it("selects Family Activity items before configuring Managed Settings", () => {
    const source = readFileSync(join(process.cwd(), "app/index.tsx"), "utf8");
    const selectionCheck = source.indexOf("getSelectionSummary()");
    const picker = source.indexOf("presentFamilyActivityPicker()");
    const configure = source.indexOf("configureProtection({");

    expect(selectionCheck).toBeGreaterThan(-1);
    expect(picker).toBeGreaterThan(selectionCheck);
    expect(configure).toBeGreaterThan(picker);
  });

  it("does not reference a missing generated JavaScript native module", () => {
    const source = readFileSync(
      join(process.cwd(), "modules/clean4jesus-ios-protection/index.js"),
      "utf8",
    );
    expect(source).toContain(
      "requireNativeModule('Clean4JesusIosProtectionModule')",
    );
    expect(source).not.toContain("./src/Clean4JesusIosProtectionModule");
  });

  it("shows the iOS protection state and saved selection in one language", () => {
    const source = readFileSync(
      join(process.cwd(), "app/ios-protection.tsx"),
      "utf8",
    );
    const copy = getIosProtectionText("es");

    expect(copy.status("protection_active")).toBe("Protección activa");
    expect(copy.selection({ applications: 3, categories: 2, webDomains: 1 })).toBe(
      "3 apps · 2 categorías · 1 sitio",
    );
    expect(source).toContain("useI18n()");
    expect(source).toContain("copy.status(statusInfo?.status)");
    expect(source).toContain("copy.selection(selection)");
    expect(source).toContain("copy.changeSelection");
  });
});
