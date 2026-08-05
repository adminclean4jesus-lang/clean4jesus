import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("iOS startup font safety", () => {
  it("keeps iOS startup away from native screens snapshots and notification listeners", () => {
    const entry = readFileSync(resolve(process.cwd(), "index.ts"), "utf8");
    const layout = readFileSync(resolve(process.cwd(), "app/_layout.tsx"), "utf8");
    const reminders = readFileSync(resolve(process.cwd(), "src/features/devotionalPlans/devotionalReminderService.ts"), "utf8");

    expect(entry).toContain('Platform.OS === "ios"');
    expect(entry).toContain("enableScreens(false)");
    expect(layout).not.toContain('import * as Notifications from "expo-notifications"');
    expect(layout.match(/Platform\.OS !== "android"/g)).toHaveLength(2);
    expect(reminders.indexOf("function configureNotificationHandler")).toBeLessThan(
      reminders.indexOf("Notifications.setNotificationHandler"),
    );
  });

  it("does not load bundled fonts dynamically during application startup", () => {
    const layout = readFileSync(resolve(process.cwd(), "app/_layout.tsx"), "utf8");

    expect(layout).not.toContain("useFonts(");
    expect(layout).not.toContain("@expo-google-fonts/");
  });

  it("does not bundle or register an icon font during startup", () => {
    const config = readFileSync(join(process.cwd(), "app.json"), "utf8");
    const appSources = ["app", "src"].flatMap((directory) => readdirSync(join(process.cwd(), directory), { encoding: "utf8", recursive: true })
      .filter((entry) => entry.endsWith(".tsx") || entry.endsWith(".ts"))
      .map((entry) => readFileSync(join(process.cwd(), directory, entry), "utf8")))
      .join("\n");

    expect(config).not.toContain('"expo-font"');
    expect(config).not.toContain("MaterialCommunityIcons.ttf");
    expect(appSources).not.toContain("@expo/vector-icons");
    expect(appSources).not.toContain("Material Design Icons");
  });
});
