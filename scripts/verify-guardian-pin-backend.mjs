import { readFileSync } from "node:fs";

const appConfig = JSON.parse(readFileSync(new URL("../app.json", import.meta.url), "utf8"));
const supabaseUrl = appConfig.expo?.extra?.supabase?.url;
if (!supabaseUrl?.startsWith("https://")) {
  console.error("No hay una URL pública de Supabase válida en app.json.");
  process.exit(1);
}

const response = await fetch(`${supabaseUrl}/functions/v1/accountability`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ operation: "capabilities" }),
});

if (!response.ok) {
  console.error(`Backend de PIN desalineado: HTTP ${response.status}. Despliega la Edge Function accountability actual.`);
  process.exit(1);
}

const body = await response.json();
if (body?.service !== "accountability" || body?.apiVersion !== 2 || body?.guardianPin !== true) {
  console.error("Backend de PIN desalineado: contrato de capacidades inesperado.");
  process.exit(1);
}

console.log("Backend de PIN aprobado: accountability API v2 con PIN de confianza.");
