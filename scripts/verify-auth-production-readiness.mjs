import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");
const checks = [];

function check(name, condition, detail) {
  checks.push({ name, ok: Boolean(condition), detail });
}

const appConfig = JSON.parse(read("app.json"));
const authService = read("src/features/auth/authService.ts");
const supabaseClient = read("src/lib/supabase.ts");
const config = read("supabase/config.toml");
const productionReadiness = JSON.parse(read("config/production-readiness.json"));
const activeConfig = config
  .split(/\r?\n/)
  .filter((line) => !line.trimStart().startsWith("#"))
  .join("\n");
const requiredTemplates = [
  "templates/auth-email/confirmation.html",
  "templates/auth-email/recovery.html",
  "templates/auth-email/password-changed.html",
];

check("Deep link movil", appConfig.expo?.scheme === "clean4jesus", "app.json debe declarar clean4jesus como scheme.");
check("Flujo PKCE", supabaseClient.includes('flowType: "pkce"'), "Supabase debe usar PKCE en el cliente movil.");
check("Confirmacion de correo", config.includes("enable_confirmations = true"), "No se debe autoconfirmar correo en beta.");
check("Contrasena minima", config.includes("minimum_password_length = 10"), "La politica local exige al menos 10 caracteres.");
check("Callback de registro", authService.includes("emailRedirectTo: authCallbackUrl"), "Registro debe volver al deep link de la app.");
check("Callback de recuperacion", authService.includes("redirectTo: recoveryCallbackUrl()"), "Recuperacion debe volver al flujo protegido.");
check("SMTP propio verificado", productionReadiness.smtp?.configured && productionReadiness.smtp?.confirmationTested && productionReadiness.smtp?.recoveryTested && productionReadiness.smtp?.passwordChangedTested, "Completar y registrar las tres pruebas de entrega.");
check("CAPTCHA integrado en cliente", productionReadiness.captcha?.clientIntegrated && authService.includes("captchaToken"), "La app debe enviar el token en ingreso, registro y recuperacion.");
check("CAPTCHA listo en config remota", activeConfig.includes("[auth.captcha]") && activeConfig.includes('provider = "turnstile"') && activeConfig.includes('secret = "env(SUPABASE_AUTH_CAPTCHA_SECRET)"'), "config.toml debe declarar Turnstile con secret por variable de entorno.");
check("CAPTCHA activo extremo a extremo", productionReadiness.captcha?.challengeHosted && productionReadiness.captcha?.serverEnabled, "Challenge publicado; falta exportar SUPABASE_AUTH_CAPTCHA_SECRET y ejecutar `npm run supabase:auth:push`.");
check("Version gate cliente", productionReadiness.versionGate?.clientIntegrated, "La app debe consultar runtime_gates al abrir.");
check("Version gate remoto", productionReadiness.versionGate?.remoteApplied && productionReadiness.versionGate?.androidMinimumSupported, "La tabla runtime_gates debe estar aplicada y con minimo soportado para Android.");
check("Consola de moderacion construida", productionReadiness.moderation?.consoleBuilt && productionReadiness.moderation?.mfaEnforced, "La consola debe compilar y exigir MFA.");
check("Backend de moderacion desplegado", productionReadiness.moderation?.backendDeployed, "Las RPC MFA y la Edge Function deben estar desplegadas.");
check("Primer administrador habilitado", productionReadiness.moderation?.firstAdminAssigned, "Debe existir al menos una cuenta admin confirmada.");
check("Consola de moderacion desplegada", productionReadiness.moderation?.consoleDeployed, "Pendiente: publicar la consola bajo un dominio interno.");

for (const template of requiredTemplates) {
  check(`Plantilla ${path.basename(template)}`, existsSync(path.join(root, template)), `Debe existir ${template}.`);
}

for (const template of requiredTemplates.slice(0, 2)) {
  const content = read(template);
  check(`Enlace seguro en ${path.basename(template)}`, content.includes("{{ .ConfirmationURL }}"), "La plantilla debe conservar el enlace generado por Supabase.");
}

const failures = checks.filter((item) => !item.ok);
for (const item of checks) {
  console.log(`${item.ok ? "PASS" : "BLOCKED"}  ${item.name}${item.ok ? "" : ` - ${item.detail}`}`);
}

console.log(`\nAuth readiness: ${checks.length - failures.length}/${checks.length} controles listos.`);
if (failures.length) {
  console.error("La beta externa permanece bloqueada. Consulta docs/AUTH-PRODUCTION-SETUP.md.");
  process.exitCode = 1;
}
