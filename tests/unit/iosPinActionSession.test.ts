import { describe, expect, it } from "vitest";

import {
  consumeIosSensitiveAction,
  grantIosSensitiveAction,
} from "../../src/features/pin/pinSession";

describe("iOS sensitive-action PIN session", () => {
  it("permits exactly one protected action after the guardian PIN is verified", () => {
    grantIosSensitiveAction("edit-ios-limits", 1_000);

    expect(consumeIosSensitiveAction(1_100)).toBe("edit-ios-limits");
    expect(consumeIosSensitiveAction(1_100)).toBeNull();
  });

  it("does not authorize a protected action after its short-lived session expires", () => {
    grantIosSensitiveAction("edit-ios-selection", 1_000);

    expect(consumeIosSensitiveAction(61_001)).toBeNull();
  });
});
