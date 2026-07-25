export type RuntimePlatform = "android" | "ios" | "web";

// Node-based unit tests resolve this neutral module. Native and web bundles use
// their platform-specific siblings, keeping React Native internals out of Vitest.
export function getRuntimePlatform(): RuntimePlatform {
  return "android";
}
