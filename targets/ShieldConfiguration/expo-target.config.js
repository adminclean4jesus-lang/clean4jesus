/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "shield-config",
  name: "Clean4JesusShieldConfiguration",
  displayName: "Clean4Jesus Shield",
  bundleIdentifier: ".ShieldConfiguration",
  deploymentTarget: "16.0",
  frameworks: ["ManagedSettings", "ManagedSettingsUI", "UIKit"],
  entitlements: {
    "com.apple.developer.family-controls": true,
    "com.apple.security.application-groups": config.ios.entitlements["com.apple.security.application-groups"],
  },
});
