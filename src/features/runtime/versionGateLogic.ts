export type RuntimeGateRecord = {
  hard_block: boolean;
  message: string;
  minimum_supported_version: string;
  platform: "android" | "ios";
  recommended_version: string;
  title: string;
  update_url: string | null;
};

export type VersionGateDecision =
  | { reason: "missing_config"; status: "pass" }
  | { gate: RuntimeGateRecord; status: "pass" }
  | { gate: RuntimeGateRecord; status: "soft_update" }
  | { gate: RuntimeGateRecord; status: "hard_block" };

export function compareSemanticVersions(left: string, right: string) {
  const leftParts = normalizeVersion(left);
  const rightParts = normalizeVersion(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

export function evaluateRuntimeGate(currentVersion: string, gate: RuntimeGateRecord): VersionGateDecision {
  if (compareSemanticVersions(currentVersion, gate.minimum_supported_version) < 0) {
    return { gate, status: gate.hard_block ? "hard_block" : "soft_update" };
  }

  if (compareSemanticVersions(currentVersion, gate.recommended_version) < 0) {
    return { gate, status: "soft_update" };
  }

  return { gate, status: "pass" };
}

function normalizeVersion(value: string) {
  return value
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}
