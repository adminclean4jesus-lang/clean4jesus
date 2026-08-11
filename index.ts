declare const require: (moduleName: string) => unknown;

const { Platform } = require("react-native") as typeof import("react-native");
const { enableScreens } = require("react-native-screens") as typeof import("react-native-screens");

// Keep iOS on plain React Native views. The native screens/Fabric snapshot
// path can block the main run loop during XCUITest cold-launch snapshots and
// prevent Maestro from terminating the app between repetitions.
if (Platform.OS === "ios") {
  enableScreens(false);
}

if (typeof document !== "undefined") {
  document.documentElement.style.setProperty("--css-interop-darkMode", "class dark");
  document.documentElement.classList.add("dark");
}

require("expo-router/entry");
