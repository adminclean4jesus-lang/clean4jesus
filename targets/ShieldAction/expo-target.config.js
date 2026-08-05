/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "shield-action",
  name: "Clean4JesusShieldAction",
  displayName: "Clean4Jesus Shield Actions",
  bundleIdentifier: ".ShieldAction",
  deploymentTarget: "16.0",
  frameworks: ["ManagedSettings"],
  entitlements: {
    "com.apple.developer.family-controls": true,
    "com.apple.security.application-groups": config.ios.entitlements["com.apple.security.application-groups"],
  },
});
