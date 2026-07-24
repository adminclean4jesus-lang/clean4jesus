import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const source = await readFile(path.join(root, ".env.local"), "utf8");
const values = Object.fromEntries(
  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const url = values.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = values.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const turnstileSiteKey = values.EXPO_PUBLIC_TURNSTILE_SITE_KEY?.trim();

if (!url || !publishableKey || !turnstileSiteKey) {
  console.error("Faltan las variables publicas de Supabase o Turnstile en .env.local.");
  process.exit(1);
}

const command = process.platform === "win32"
  ? {
      executable: process.env.ComSpec ?? "cmd.exe",
      args: ["/d", "/s", "/c", "npm.cmd run build"],
    }
  : {
      executable: "npm",
      args: ["run", "build"],
    };

const child = spawn(command.executable, command.args, {
  cwd: path.join(root, "moderation-console"),
  env: {
    ...process.env,
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    VITE_TURNSTILE_SITE_KEY: turnstileSiteKey,
  },
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
