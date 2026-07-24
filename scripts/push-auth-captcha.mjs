import { spawn } from "node:child_process";
import path from "node:path";

const secret = process.env.SUPABASE_AUTH_CAPTCHA_SECRET?.trim();

if (!secret) {
  console.error("Falta SUPABASE_AUTH_CAPTCHA_SECRET en esta terminal.");
  console.error('Antes de continuar, ejecuta: $env:SUPABASE_AUTH_CAPTCHA_SECRET="TU_SECRET_DE_TURNSTILE"');
  process.exit(1);
}

if (secret.length < 20) {
  console.error("El secret de Turnstile parece incompleto. Revisa el valor antes de empujar la configuracion.");
  process.exit(1);
}

const cwd = path.resolve(import.meta.dirname, "..");
const command = process.platform === "win32"
  ? {
      executable: process.env.ComSpec ?? "cmd.exe",
      // Node 24 cannot spawn a .cmd executable directly. This command is fixed
      // and does not interpolate secrets or user-controlled values.
      args: ["/d", "/s", "/c", "npx.cmd supabase config push"],
    }
  : {
      executable: "npx",
      args: ["supabase", "config", "push"],
    };

const child = spawn(command.executable, command.args, {
  cwd,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
