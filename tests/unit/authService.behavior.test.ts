import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authorizePasswordRecovery,
  clearPasswordRecovery,
  hasPasswordRecoveryAuthorization,
  exchangeCodeForSession,
  getSession,
  onAuthStateChange,
  signInWithPassword,
  supabaseClient,
  unsubscribe,
  updateUser,
} = vi.hoisted(() => {
  const authorizePasswordRecovery = vi.fn();
  const clearPasswordRecovery = vi.fn();
  const hasPasswordRecoveryAuthorization = vi.fn();
  const exchangeCodeForSession = vi.fn();
  const getSession = vi.fn();
  const onAuthStateChange = vi.fn();
  const signInWithPassword = vi.fn();
  const unsubscribe = vi.fn();
  const updateUser = vi.fn();

  return {
    authorizePasswordRecovery,
    clearPasswordRecovery,
    hasPasswordRecoveryAuthorization,
    exchangeCodeForSession,
    getSession,
    onAuthStateChange,
    signInWithPassword,
    supabaseClient: {
      auth: {
        exchangeCodeForSession,
        getSession,
        onAuthStateChange,
        signInWithPassword,
        updateUser,
      },
    },
    unsubscribe,
    updateUser,
  };
});

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => supabaseClient,
}));

vi.mock("@/features/auth/authRedirect", () => ({
  authCallbackUrl: "clean4jesus://auth/callback",
  recoveryCallbackUrl: () => "clean4jesus://auth/callback?mode=recovery",
}));

vi.mock("@/features/auth/recoveryState", () => ({
  authorizePasswordRecovery,
  clearPasswordRecovery,
  hasPasswordRecoveryAuthorization,
}));

vi.mock("@/features/accountability/accountabilityService", () => ({
  clearAccountabilityDevice: vi.fn(),
}));

import { exchangeAuthCode, signInWithEmail, updatePassword } from "@/features/auth/authService";

describe("comportamiento de authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } });
  });

  it.each([
    ["Invalid login credentials", "El correo o la contraseña no coinciden."],
    ["Email not confirmed", "Confirma tu correo antes de iniciar sesión."],
    ["Email address not authorized", "El servicio de correo aún está en modo interno. Contacta al equipo de Clean4Jesus."],
    ["Error sending confirmation email", "No pudimos enviar el correo. Intenta de nuevo en unos minutos."],
    ["Email rate limit exceeded", "Espera un momento antes de solicitar otro correo."],
    ["For security purposes, you can only request this after 60 seconds", "Espera un momento antes de solicitar otro correo."],
    ["Auth session missing!", "No pudimos completar el acceso. Intenta nuevamente."],
  ])("clasifica el error de sesion %s", async (message, expectedMessage) => {
    signInWithPassword.mockResolvedValueOnce({ error: { message } });

    await expect(signInWithEmail("  PERSONA@EXAMPLE.COM ", "password", "es")).rejects.toThrow(expectedMessage);
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "persona@example.com",
      password: "password",
    });
  });

  it("acepta una sola vez el codigo de recuperacion y explica el segundo consumo", async () => {
    exchangeCodeForSession
      .mockResolvedValueOnce({
        data: { session: { user: { id: "user-1" } }, user: { id: "user-1" } },
        error: null,
      })
      .mockResolvedValueOnce({ data: { session: null, user: null }, error: { message: "PKCE code verifier not found" } });

    await expect(exchangeAuthCode("recovery-code")).resolves.toEqual({ isPasswordRecovery: false });
    await expect(exchangeAuthCode("recovery-code")).rejects.toThrow(
      "El enlace vencio o ya fue usado. Solicita uno nuevo.",
    );
    expect(exchangeCodeForSession).toHaveBeenNthCalledWith(1, "recovery-code");
    expect(exchangeCodeForSession).toHaveBeenNthCalledWith(2, "recovery-code");
    expect(clearPasswordRecovery).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  it("conserva la autorizacion si falla y la limpia solo tras cambiar la contrasena", async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    hasPasswordRecoveryAuthorization.mockResolvedValue(true);
    updateUser
      .mockResolvedValueOnce({ error: { message: "Network request failed" } })
      .mockResolvedValueOnce({ error: null });

    await expect(updatePassword("NuevaClave2026")).rejects.toThrow("No pudimos cambiar la contraseña. Revisa la conexión e intenta otra vez.");
    expect(clearPasswordRecovery).not.toHaveBeenCalled();
    await expect(updatePassword("OtraClave2026")).resolves.toBeUndefined();

    expect(updateUser).toHaveBeenCalledTimes(2);
    expect(clearPasswordRecovery).toHaveBeenCalledTimes(1);
  });
});
