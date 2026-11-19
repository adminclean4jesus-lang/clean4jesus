import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appConfig = JSON.parse(readFileSync(path.join(root, "app.json"), "utf8"));
const readiness = JSON.parse(readFileSync(path.join(root, "config", "production-readiness.json"), "utf8"));
const gradle = readFileSync(path.join(root, "android", "app", "build.gradle"), "utf8");

const expo = appConfig.expo ?? {};
const captcha = expo.extra?.authCaptcha ?? {};
const failures = [];

if (expo.android?.package !== "com.clean4jesus.app") failures.push("package Android inesperado");
if (captcha.enabled !== true) failures.push("CAPTCHA público desactivado");
if (!/^0x4[A-Za-z0-9_-]{10,}$/.test(captcha.siteKey ?? "")) failures.push("site key pública de Turnstile ausente o inválida");
if (captcha.challengeUrl !== "https://verify.clean4jesus.com/turnstile/") failures.push("URL HTTPS del reto Turnstile inválida");
if (readiness.captcha?.serverEnabled !== true) failures.push("CAPTCHA de Supabase no está marcado como activo");
if (!gradle.includes(`versionCode ${expo.android?.versionCode}`)) failures.push("versionCode no coincide entre app.json y Gradle");
if (!gradle.includes(`versionName "${expo.version}"`)) failures.push("versionName no coincide entre app.json y Gradle");

if (failures.length > 0) {
  console.error("Preflight Android bloqueado:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Preflight Android aprobado: ${expo.version} (${expo.android.versionCode}), CAPTCHA público incluido.`);
