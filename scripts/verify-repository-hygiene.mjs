import { access, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const rootEntries = await readdir(root, { withFileTypes: true });
const looseArtifacts = rootEntries
  .filter((entry) => entry.isFile() && /\.(apk|aab|ipa)$/i.test(entry.name))
  .map((entry) => entry.name);

if (looseArtifacts.length > 0) {
  throw new Error(`No se permiten artefactos móviles en la raíz: ${looseArtifacts.join(", ")}`);
}
if (root.toLowerCase().includes("onedrive")) {
  throw new Error("El repositorio activo no puede vivir en OneDrive.");
}

for (const required of ["README.md", "docs/INDEX.md", "docs/REPOSITORY-OPERATIONS.md", "artifacts/apk/current", "artifacts/apk/previous"]) {
  try {
    await access(resolve(root, required));
  } catch {
    throw new Error(`Falta la ruta operativa requerida: ${required}`);
  }
}

console.log("PASS repository hygiene: sin artefactos sueltos y con rutas operativas presentes.");
