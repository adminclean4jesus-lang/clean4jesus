import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("robustez UX de auth y ajustes", () => {
  it("expone el fallo de perfil, permite reintentar y bloquea el editor", () => {
    const settings = read("src/features/auth/AccountSettingsCard.tsx");

    expect(settings).toContain('type ProfileLoadState = "error" | "loading" | "ready"');
    expect(settings).toContain('testID="retry-profile-load"');
    expect(settings).toContain('disabled={profileLoadState !== "ready"}');
    expect(settings).toContain('profileLoadState === "ready" && setEditorVisible(true)');
  });

  it("impide eliminaciones concurrentes y no promete anonimizar la evidencia", () => {
    const settings = read("src/features/auth/AccountSettingsCard.tsx");
    const accountText = read("src/features/i18n/accountText.ts");

    expect(settings).toContain("if (deleteInFlight.current) return;");
    expect(settings).toContain("deleteInFlight.current = true;");
    expect(settings).toContain("deleteInFlight.current = false;");
    expect(settings).toContain('editable={!deleting}');
    expect(settings).toContain("copy.deleteBody");
    expect(accountText).toContain("pueden conservar copias del contenido, identificadores y decisiones");
    expect(accountText).not.toContain("conservarse anonimizada");
  });

  it("mantiene una confirmacion visible con guia de dispositivo y resend verificable", () => {
    const gate = read("src/features/auth/CommunityAuthGate.tsx");
    const authText = read("src/features/i18n/authText.ts");

    expect(gate).toContain("copy.openSameDevice");
    expect(authText).toContain("Abre el enlace desde este mismo dispositivo");
    expect(gate).toContain("setConfirmationEmail(email.trim().toLowerCase())");
    expect(gate).toContain('resendStatus === "sent"');
    expect(gate).toContain('resendStatus === "error"');
    expect(gate).toContain("if (!confirmationEmail || resendInFlight.current) return;");
    expect(gate).toContain("copy.resent");
  });

  it("exige consentimiento visible antes de registrar una identidad", () => {
    const gate = read("src/features/auth/CommunityAuthGate.tsx");
    const notice = read("src/features/auth/CommunityLegalNoticeModal.tsx");
    const authText = read("src/features/i18n/authText.ts");

    expect(gate).toContain('mode !== "forgot" && !acceptedPolicies');
    expect(gate).toContain('mode === "signUp" && password !== passwordConfirmation');
    expect(gate).toContain("copy.confirmPassword");
    expect(authText).toContain("Confirmar contraseña");
    expect(gate).toContain("PasswordChecklist");
    expect(gate).toContain('accessibilityRole="checkbox"');
    expect(gate).toContain('setLegalDocument("privacy")');
    expect(gate).toContain('setLegalDocument("guidelines")');
    expect(gate).toContain("if (submitInFlight.current) return;");
    expect(notice).toContain('type CommunityLegalDocument = "guidelines" | "privacy" | "terms"');
    expect(notice).toContain("useI18n");
    expect(notice).toContain("legal.${document}");
  });
});
