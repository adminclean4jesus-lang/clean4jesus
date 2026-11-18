import { readFile } from "node:fs/promises";

const landing = await readFile(new URL("../web/landing/index.html", import.meta.url), "utf8");
const requiredMarkers = [
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  "Tu teléfono puede ser un refugio",
  "data-mobile-cards",
  "https://tally.so/r/Y5BAzv",
];

for (const marker of requiredMarkers) {
  if (!landing.includes(marker)) {
    throw new Error(`La landing vigente no contiene el marcador requerido: ${marker}`);
  }
}

console.log("Landing vigente: verificada.");
