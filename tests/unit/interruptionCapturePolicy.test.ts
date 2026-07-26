import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const activityPath = resolve(
  process.cwd(),
  "android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt",
);
const source = readFileSync(activityPath, "utf8");

describe("InterruptionActivity capture policy", () => {
  it("allows evidence captures while protecting the PIN panel", () => {
    const onCreate = source.slice(
      source.indexOf("override fun onCreate"),
      source.indexOf("override fun onNewIntent"),
    );
    const revealPin = source.slice(
      source.indexOf("revealPinButton.setOnClickListener"),
      source.indexOf("pinCancel.setOnClickListener"),
    );
    const cancelPin = source.slice(
      source.indexOf("pinCancel.setOnClickListener"),
      source.indexOf("pinPanel.addView"),
    );

    expect(onCreate).not.toContain("FLAG_SECURE");
    expect(revealPin).toContain("addFlags(WindowManager.LayoutParams.FLAG_SECURE)");
    expect(cancelPin).toContain("clearFlags(WindowManager.LayoutParams.FLAG_SECURE)");
    expect(source).toContain("Las capturas pueden incluir tu imagen personalizada.");
  });
});
