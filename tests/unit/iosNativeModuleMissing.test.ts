import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios", Version: "18.5" },
}));

vi.mock("expo-modules-core", () => ({
  requireOptionalNativeModule: () => null,
}));

import { iosProtectionService } from "../../src/features/iosProtection/iosProtectionService.ios";

describe("protecciÃ³n iOS sin puente nativo", () => {
  it("informa un error de compilaciÃ³n y no simula un permiso denegado", async () => {
    await expect(
      iosProtectionService.requestAuthorization(),
    ).rejects.toMatchObject({
      code: "MODULE_NOT_FOUND",
    });
    await expect(
      iosProtectionService.getProtectionCapabilities(),
    ).rejects.toMatchObject({
      code: "MODULE_NOT_FOUND",
    });
  });
});
