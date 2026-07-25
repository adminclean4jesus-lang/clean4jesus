import { Platform } from "react-native";

import type { RuntimePlatform } from "./runtimePlatform";

export function getRuntimePlatform(): RuntimePlatform {
  return Platform.OS === "ios" ? "ios" : "android";
}
