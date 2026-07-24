import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("responsive mobile layout contract", () => {
  it("anchors every persistent tab to a fixed quarter of the native footer", () => {
    const source = readFileSync(resolve("src/components/PersistentTabBar.tsx"), "utf8");

    expect(source).toContain("TAB_POSITION_STYLES");
    expect(source).toContain('left: "25%"');
    expect(source).toContain('right: "25%"');
    expect(source).toContain('position: "absolute"');
    expect(source).not.toContain("useWindowDimensions");
    expect(source).not.toContain("tabWidths");
    expect(source).not.toContain("style={({ pressed })");
    expect(source).not.toContain("flexBasis: 0");
  });

  it("keeps devotional plan artwork in normal document flow", () => {
    const source = readFileSync(resolve("app/(tabs)/devotional.tsx"), "utf8");

    expect(source).toContain("planCardArtworkWidth");
    expect(source).toContain("styles.planCardVisual");
    expect(source).not.toContain('maxWidth: "55%"');
    expect(source).not.toContain("styles.planCardArtwork");
  });
});
