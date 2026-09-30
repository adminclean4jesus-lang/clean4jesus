import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const root = process.cwd();
if (root.toLowerCase().includes("onedrive")) {
  throw new Error("Clean4Jesus no compila ni guarda APKs desde OneDrive. Usa C:\\Users\\millo\\Desktop\\Clean4Jesus.");
}

const source = resolve(process.env.C4J_APK_SOURCE ?? "android/app/build/outputs/apk/release/app-release.apk");
const artifacts = resolve("artifacts/apk");
const currentDirectory = resolve(artifacts, "current");
const previousDirectory = resolve(artifacts, "previous");
const current = resolve(currentDirectory, "Clean4Jesus-current.apk");
const previous = resolve(previousDirectory, "Clean4Jesus-previous.apk");

if (!source.startsWith(resolve(root))) {
  throw new Error("La APK de origen debe pertenecer al repositorio activo.");
}
if (!(await exists(source))) {
  throw new Error(`No existe una APK release para rotar: ${source}`);
}
if ((await stat(source)).size < 1_000_000) {
  throw new Error("La APK de origen es demasiado pequeña para ser un artefacto válido.");
}

await Promise.all([mkdir(currentDirectory, { recursive: true }), mkdir(previousDirectory, { recursive: true })]);
if (await exists(current)) await copyFile(current, previous);
await copyFile(source, current);
await Promise.all([cleanDirectory(currentDirectory, basename(current)), cleanDirectory(previousDirectory, basename(previous))]);

console.log(`APK actual: ${current}`);
console.log(`APK anterior: ${await exists(previous) ? previous : "(sin versión previa)"}`);

async function cleanDirectory(directory, keep) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".apk") && entry.name !== keep) {
      await rm(resolve(directory, entry.name), { force: true });
    }
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
