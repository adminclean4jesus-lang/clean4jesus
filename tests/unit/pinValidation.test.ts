import { describe, expect, test } from "vitest";

import { isCompletePin, normalizePinInput, pinsMatch } from "../../src/features/pin/pinValidation";

describe("pin validation", () => {
  test("keeps only four digits", () => {
    expect(normalizePinInput("12a3-456")).toBe("1234");
  });

  test("requires exactly four digits", () => {
    expect(isCompletePin("1234")).toBe(true);
    expect(isCompletePin("123")).toBe(false);
    expect(isCompletePin("abcd")).toBe(false);
  });

  test("matches only complete equal pins", () => {
    expect(pinsMatch("2468", "2468")).toBe(true);
    expect(pinsMatch("2468", "2469")).toBe(false);
    expect(pinsMatch("246", "246")).toBe(false);
  });
});
