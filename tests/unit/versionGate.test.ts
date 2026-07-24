import { describe, expect, it } from "vitest";

import { compareSemanticVersions, evaluateRuntimeGate, type RuntimeGateRecord } from "@/features/runtime/versionGateLogic";

const baseGate: RuntimeGateRecord = {
  hard_block: true,
  message: "Actualiza la app.",
  minimum_supported_version: "1.3.6",
  platform: "android",
  recommended_version: "1.3.6",
  title: "Actualizacion requerida",
  update_url: null,
};

describe("version gate", () => {
  it("compares semantic versions safely", () => {
    expect(compareSemanticVersions("1.3.6", "1.3.6")).toBe(0);
    expect(compareSemanticVersions("1.3.7", "1.3.6")).toBe(1);
    expect(compareSemanticVersions("1.3.5", "1.3.6")).toBe(-1);
    expect(compareSemanticVersions("v1.3.10", "1.3.6")).toBe(1);
    expect(compareSemanticVersions("1.3", "1.3.0")).toBe(0);
  });

  it("hard-blocks versions below the minimum supported version", () => {
    expect(evaluateRuntimeGate("1.3.5", baseGate)).toEqual({
      gate: baseGate,
      status: "hard_block",
    });
  });

  it("passes when the current version meets the gate", () => {
    expect(evaluateRuntimeGate("1.3.6", baseGate)).toEqual({
      gate: baseGate,
      status: "pass",
    });
  });

  it("returns soft update when only the recommended version is higher", () => {
    const gate = { ...baseGate, minimum_supported_version: "1.3.4", recommended_version: "1.3.8" };

    expect(evaluateRuntimeGate("1.3.6", gate)).toEqual({
      gate,
      status: "soft_update",
    });
  });
});
