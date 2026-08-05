declare const require: (moduleName: string) => unknown;

const { Platform } = require("react-native") as typeof import("react-native");
const { enableScreens } = require("react-native-screens") as typeof import("react-native-screens");

// iOS build 5 crashed inside react-native-screens' Fabric snapshot path before
// the first route became interactive. Plain RN views preserve navigation while
// avoiding that native snapshot code. Android keeps native screens enabled.
if (Platform.OS === "ios") {
  enableScreens(false);
}

if (typeof document !== "undefined") {
  document.documentElement.style.setProperty("--css-interop-darkMode", "class dark");
  document.documentElement.classList.add("dark");
}

require("expo-router/entry");
