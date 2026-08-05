import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T;

describe("iOS native architecture safety", () => {
  it("uses the legacy architecture only on iOS", () => {
    const appConfig = readJson<{
      expo: { plugins: unknown[] };
    }>("app.json");

    const buildProperties = appConfig.expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === "expo-build-properties",
    ) as
      | [
          string,
          {
            ios?: { newArchEnabled?: boolean };
            android?: { newArchEnabled?: boolean };
          },
        ]
      | undefined;

    expect(buildProperties).toBeDefined();
    expect(buildProperties?.[1].ios?.newArchEnabled).toBe(false);
    expect(buildProperties?.[1].android?.newArchEnabled).toBe(true);
  });

  it("uses the Reanimated generation compatible with the iOS legacy architecture", () => {
    const packageJson = readJson<{
      dependencies: Record<string, string>;
    }>("package.json");

    expect(packageJson.dependencies["react-native-reanimated"]).toMatch(
      /^([~^])?3\.19\./,
    );
    expect(packageJson.dependencies).not.toHaveProperty("react-native-worklets");
    expect(packageJson.dependencies).not.toHaveProperty("nativewind");
  });
});
