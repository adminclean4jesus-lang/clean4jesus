module.exports = {
  type: "shield-config",
  name: "ShieldConfigurationExtension",
  deploymentTarget: "16.0",
  images: {
    Clean4JesusOfficialMark: "../../assets/icon.png",
  },
  entitlements: {
    "com.apple.developer.family-controls": true,
    "com.apple.security.application-groups": ["group.com.clean4jesus.app"]
  }
};
