export const MIN_PASSWORD_LENGTH = 10;

export type PasswordCheck = {
  key: "emailFragment" | "hasLetter" | "hasNumber" | "minLength" | "nameFragment";
  label: string;
  passed: boolean;
  required: boolean;
};

export function getPasswordChecks(password: string, options?: { displayName?: string; email?: string }): PasswordCheck[] {
  const normalized = password.trim();
  const email = options?.email?.trim().toLowerCase() ?? "";
  const displayName = options?.displayName?.trim().toLowerCase() ?? "";
  const localPart = email.includes("@") ? email.split("@")[0] ?? "" : email;
  const compactName = displayName.replace(/\s+/g, "");

  return [
    {
      key: "minLength",
      label: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      passed: normalized.length >= MIN_PASSWORD_LENGTH,
      required: true,
    },
    {
      key: "hasLetter",
      label: "Incluye al menos una letra",
      passed: /[a-z]/i.test(normalized),
      required: true,
    },
    {
      key: "hasNumber",
      label: "Incluye al menos un número",
      passed: /\d/.test(normalized),
      required: true,
    },
    {
      key: "emailFragment",
      label: "Evita usar tu correo dentro de la contraseña",
      passed: localPart.length < 3 || !normalized.toLowerCase().includes(localPart),
      required: false,
    },
    {
      key: "nameFragment",
      label: "Evita usar tu nombre visible dentro de la contraseña",
      passed: compactName.length < 3 || !normalized.toLowerCase().includes(compactName),
      required: false,
    },
  ];
}

export function validatePassword(password: string, options?: { displayName?: string; email?: string }) {
  const checks = getPasswordChecks(password, options);
  const missingRequired = checks.filter((check) => check.required && !check.passed);

  if (!missingRequired.length) {
    return { checks, valid: true as const };
  }

  return {
    checks,
    message: "Tu contraseña debe tener al menos 10 caracteres, una letra y un número.",
    valid: false as const,
  };
}
