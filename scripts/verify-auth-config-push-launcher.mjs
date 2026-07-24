import { spawn } from "node:child_process";

const command = process.platform === "win32"
  ? {
      executable: process.env.ComSpec ?? "cmd.exe",
      args: ["/d", "/s", "/c", "npx.cmd supabase --version"],
    }
  : {
      executable: "npx",
      args: ["supabase", "--version"],
    };

const child = spawn(command.executable, command.args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
