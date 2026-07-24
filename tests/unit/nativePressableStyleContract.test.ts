import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("contrato de estilos nativos criticos", () => {
  it("evita callbacks de estilo en Google y las filas de Ajustes", () => {
    const settings = readFileSync("app/settings.tsx", "utf8");
    const auth = readFileSync(
      "src/features/auth/CommunityAuthGate.tsx",
      "utf8",
    );

    expect(settings).toContain("style={styles.row}");
    expect(auth).toContain("styles.socialButton,");
    expect(settings).not.toMatch(/style=\{\(\{\s*pressed\s*\}\)/);
    expect(auth).not.toMatch(/style=\{\(\{\s*pressed\s*\}\)/);
  });
});
