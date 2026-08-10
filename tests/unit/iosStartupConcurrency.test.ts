import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("iOS startup concurrency safety", () => {
  it("keeps the public runtime gate independent from authenticated Supabase storage", () => {
    const runtimeGate = source("src/features/runtime/versionGateService.ts");
    const rootLayout = source("app/_layout.tsx");

    expect(runtimeGate).not.toContain("@/lib/supabase");
    expect(runtimeGate).not.toContain("getSupabaseClient");
    expect(runtimeGate).toContain("fetch(");
    expect(rootLayout.indexOf("<VersionGateProvider>")).toBeLessThan(
      rootLayout.indexOf("<DevotionalCatalogProvider>"),
    );
  });

  it("initializes auth from one subscription without a zero-delay timer", () => {
    const authProvider = source("src/features/auth/AuthProvider.tsx");

    expect(authProvider).toContain("onAuthStateChange");
    expect(authProvider).toContain('Platform.OS === "android"');
    expect(authProvider).toContain("setPendingVerification");
    expect(authProvider).toContain("INITIAL_SESSION");
  });

  it("serializes native reads on the first iOS protection screen", () => {
    const iosProtection = source("app/ios-protection.tsx");
    const refreshStart = iosProtection.indexOf("const refresh = useCallback");
    const refreshEnd = iosProtection.indexOf("const run = async", refreshStart);
    const refreshSource = iosProtection.slice(refreshStart, refreshEnd);

    expect(refreshSource).not.toContain("Promise.all");
    expect(refreshSource).toContain("catch");
  });
});
