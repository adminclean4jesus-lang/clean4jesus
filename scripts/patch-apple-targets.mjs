import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../node_modules/@bacons/apple-targets/build/", import.meta.url);

function patchFile(file, replacements) {
  const url = new URL(file, root);
  let source = readFileSync(url, "utf8");
  for (const [before, after] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) {
      throw new Error(`No se encontró el ancla esperada en ${file}`);
    }
    source = source.replace(before, after);
  }
  writeFileSync(url, source);
}

patchFile("target.js", [[
  '    "device-activity-monitor": {\n        extensionPointIdentifier: "com.apple.deviceactivity.monitor-extension",\n        frameworks: ["DeviceActivity"],\n        displayName: "Device Activity Monitor",\n    },',
  '    "device-activity-monitor": {\n        extensionPointIdentifier: "com.apple.deviceactivity.monitor-extension",\n        frameworks: ["DeviceActivity"],\n        displayName: "Device Activity Monitor",\n    },\n    "device-activity-report": {\n        extensionPointIdentifier: "com.apple.deviceactivityui.report-extension",\n        frameworks: ["DeviceActivity", "SwiftUI"],\n        displayName: "Device Activity Report",\n    },',
]]);

patchFile("configuration-list.js", [[
  '        case "device-activity-monitor":\n        case "intent":',
  '        case "device-activity-monitor":\n        case "device-activity-report":\n        case "intent":',
]]);

patchFile("target.d.ts", [[
  '    readonly "device-activity-monitor": {\n        readonly extensionPointIdentifier: "com.apple.deviceactivity.monitor-extension";\n        readonly frameworks: readonly ["DeviceActivity"];\n        readonly displayName: "Device Activity Monitor";\n    };',
  '    readonly "device-activity-monitor": {\n        readonly extensionPointIdentifier: "com.apple.deviceactivity.monitor-extension";\n        readonly frameworks: readonly ["DeviceActivity"];\n        readonly displayName: "Device Activity Monitor";\n    };\n    readonly "device-activity-report": {\n        readonly extensionPointIdentifier: "com.apple.deviceactivityui.report-extension";\n        readonly frameworks: readonly ["DeviceActivity", "SwiftUI"];\n        readonly displayName: "Device Activity Report";\n    };',
]]);
