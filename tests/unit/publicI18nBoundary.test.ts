import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { AuthServiceErrorCode } from "../../src/features/auth/authService";
import type { AuthSessionErrorCode } from "../../src/features/auth/authSession";
import {
  getAuthErrorMessage,
  getAuthSessionErrorMessage,
} from "../../src/features/i18n/authAuxText";
import { supportedLanguages } from "../../src/features/i18n/i18n";

const root = path.resolve(import.meta.dirname, "../..");

function listTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listTsxFiles(fullPath)
      : entry.name.endsWith(".tsx")
        ? [fullPath]
        : [];
  });
}

const authCodes: AuthServiceErrorCode[] = [
  "access_failed",
  "already_registered",
  "captcha_failed",
  "delete_failed",
  "delete_unconfirmed",
  "display_name_invalid",
  "email_invalid",
  "email_not_authorized",
  "email_not_confirmed",
  "email_rate_limited",
  "email_send_failed",
  "invalid_credentials",
  "password_recovery_invalid",
  "password_update_failed",
  "reauthentication_failed",
  "sign_out_failed",
  "weak_password",
];

const sessionCodes: AuthSessionErrorCode[] = [
  "offline_session_preserved",
  "session_expired",
  "session_verification_failed",
];

describe("frontera publica de internacionalizacion", () => {
  it("resuelve cada error de autenticacion y sesion en los cuatro idiomas", () => {
    for (const language of supportedLanguages) {
      for (const code of authCodes) {
        expect(getAuthErrorMessage({ code }, language, "__fallback__")).not.toBe("__fallback__");
      }
      for (const code of sessionCodes) {
        expect(getAuthSessionErrorMessage(code, language)).toBeTruthy();
      }
    }
  });

  it("no expone mensajes tecnicos crudos en componentes publicos", () => {
    const publicFiles = [
      ...listTsxFiles(path.join(root, "app")),
      ...listTsxFiles(path.join(root, "src")),
    ].filter((file) => !file.includes(`${path.sep}features${path.sep}i18n${path.sep}`));

    for (const file of publicFiles) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/\berror\.message\b/);
      expect(source, file).not.toContain("Miembro de la comunidad");
      expect(source, file).not.toContain("Recordatorios de Palabra");
    }
  });
});
