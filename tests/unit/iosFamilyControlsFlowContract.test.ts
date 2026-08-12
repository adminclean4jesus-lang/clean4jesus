import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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
});
