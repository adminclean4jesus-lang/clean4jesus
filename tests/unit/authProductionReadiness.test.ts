import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");

describe("preflight de Auth para beta", () => {
  it("aprueba el checklist cuando la infraestructura de Auth ya esta activa", () => {
    const result = spawnSync(process.execPath, ["scripts/verify-auth-production-readiness.mjs"], {
      cwd: root,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS  SMTP propio verificado");
    expect(result.stdout).toContain("PASS  CAPTCHA integrado en cliente");
    expect(result.stdout).toContain("PASS  CAPTCHA activo extremo a extremo");
    expect(result.stdout).toContain("PASS  Consola de moderacion desplegada");
    expect(result.stdout).toContain("Auth readiness:");
  });
});
