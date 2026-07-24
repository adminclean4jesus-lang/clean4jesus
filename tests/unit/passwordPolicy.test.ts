import { describe, expect, it } from "vitest";

import { getPasswordChecks, validatePassword } from "@/features/auth/passwordPolicy";

describe("passwordPolicy", () => {
  it("rechaza contrasenas sin longitud minima o numero", () => {
    expect(validatePassword("caminoconcristo")).toEqual({
      checks: getPasswordChecks("caminoconcristo"),
      message: "Tu contraseña debe tener al menos 10 caracteres, una letra y un número.",
      valid: false,
    });
  });

  it("acepta una contrasena suficientemente fuerte", () => {
    expect(validatePassword("Camino2026")).toEqual({
      checks: getPasswordChecks("Camino2026"),
      valid: true,
    });
  });

  it("marca como recomendacion no incluir correo ni nombre", () => {
    const checks = getPasswordChecks("emmanuel2026", {
      displayName: "Emmanuel Lopez",
      email: "emmanuel@example.com",
    });

    expect(checks.find((check) => check.key === "emailFragment")?.passed).toBe(false);
    expect(checks.find((check) => check.key === "nameFragment")?.passed).toBe(true);
  });
});
