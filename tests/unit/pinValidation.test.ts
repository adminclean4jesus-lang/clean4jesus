import { describe, expect, test } from "vitest";

import { isCompletePin, normalizePinInput, pinsMatch } from "../../src/features/pin/pinValidation";

describe("pin validation", () => {
  test("keeps only up to eight digits", () => {
    expect(normalizePinInput("12a3-456789")).toBe("12345678");
  });

  test("supports legacy four-digit PINs and generated eight-digit PINs", () => {
    expect(isCompletePin("1234")).toBe(true);
    expect(isCompletePin("12345678")).toBe(true);
    expect(isCompletePin("1234567")).toBe(false);
    expect(isCompletePin("abcd")).toBe(false);
  });

  test("matches only complete equal PINs", () => {
    expect(pinsMatch("24682468", "24682468")).toBe(true);
    expect(pinsMatch("24682468", "24682469")).toBe(false);
    expect(pinsMatch("246", "246")).toBe(false);
  });
});
