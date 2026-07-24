declare const require: (moduleName: string) => unknown;

if (typeof document !== "undefined") {
  document.documentElement.style.setProperty("--css-interop-darkMode", "class dark");
  document.documentElement.classList.add("dark");
}

require("expo-router/entry");
