import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function loadEnvFile() {
  const envPath = path.join(root, ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!supabaseUrl || !publishableKey) {
  console.error("Faltan EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY para verificar runtime_gates.");
  process.exit(1);
}

const endpoint =
  `${supabaseUrl}/rest/v1/runtime_gates?select=platform,minimum_supported_version,recommended_version,hard_block,title,update_url` +
  `&platform=eq.android`;

const response = await fetch(endpoint, {
  headers: {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
  },
});

if (!response.ok) {
  console.error(`runtime_gates respondio ${response.status}. Revisa grants, RLS y Data API.`);
  process.exit(1);
}

const rows = await response.json();
if (!Array.isArray(rows) || rows.length !== 1) {
  console.error("Esperabamos exactamente una fila runtime_gates para android.");
  process.exit(1);
}

const gate = rows[0];
const checks = [
  ["Fila android", gate.platform === "android"],
  ["Minimum supported version", typeof gate.minimum_supported_version === "string" && gate.minimum_supported_version.length > 0],
  ["Recommended version", typeof gate.recommended_version === "string" && gate.recommended_version.length > 0],
  ["Hard block boolean", typeof gate.hard_block === "boolean"],
  ["Titulo", typeof gate.title === "string" && gate.title.length > 0],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failed = true;
}

console.log("\nRuntime gate remoto:");
console.log(JSON.stringify(gate, null, 2));

if (failed) {
  process.exit(1);
}
