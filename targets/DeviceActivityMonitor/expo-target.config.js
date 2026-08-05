/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "device-activity-monitor",
  name: "Clean4JesusDeviceActivityMonitor",
  displayName: "Clean4Jesus Activity Monitor",
  bundleIdentifier: ".DeviceActivityMonitor",
  deploymentTarget: "16.0",
  frameworks: ["DeviceActivity", "FamilyControls", "ManagedSettings"],
  entitlements: {
    "com.apple.developer.family-controls": true,
    "com.apple.security.application-groups": config.ios.entitlements["com.apple.security.application-groups"],
  },
});
