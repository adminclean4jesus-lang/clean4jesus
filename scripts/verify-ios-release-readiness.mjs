import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
const readText = (file) => readFileSync(path.join(root, file), "utf8");
const checks = [];

function check(name, condition, detail) {
  checks.push({ name, ok: Boolean(condition), detail });
}

const appConfig = readJson("app.json").expo;
const easConfig = readJson("eas.json");
const readiness = readJson("config/ios-release-readiness.json");

check("Bundle ID iOS", appConfig.ios?.bundleIdentifier === "com.clean4jesus.app", "Debe conservar el identificador oficial de Clean4Jesus.");
check("Deep link compartido", appConfig.scheme === "clean4jesus", "OAuth y enlaces de correo deben volver al scheme movil oficial.");
check("Perfil simulador", Boolean(easConfig.build?.["ios-simulator"]?.ios?.simulator), "Debe existir un perfil EAS para QA sin dispositivo fisico.");
check("Perfil TestFlight", easConfig.build?.production?.ios?.simulator === false, "Production debe preparar un binario para dispositivo real.");
check("Frontera de plataforma", existsSync(path.join(root, "src/features/shield/protectionPlatform.ts")), "iOS no puede reutilizar el motor Android.");
check("Ruta iOS honesta", existsSync(path.join(root, "app/ios-protection.tsx")), "El usuario debe ver el estado real antes de tener proteccion nativa.");
check("Arquitectura documentada", existsSync(path.join(root, "docs/ADR-006-IOS-PROTECTION-ARCHITECTURE.md")), "La decision de plataforma debe quedar versionada.");
check("Guia Apple", existsSync(path.join(root, "docs/IOS-APPLE-HANDOFF.md")), "La configuracion externa debe poder retomarse sin improvisar.");
check("Apple Developer", readiness.appleDeveloper.enrolled && Boolean(readiness.appleDeveloper.teamId), "Requiere membresia Apple Developer y Team ID.");
check("App Store Connect", readiness.appStoreConnect.appCreated && Boolean(readiness.appStoreConnect.appStoreId), "Crear el registro de la app antes de TestFlight.");
check("Family Controls", readiness.familyControls.entitlementApproved && Boolean(readiness.familyControls.appGroupId), "Apple debe aprobar Family Controls y el App Group.");
check("Extensiones de proteccion", readiness.familyControls.extensionsImplemented && readiness.familyControls.deviceValidated, "Device Activity y Shield requieren implementacion y prueba en iPhone real.");
check("Notificaciones APNs", readiness.notifications.apnsKeyConfigured && readiness.notifications.deviceValidated, "Las notificaciones push iOS requieren APNs y evidencia en dispositivo.");
check("Google OAuth iOS", readiness.googleOAuth.iosClientConfigured && readiness.googleOAuth.deviceValidated, "Configurar y probar el cliente OAuth para el bundle iOS.");
check("TestFlight", readiness.testFlight.internalBuildUploaded && readiness.testFlight.privacyDeclared, "Subir una build firmada y completar App Privacy.");

const failures = checks.filter((item) => !item.ok);
for (const item of checks) {
  console.log(`${item.ok ? "PASS" : "BLOCKED"}  ${item.name}${item.ok ? "" : ` - ${item.detail}`}`);
}

console.log(`\niOS readiness: ${checks.length - failures.length}/${checks.length} controles listos.`);
if (failures.length) {
  console.error("iOS no esta listo para TestFlight. Consulta docs/IOS-APPLE-HANDOFF.md.");
  process.exitCode = 1;
}

void readText;
